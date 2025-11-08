# 🎯 Camply - Campaign Platform

> Empowering communities through blood donation and fundraising campaigns. Together, we can make a difference and save lives.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Mobile Responsive](#mobile-responsive)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🌟 Overview

**Camply** is a modern, full-stack campaign management platform that enables users to create, manage, and track both blood donation and fundraising campaigns. Built with React, TypeScript, and Node.js, it provides a seamless experience for campaign creators and donors alike.

### Key Highlights

- 🩸 **Blood Donation Campaigns** - Organize and track blood donation drives
- 💰 **Fundraising Campaigns** - Create and manage fundraising initiatives
- 📊 **Real-time Analytics** - Track campaign performance with detailed insights
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface with dark mode support
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🤖 **AI-Powered** - Smart content suggestions using Google Gemini AI
- 🔐 **Secure Authentication** - JWT-based auth with Google OAuth support
- 🎯 **Progress Tracking** - Real-time updates on campaign goals

## ✨ Features

### Campaign Management
- ✅ Create blood donation and fundraising campaigns
- ✅ Upload campaign images with URL validation
- ✅ Set goals and track progress in real-time
- ✅ Edit campaign details with full history tracking
- ✅ Toggle campaign visibility (public/private)
- ✅ Delete campaigns with confirmation

### User Features
- ✅ User registration and authentication
- ✅ Google OAuth integration
- ✅ Personal dashboard with campaign overview
- ✅ Campaign analytics and insights
- ✅ Profile management
- ✅ Dark/Light theme toggle

### Advanced Features
- ✅ AI-powered writing assistant for campaign descriptions
- ✅ Image gallery for campaigns
- ✅ Campaign edit history tracking
- ✅ Progress update system
- ✅ Campaign statistics and counters
- ✅ Most visited campaigns showcase
- ✅ Testimonial carousel
- ✅ Responsive design for all devices

### Analytics
- ✅ Campaign performance metrics
- ✅ View count tracking
- ✅ Donation/contribution tracking
- ✅ Time-based filtering (7 days, 30 days, all time)
- ✅ Campaign type filtering
- ✅ Visual charts and graphs

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.2** - Build tool
- **React Router 6.26.1** - Routing
- **Framer Motion 11.5.4** - Animations
- **React Icons 5.3.0** - Icon library
- **Recharts 2.12.7** - Charts and graphs

### Backend
- **Node.js 20+** - Runtime
- **Express 4.19.2** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM 0.33.0** - Database ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### AI & External Services
- **Google Gemini AI** - Content generation
- **Google OAuth 2.0** - Social authentication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Vite** - Hot module replacement

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager
- Google OAuth credentials (optional)
- Google Gemini API key (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/perashaniD/camply.git
cd camply
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Set up environment variables**

Create `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Create `server/.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/camply
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=3000
```

4. **Set up the database**
```bash
cd server
npm run db:push
npm run db:seed
cd ..
```

5. **Start the development servers**

In one terminal (backend):
```bash
cd server
npm run dev
```

In another terminal (frontend):
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

### Demo Credentials

For testing purposes, you can use:
- **Email**: demo@example.com
- **Password**: demo123

## 📁 Project Structure

```
camply/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Footer component
│   │   ├── CampaignCard.tsx    # Campaign card component
│   │   ├── AIWritingAssistant.tsx
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── CampaignDetails.tsx  # Campaign details
│   │   └── ...
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── ThemeContext.tsx     # Theme context
│   ├── services/                # API services
│   │   ├── api.ts              # API client
│   │   └── gemini.ts           # AI service
│   ├── styles/                  # Global styles
│   │   ├── themes.css          # Theme variables
│   │   ├── responsive.css      # Responsive styles
│   │   └── ...
│   └── utils/                   # Utility functions
├── server/                      # Backend source code
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts         # Authentication routes
│   │   │   └── campaigns.ts    # Campaign routes
│   │   ├── db/                 # Database
│   │   │   ├── schema.ts       # Database schema
│   │   │   ├── seed.ts         # Seed data
│   │   │   └── migrate.ts      # Migrations
│   │   └── index.ts            # Server entry point
│   └── package.json
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json                 # Frontend dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── README.md                    # This file
```

## 🔐 Environment Variables

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | No |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | No |

### Backend (server/.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | No |
| `PORT` | Server port (default: 3000) | No |

## 📜 Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend

```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:push      # Push database schema
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Drizzle Studio
```

## 📱 Mobile Responsive

Camply is fully responsive and optimized for all devices:

- ✅ **Mobile phones** (320px - 768px)
- ✅ **Tablets** (769px - 1024px)
- ✅ **Desktops** (1025px+)
- ✅ **Portrait and landscape orientations**
- ✅ **Touch-friendly interactions**
- ✅ **Optimized for iOS Safari and Android Chrome**

### Key Mobile Features

- Hamburger menu navigation
- Touch-friendly buttons (44x44px minimum)
- Responsive images and layouts
- Optimized forms for mobile input
- Fixed viewport height issues
- Prevented zoom on input focus
- Smooth scrolling and animations

For detailed mobile implementation, see [MOBILE_RESPONSIVE_GUIDE.md](./MOBILE_RESPONSIVE_GUIDE.md)

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/google          # Google OAuth login
GET    /api/auth/me              # Get current user
```

### Campaign Endpoints

```
GET    /api/campaigns            # Get all campaigns
GET    /api/campaigns/:id        # Get campaign by ID
POST   /api/campaigns            # Create campaign
PUT    /api/campaigns/:id        # Update campaign
DELETE /api/campaigns/:id        # Delete campaign
PATCH  /api/campaigns/:id/visibility  # Toggle visibility
POST   /api/campaigns/:id/progress    # Update progress
GET    /api/campaigns/:id/history     # Get edit history
```

### Analytics Endpoints

```
GET    /api/analytics/stats      # Get overall statistics
GET    /api/analytics/campaigns  # Get campaign analytics
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Contact

**Shanid Sajjatuz Islam**

- 📧 Email: [shanidsajjatuz@gmail.com](mailto:shanidsajjatuz@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/shanid-sajjatuz-islam](https://linkedin.com/in/shanid-sajjatuz-islam)
- 🐙 GitHub: [github.com/perashaniD](https://github.com/perashaniD)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Google Gemini](https://ai.google.dev/) - AI content generation
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Unsplash](https://unsplash.com/) - Stock images

## 🌟 Features Roadmap

- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Social media sharing
- [ ] Campaign comments and reviews
- [ ] Advanced search and filters
- [ ] Multi-language support
- [ ] PWA support
- [ ] Mobile app (React Native)
- [ ] Campaign categories and tags
- [ ] User verification system

## 📊 Project Status

This project is actively maintained and under continuous development. Feel free to report issues or suggest new features!

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/perashaniD">Shanid Sajjatuz Islam</a></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
