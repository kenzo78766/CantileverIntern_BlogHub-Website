import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Save, 
  Eye, 
  ArrowLeft,
  X,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const { id } = useParams(); // For editing existing blog
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    featuredImage: '',
    status: 'draft'
  });
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchCategories();
    
    if (isEditing) {
      fetchBlogForEdit();
    }
  }, [isAuthenticated, isEditing, id]);

  const fetchCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBlogForEdit = async () => {
    try {
      const response = await blogAPI.getBlogForEdit(id);
      const blog = response.data.blog;
      
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        category: blog.category,
        tags: blog.tags || [],
        featuredImage: blog.featuredImage || '',
        status: blog.status
      });
    } catch (error) {
      console.error('Error fetching blog for edit:', error);
      toast.error('Failed to load article for editing');
      navigate('/dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.excerpt && formData.excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt cannot exceed 300 characters';
    }

    if (formData.featuredImage && !isValidUrl(formData.featuredImage)) {
      newErrors.featuredImage = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const blogData = {
        ...formData,
        status
      };

      let response;
      if (isEditing) {
        response = await blogAPI.updateBlog(id, blogData);
        toast.success('Article updated successfully!');
      } else {
        response = await blogAPI.createBlog(blogData);
        toast.success('Article created successfully!');
      }

      const blog = response.data.blog;
      
      if (status === 'published') {
        navigate(`/blog/${blog.slug}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      const message = error.response?.data?.message || 'Failed to save article';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Simple preview - could be enhanced with a modal
    if (!formData.title || !formData.content) {
      toast.error('Please add title and content to preview');
      return;
    }
    
    // For now, just show a toast. In a real app, you might open a modal or new tab
    toast.success('Preview feature coming soon!');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-muted rounded mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Article' : 'Create New Article'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update your article' : 'Share your thoughts with the world'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="h-5 w-5 mr-2" />
                Article Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter an engaging title..."
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/200 characters
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Brief description of your article (optional)..."
                  value={formData.excerpt}
                  onChange={handleChange}
                  className={errors.excerpt ? 'border-destructive' : ''}
                  rows={3}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive mt-1">{errors.excerpt}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="featuredImage"
                      name="featuredImage"
                      placeholder="https://example.com/image.jpg"
                      value={formData.featuredImage}
                      onChange={handleChange}
                      className={`pl-10 ${errors.featuredImage ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.featuredImage && (
                    <p className="text-sm text-destructive mt-1">{errors.featuredImage}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTagAdd(e)}
                    />
                    <Button type="button" variant="outline" onClick={handleTagAdd}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
              <CardDescription>
                Write your article content. Use line breaks to separate paragraphs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="content"
                placeholder="Start writing your amazing article..."
                value={formData.content}
                onChange={handleChange}
                className={`min-h-96 ${errors.content ? 'border-destructive' : ''}`}
                rows={20}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">{errors.content}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.content.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    variant="outline" 
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button 
                    type="button"
                    onClick={(e) => handleSubmit(e, 'published')}
                    disabled={loading}
                  >
                    {loading ? 'Publishing...' : 'Publish Article'}
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {isEditing ? 'Changes will be saved to your existing article' : 'Your article will be saved to your dashboard'}
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;

