# 🚀 SocialConnect – Modern Creator & Social Network Platform

> A production-ready, full-stack social media application built with **Next.js 16 (App Router)**, **React 19**, **Supabase (PostgreSQL & RLS)**, **Tailwind CSS v4**, and **TypeScript**.

---

## 🌟 Features Overview

### 🔐 Authentication & Session Security
- **JWT Cookie Sessions**: Secure token-based authentication with HTTP-only cookie support.
- **Row Level Security (RLS)**: Enforced database RLS policies protecting user data.
- **Onboarding Flow**: 2-step onboarding wizard for new users (profile photo, bio, location, and interest tag selector).

### 📰 Home Feed & Embedded Post Composer
- **Inline Post Composer**: Embedded composer box on the Home Feed with drag-and-drop image upload preview, character counter (280 max), and optimistic feed insertion.
- **Feed Filters**: Quick tab filtering between `All Posts` and `Trending`.
- **Post Interactions**: Instant heart-burst likes, comment threads, post editing, bookmarking, and link sharing.

### 🔔 Real-time Notifications Center (`/notifications`)
- **Interactive Alerts**: Instant notifications triggered on post likes, comments, new followers, and direct messages.
- **Tabbed Categories**: Filter notifications by `All`, `Unread`, `Likes`, `Comments`, and `Follows`.
- **1-Click Actions**: Mark individual notifications or all notifications as read.

### 👥 Connections Hub & Creator Discovery (`/connections` & `/discover`)
- **Connections Management**: 3 dedicated tab views:
  1. **Connected**: Mutual friends and creators you follow with 1-click messaging.
  2. **Requests**: Incoming connection requests with Accept / Decline actions.
  3. **Suggestions**: Interest-matched creator recommendations.
- **Discover Directory**: Responsive card grid displaying bio snippets, location badges, follower counts, and 1-click Connect buttons.

### 💬 Messaging & WebRTC Voice/Video Calls (`/messages`)
- **Direct Messaging**: Fast private chats with message pin, copy, edit, and deletion capabilities.
- **WebRTC Signaling**: Voice and video call triggers (`Audio` & `Video`) with real-time signaling overlays.
- **Fullscreen Layout**: Zero cutoff layout with responsive mobile support (`< 768px`).

### 👤 Profile & Portfolio Customization (`/profile/[user_id]` & `/settings`)
- **Profile Hub**: Gradient cover banner, avatar upload, stats counters, and tabs (`Posts`, `Followers`, `Following`, `About`).
- **Settings Manager**: Manage profile information, privacy preferences, notification toggles, password updates, and theme toggle.

---

## 📁 Complete Folder Structure

