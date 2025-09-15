# BlogHub - Professional Blog Website

A modern, full-stack blog platform built with React, Node.js, Express, and MongoDB. This application provides a complete blogging solution with user authentication, CRUD operations, and a beautiful, responsive design.

## 🌟 Features

### User Authentication
- **User Registration**: Create new accounts with email verification
- **User Login/Logout**: Secure authentication with JWT tokens
- **Profile Management**: Update user profiles and bio information
- **Protected Routes**: Secure access to authenticated features

### Blog Management
- **Create Blog Posts**: Rich text editor with markdown support
- **Edit & Update**: Modify existing blog posts
- **Delete Posts**: Remove unwanted content
- **Draft System**: Save posts as drafts before publishing
- **Categories & Tags**: Organize content with categories and tags
- **Featured Images**: Add visual appeal with featured images

### User Experience
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Beautiful UI**: Modern design with Tailwind CSS and shadcn/ui components
- **Search & Filter**: Find content by keywords, categories, and tags
- **Pagination**: Efficient content browsing
- **Comments System**: Engage with readers through comments
- **Like System**: Show appreciation for content
- **User Dashboard**: Manage your posts and view analytics

### Technical Features
- **RESTful API**: Well-structured backend API
- **MongoDB Database**: Scalable NoSQL database
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error management
- **Input Validation**: Server-side and client-side validation

## 🚀 Deployment URLs



## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful and accessible UI components
- **Lucide Icons**: Modern icon library
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Elegant notifications
- **Vite**: Fast build tool and development server

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 📁 Project Structure

```
blog-website/
├── blog-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Layout components (Header, Footer)
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── contexts/       # React contexts (AuthContext)
│   │   ├── lib/           # Utility functions and API client
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main application component
│   ├── dist/              # Production build output
│   └── package.json       # Frontend dependencies
│
├── blog-backend/           # Node.js backend application
│   ├── models/            # MongoDB schemas
│   │   ├── User.js        # User model
│   │   └── Blog.js        # Blog post model
│   ├── routes/            # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   └── blog.js        # Blog CRUD routes
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # JWT authentication middleware
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
│
└── README.md              # This documentation file
```

## 🎯 Key Pages & Features

### Home Page
- Hero section with call-to-action
- Featured blog posts
- Category navigation
- Professional design with gradients and animations

### Authentication Pages
- **Login**: Secure user authentication
- **Register**: User account creation with validation
- Clean, modern forms with error handling

### Blog Pages
- **Blog Listing**: Paginated list with search and filters
- **Blog Detail**: Full post view with comments and likes
- **Create/Edit**: Rich editor for content creation
- **Dashboard**: User's personal blog management

### User Dashboard
- Overview of user's articles
- Statistics (views, likes, comments)
- Draft and published post management
- Quick actions for editing and deleting

## 🔧 Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or pnpm package manager

### Backend Setup
```bash
cd blog-backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd blog-frontend
pnpm install
pnpm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=..
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/verify` - Verify JWT token

### Blog Posts
- `GET /api/blogs` - Get all blogs (with pagination, search, filters)
- `GET /api/blogs/:slug` - Get single blog by slug
- `POST /api/blogs` - Create new blog (authenticated)
- `PUT /api/blogs/:id` - Update blog (authenticated, owner only)
- `DELETE /api/blogs/:id` - Delete blog (authenticated, owner only)
- `GET /api/blogs/user/my-blogs` - Get user's blogs (authenticated)
- `POST /api/blogs/:id/like` - Like/unlike blog (authenticated)
- `POST /api/blogs/:id/comments` - Add comment (authenticated)
- `GET /api/blogs/meta/categories` - Get available categories
- `GET /api/blogs/meta/tags` - Get available tags

## 🎨 Design Features

### Modern UI/UX
- Clean, professional design
- Consistent color scheme and typography
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Accessible components with proper ARIA labels

### Interactive Elements
- Hover effects on buttons and cards
- Loading states and skeleton screens
- Toast notifications for user feedback
- Modal dialogs for confirmations
- Smooth scrolling and navigation

## 🚀 Deployment Notes

The application has been successfully deployed with the following configuration:

1. **Backend**: Deployed as a Node.js service with MongoDB connection
2. **Frontend**: Built for production and deployed as a static site
3. **API Integration**: Frontend configured to communicate with production backend
4. **CORS**: Properly configured for cross-origin requests

## 🔮 Future Enhancements

### Potential Features
- **Rich Text Editor**: WYSIWYG editor for better content creation
- **Image Upload**: Direct image upload to cloud storage
- **Email Notifications**: Notify users of new comments and likes
- **Social Sharing**: Share posts on social media platforms
- **SEO Optimization**: Meta tags and structured data
- **Analytics Dashboard**: Detailed post performance metrics
- **User Roles**: Admin, editor, and author roles
- **Content Moderation**: Review and approve comments
- **Newsletter**: Email subscription for new posts
- **Dark Mode**: Theme switching capability

### Technical Improvements
- **Caching**: Redis for improved performance
- **CDN**: Content delivery network for static assets
- **Search**: Elasticsearch for advanced search capabilities
- **Testing**: Unit and integration tests
- **CI/CD**: Automated deployment pipeline
- **Monitoring**: Application performance monitoring
- **Security**: Rate limiting and additional security measures

## 📞 Support

For any questions or issues with the blog platform, please refer to the code comments and documentation within the project files. The application is fully functional and ready for use!

## 📄 License

This project is created for demonstration purposes. Feel free to use and modify as needed for your own projects.

---

**Built with ❤️ using React, Node.js, and modern web technologies**

