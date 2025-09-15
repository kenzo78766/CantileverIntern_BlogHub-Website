import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  PenTool, 
  Eye, 
  Heart,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserBlogs();
  }, [isAuthenticated]);

  const fetchUserBlogs = async () => {
    try {
      const response = await blogAPI.getUserBlogs({ limit: 50 });
      const userBlogs = response.data.blogs;
      setBlogs(userBlogs);
      
      // Calculate stats
      const published = userBlogs.filter(blog => blog.status === 'published');
      const drafts = userBlogs.filter(blog => blog.status === 'draft');
      const totalViews = userBlogs.reduce((sum, blog) => sum + blog.views, 0);
      const totalLikes = userBlogs.reduce((sum, blog) => sum + blog.likeCount, 0);
      
      setStats({
        total: userBlogs.length,
        published: published.length,
        drafts: drafts.length,
        totalViews,
        totalLikes
      });
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      toast.error('Failed to load your articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await blogAPI.deleteBlog(blogId);
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      toast.success('Article deleted successfully');
      
      // Update stats
      const deletedBlog = blogs.find(blog => blog._id === blogId);
      if (deletedBlog) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          published: deletedBlog.status === 'published' ? prev.published - 1 : prev.published,
          drafts: deletedBlog.status === 'draft' ? prev.drafts - 1 : prev.drafts,
          totalViews: prev.totalViews - deletedBlog.views,
          totalLikes: prev.totalLikes - deletedBlog.likeCount
        }));
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete article');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    switch (activeTab) {
      case 'published':
        return blog.status === 'published';
      case 'drafts':
        return blog.status === 'draft';
      case 'archived':
        return blog.status === 'archived';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
            <p className="text-muted-foreground">
              Manage your articles and track your writing progress
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Articles</CardTitle>
            <CardDescription>
              Manage and track the performance of your published articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
                <TabsTrigger value="drafts">Drafts ({stats.drafts})</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {filteredBlogs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBlogs.map((blog) => (
                      <Card key={blog._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(blog.status)}>
                                  {blog.status}
                                </Badge>
                                <Badge variant="outline">{blog.category}</Badge>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                                {blog.status === 'published' ? (
                                  <Link 
                                    to={`/blog/${blog.slug}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {blog.title}
                                  </Link>
                                ) : (
                                  blog.title
                                )}
                              </h3>
                              
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {blog.excerpt || 'No excerpt available'}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(blog.updatedAt)}
                                </div>
                                {blog.status === 'published' && (
                                  <>
                                    <div className="flex items-center">
                                      <Eye className="h-3 w-3 mr-1" />
                                      {blog.views} views
                                    </div>
                                    <div className="flex items-center">
                                      <Heart className="h-3 w-3 mr-1" />
                                      {blog.likeCount} likes
                                    </div>
                                    <div className="flex items-center">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      {blog.commentCount} comments
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {blog.status === 'published' && (
                                  <DropdownMenuItem asChild>
                                    <Link to={`/blog/${blog.slug}`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link to={`/edit/${blog._id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(blog._id, blog.title)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === 'all' ? 'No articles yet' : `No ${activeTab} articles`}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === 'all' 
                        ? "Start writing your first article and share your thoughts with the world."
                        : `You don't have any ${activeTab} articles yet.`
                      }
                    </p>
                    {activeTab === 'all' && (
                      <Button asChild>
                        <Link to="/create">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Article
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