```
SocialConnection/
├── README.md                           # Root documentation
└── socialconnect/                      # Main Next.js 16 Web Application
    ├── .env.example                    # Environment variable template
    ├── .env.local                      # Local secret keys & DB environment
    ├── .gitignore                      # Git ignored files & dependencies
    ├── next.config.ts                  # Next.js configuration
    ├── package.json                    # Project metadata & scripts
    ├── postcss.config.mjs              # PostCSS Tailwind CSS v4 config
    ├── tsconfig.json                   # TypeScript compiler rules
    │
    ├── public/                         # Static assets & public icons
    │   └── favicon.ico
    │
    ├── src/                            # Source application code
    │   ├── proxy.ts                    # Middleware route protector & JWT validator
    │   │
    │   ├── app/                        # Next.js 16 App Router pages & APIs
    │   │   ├── globals.css             # Tailwind v4 theme tokens & glassmorphism CSS
    │   │   ├── layout.tsx              # Root responsive layout (Navbar, Sidebar, RightPanel)
    │   │   ├── page.tsx                # Landing page & feed redirect
    │   │   │
    │   │   ├── feed/                   # Home Feed view
    │   │   │   └── page.tsx
    │   │   ├── discover/               # User discovery & creator directory
    │   │   │   └── page.tsx
    │   │   ├── connections/            # Connections Hub (Connected, Requests, Suggestions)
    │   │   │   └── page.tsx
    │   │   ├── notifications/          # Notifications Center view
    │   │   │   └── page.tsx
    │   │   ├── onboarding/             # New user 2-step onboarding wizard
    │   │   │   └── page.tsx
    │   │   ├── messages/               # Direct messaging & WebRTC chat UI
    │   │   │   ├── page.tsx            # Conversation list view
    │   │   │   └── [partner_id]/       # Chat thread page with active partner
    │   │   │       └── page.tsx
    │   │   ├── profile/                # User profile & portfolio page
    │   │   │   └── [user_id]/
    │   │   │       └── page.tsx
    │   │   ├── settings/               # Account, privacy, & notification settings
    │   │   │   └── page.tsx
    │   │   ├── login/                  # User login page
    │   │   │   └── page.tsx
    │   │   ├── register/               # User registration page
    │   │   │   └── page.tsx
    │   │   ├── create/                 # Separate post creation page
    │   │   │   └── page.tsx
    │   │   ├── posts/                  # Individual post detailed view
    │   │   │   └── [post_id]/
    │   │   │       └── page.tsx
    │   │   │
    │   │   └── api/                    # RESTful Backend API Endpoints
    │   │       ├── auth/               # Auth routes (login, register, logout, password)
    │   │       ├── users/              # User profiles, follow, followers, following APIs
    │   │       ├── posts/              # Post CRUD, likes, and comments APIs
    │   │       ├── messages/           # Direct messaging & conversation APIs
    │   │       ├── notifications/      # Notification GET, PATCH (read), POST APIs
    │   │       ├── calls/              # WebRTC call signaling APIs
    │   │       └── upload/             # Supabase storage file upload API
    │   │
    │   ├── components/                 # Reusable UI Components
    │   │   ├── Navbar.tsx              # Top header with global search & notifications popover
    │   │   ├── Sidebar.tsx             # Desktop sticky sidebar & mobile bottom bar
    │   │   ├── RightPanel.tsx          # Suggested creators & trending topics desktop widget
    │   │   ├── CreatePostComposer.tsx  # Embedded post composer with image preview
    │   │   ├── PostCard.tsx            # Post card with likes, comments, & options
    │   │   ├── SkeletonLoader.tsx      # Shimmer skeleton loader components
    │   │   └── CallOverlay.tsx         # WebRTC voice/video call overlay modal
    │   │
    │   ├── context/                    # State Management
    │   │   └── AuthContext.tsx         # Global Auth & Theme context provider
    │   │
    │   ├── lib/                        # Utilities & SDK Wrappers
    │   │   ├── api-client.ts           # Fetch API client wrapper
    │   │   ├── api-response.ts         # Standardized API JSON response utility
    │   │   ├── jwt.ts                  # Jose JWT creation & token verification
    │   │   ├── storage.ts              # Supabase storage upload helper
    │   │   └── supabase.ts             # Supabase client initializer
    │   │
    │   └── types/                      # TypeScript Definitions
    │       └── index.ts                # User, Post, Comment, Notification, & Message types
    │
    └── supabase/                       # Supabase Database Configuration
        └── schema.sql                  # PostgreSQL tables, indexes, & RLS policies
```

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) + Glassmorphic UI |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database & Security** | [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS) |
| **Authentication** | [Jose JWT](https://github.com/panva/jose) + HTTP Cookies |
| **Storage** | Supabase Storage Buckets (`posts`, `avatars`) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/harish12here/SocialConnection.git
cd SocialConnection/socialconnect
npm install
```

### 3. Environment Variables Setup
Create a `.env.local` file inside `socialconnect/` with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-32-character-secret-key-goes-here
```

### 4. Database Setup
Copy the contents of `socialconnect/supabase/schema.sql` and execute it in your **Supabase SQL Editor**. This creates all required tables (`profiles`, `posts`, `likes`, `comments`, `follows`, `messages`, `calls`, `notifications`) and RLS policies.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Type Checking

To verify clean TypeScript compilation and build the production bundle:

```bash
# Type-check TypeScript code
npx tsc --noEmit

# Build production Next.js application
npm run build

# Start production server
npm start
```

---

## 🔗 Key API Routes

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate user & issue JWT cookie |
| `/api/auth/register` | `POST` | Register new user profile |
| `/api/feed` | `GET` | Fetch personalized home feed posts |
| `/api/posts` | `GET`, `POST` | Fetch posts or publish a new post |
| `/api/notifications` | `GET`, `PATCH`, `POST` | Fetch, mark read, or trigger notifications |
| `/api/users/[user_id]/follow` | `POST`, `DELETE` | Connect/follow or unfollow a user |
| `/api/messages` | `GET`, `POST` | Fetch conversation list or send a direct message |
| `/api/calls` | `POST` | Initiate WebRTC voice/video call |

---

*Built with ❤️ for SocialConnect Community*