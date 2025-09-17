import mongoose from 'mongoose';
import slugify from 'slugify';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,   // keep only this (unique + required)
    required: true
  },
  content: {
    type: String,
    required: true,
    minlength: 50
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Technology',
      'Lifestyle',
      'Travel',
      'Food',
      'Health',
      'Business',
      'Education',
      'Entertainment',
      'Sports',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  readingTime: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
blogSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Generate slug + reading time + published date before saving
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }

  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Ensure unique slug (append -1, -2 if duplicate found)
blogSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  let baseSlug = this.slug;
  let counter = 1;

  while (true) {
    const existingBlog = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });

    if (!existingBlog) break;

    this.slug = `${baseSlug}-${counter}`;
    counter++;
  }

  next();
});

// Indexes for queries (EXCEPT slug duplicate index)
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1, status: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
