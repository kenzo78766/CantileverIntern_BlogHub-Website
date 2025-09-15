import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  PenTool, 
  ArrowRight, 
  Clock, 
  Eye, 
  Heart,
  Users,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalAuthors: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const response = await blogAPI.getBlogs({ limit: 6 });
        setFeaturedBlogs(response.data.blogs);
        
        // Calculate some basic stats
        const blogs = response.data.blogs;
        const totalViews = blogs.reduce((sum, blog) => sum + blog.views, 0);
        const uniqueAuthors = new Set(blogs.map(blog => blog.author._id)).size;
        
        setStats({
          totalBlogs: response.data.pagination.totalBlogs,
          totalAuthors: uniqueAuthors,
          totalViews
        });
      } catch (error) {
        console.error('Error fetching featured blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (minutes) => {
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Share Your Stories with the World
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Join our community of passionate writers and readers. Create, discover, and engage with amazing content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/create">
                  <PenTool className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/blogs">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Blogs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">{stats.totalBlogs}+</h3>
              <p className="text-muted-foreground">Published Articles</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">{stats.totalAuthors}+</h3>
              <p className="text-muted-foreground">Active Writers</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">{stats.totalViews}+</h3>
              <p className="text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest and most engaging content from our community of writers
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <Card key={blog._id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {blog.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatReadTime(blog.readTime)}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      <Link to={`/blog/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 mb-4">
                      {blog.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={blog.author.avatar} alt={blog.author.fullName} />
                          <AvatarFallback className="text-xs">
                            {blog.author.firstName?.[0]}{blog.author.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {blog.author.fullName}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {blog.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {blog.likeCount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(blog.publishedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/blogs">
                View All Blogs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Story?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of writers who are already sharing their thoughts and experiences with our community.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">
                <PenTool className="mr-2 h-5 w-5" />
                Get Started Today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

