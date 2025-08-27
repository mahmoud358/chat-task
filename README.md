# Real-time Chat Application

A full-stack real-time chat application built with Next.js 14, featuring user authentication, real-time messaging, and file uploads.

## Features

- 🔐 **JWT Authentication** - Secure login/register with bcrypt password hashing
- 💬 **Real-time Messaging** - Instant message delivery using Socket.io
- 📱 **File Uploads** - Share images in conversations
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🗄️ **MySQL Database** - Persistent data storage with Prisma ORM
- 🔒 **Protected Routes** - Middleware-based route protection

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.io
- **File Uploads**: Multer with local storage

## Prerequisites

- Node.js 18+ 
- MySQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/chat_app"
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following database schema:

### Users
- `id` - Unique identifier
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `createdAt` - Account creation timestamp

### Conversations
- `id` - Unique identifier
- `createdAt` - Conversation creation timestamp

### Conversation Members
- `id` - Unique identifier
- `conversationId` - Reference to conversation
- `userId` - Reference to user

### Messages
- `id` - Unique identifier
- `conversationId` - Reference to conversation
- `senderId` - Reference to user
- `text` - Message text (optional)
- `imageUrl` - Image file path (optional)
- `createdAt` - Message timestamp

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation

### Messages
- `GET /api/conversations/[id]/messages` - Get conversation messages
- `POST /api/conversations/[id]/messages` - Send new message

### Users
- `GET /api/users` - Get all users (for starting conversations)

### File Uploads
- `POST /api/upload` - Upload image file
- `GET /api/uploads/[...path]` - Serve uploaded files

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── conversations/     # Conversation endpoints
│   │   ├── users/             # User endpoints
│   │   ├── upload/            # File upload endpoint
│   │   └── uploads/           # File serving endpoint
│   ├── chat/                  # Chat pages
│   ├── inbox/                 # Inbox page
│   ├── login/                 # Login page
│   ├── register/              # Register page
│   ├── new-chat/              # New chat page
│   └── globals.css            # Global styles
├── lib/                       # Utility libraries
│   ├── prisma.js             # Prisma client
│   ├── jwt.js                # JWT utilities
│   └── socket.js             # Socket.io setup
└── middleware.js             # Next.js middleware
```

## Usage

1. **Register/Login**: Create an account or sign in with existing credentials
2. **Start Conversations**: Navigate to "New Chat" to find other users
3. **Send Messages**: Type text messages or upload images
4. **Real-time Updates**: Messages appear instantly for all conversation participants

## Development

### Running in Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL database connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `NEXTAUTH_URL` | Base URL for the application | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |

## Security Features

- JWT token-based authentication
- bcrypt password hashing
- Protected API routes with middleware
- File upload validation (type and size)
- CORS configuration for Socket.io

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
