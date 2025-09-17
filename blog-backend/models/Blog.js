import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Blog from '../models/Blog.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import slugify from 'slugify';

const router = express.Router();

// Validation middleware
const validateBlog = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters')
    .trim(),
  body('content')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  body('category')
    .isIn(['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status')
];

// Get all published blogs with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('tag').optional().trim(),
  query('search').optional().trim(),
  query('author').optional().isMongoId().withMessage('Invalid author ID')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: 'published', isActive: true };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = { $in: [req.query.tag] };
    if (req.query.author) filter.author = req.query.author;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'username firstName lastName fullName avatar')
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      blogs,
      pagination: { currentPage: page, totalPages, totalBlogs: total, hasNext: page < totalPages, hasPrev: page > 1 }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error fetching blogs' });
  }
});

// Get single blog by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published', isActive: true })
      .populate('author', 'username firstName lastName fullName avatar bio')
      .populate('comments.author', 'username firstName lastName fullName avatar');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.views += 1;
    await blog.save();

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error fetching blog' });
  }
});

// Get single blog by ID for editing
router.get('/edit/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id })
      .populate('author', 'username firstName lastName fullName avatar');

    if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' });

    res.json({ blog });
  } catch (error) {
    console.error('Get blog for edit error:', error);
    res.status(500).json({ message: 'Server error fetching blog' });
  }
});

// Create new blog
router.post('/', authenticateToken, validateBlog, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const { title, content, category, tags, excerpt, featuredImage, status } = req.body;

    const blog = new Blog({
      title,
      slug: slugify(title, { lower: true, strict: true }) + '-' + Date.now(), // auto-generate unique slug
      content,
      category,
      tags: tags || [],
      excerpt,
      featuredImage,
      status: status || 'draft',
      author: req.user._id
    });

    await blog.save();
    await blog.populate('author', 'username firstName lastName fullName avatar');

    res.status(201).json({ message: 'Blog created successfully', blog });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error creating blog' });
  }
});

// Update blog
router.put('/:id', authenticateToken, validateBlog, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id });
    if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' });

    const { title, content, category, tags, excerpt, featuredImage, status } = req.body;

    blog.title = title;
    blog.content = content;
    blog.category = category;
    blog.tags = tags || [];
    blog.excerpt = excerpt;
    blog.featuredImage = featuredImage;
    blog.status = status || blog.status;

    await blog.save();
    await blog.populate('author', 'username firstName lastName fullName avatar');

    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error updating blog' });
  }
});

// Delete blog
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id });
    if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' });

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error deleting blog' });
  }
});

// Get user's own blogs
router.get('/user/my-blogs', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { author: req.user._id, isActive: true };
    if (req.query.status) filter.status = req.query.status;

    const blogs = await Blog.find(filter)
      .populate('author', 'username firstName lastName fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      blogs,
      pagination: { currentPage: page, totalPages, totalBlogs: total, hasNext: page < totalPages, hasPrev: page > 1 }
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({ message: 'Server error fetching user blogs' });
  }
});

// Like/Unlike blog
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const userLikeIndex = blog.likes.indexOf(req.user._id);
    if (userLikeIndex > -1) blog.likes.splice(userLikeIndex, 1);
    else blog.likes.push(req.user._id);

    await blog.save();

    res.json({ message: userLikeIndex > -1 ? 'Blog unliked' : 'Blog liked', likeCount: blog.likes.length, isLiked: userLikeIndex === -1 });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Server error processing like' });
  }
});

// Add comment to blog
router.post('/:id/comments', authenticateToken, [
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment content is required and cannot exceed 1000 characters').trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const comment = { author: req.user._id, content: req.body.content, createdAt: new Date() };
    blog.comments.push(comment);
    await blog.save();

    await blog.populate('comments.author', 'username firstName lastName fullName avatar');
    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// Get blog categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'];
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// Get popular tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published', isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ tags: tags.map(tag => ({ name: tag._id, count: tag.count })) });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error fetching tags' });
  }
});

export default router;
