import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Eye, 
  Heart,
  MessageCircle,
  ArrowLeft,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getBlog(slug);
      const blogData = response.data.blog;
      setBlog(blogData);
      setLikeCount(blogData.likeCount);
      
      // Check if current user has liked this blog
      if (isAuthenticated && user) {
        setIsLiked(blogData.likes.includes(user.id));
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        navigate('/blogs');
        toast.error('Blog not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like this article');
      return;
    }

    try {
      const response = await blogAPI.likeBlog(blog._id);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like article');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await blogAPI.addComment(blog._id, { content: comment });
      setBlog(prev => ({
        ...prev,
        comments: [...prev.comments, response.data.comment]
      }));
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
          <Button asChild>
            <Link to="/blogs">Back to Blogs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/blogs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Link>
        </Button>

        {/* Article Header */}
        <article className="mb-8">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{blog.category}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatReadTime(blog.readTime)}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {blog.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={blog.author.avatar} alt={blog.author.fullName} />
                  <AvatarFallback>
                    {blog.author.firstName?.[0]}{blog.author.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{blog.author.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    Published on {formatDate(blog.publishedAt)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isAuthenticated && user?.id === blog.author._id && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/edit/${blog._id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-8">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap leading-relaxed">
              {blog.content}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Article Stats & Actions */}
          <div className="flex items-center justify-between py-6 border-t border-b">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {blog.views} views
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {blog.commentCount} comments
              </div>
            </div>
            
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center space-x-2"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>
          </div>
        </article>

        {/* Comments Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Comments ({blog.comments.length})
          </h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleComment}>
                  <div className="flex space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.fullName} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-3"
                        rows={3}
                      />
                      <Button type="submit" disabled={submittingComment}>
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Please login to join the conversation
                </p>
                <Button asChild>
                  <Link to="/login">Login to Comment</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {blog.comments.map((comment) => (
              <Card key={comment._id}>
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.fullName} />
                      <AvatarFallback>
                        {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-semibold text-sm">{comment.author.fullName}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {blog.comments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatReadTime = (minutes) => {
  return `${minutes} min read`;
};

export default BlogDetail;

