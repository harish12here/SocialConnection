# SocialConnect 🚀

A modern, premium social media platform built with Next.js, Supabase, and TypeScript.

## Features ✨

- **Authentication**: Secure JWT-based login and registration.
- **Profiles**: Personalized user profiles with bio, avatar, and stats.
- **Feed**: Chronological feed of posts from people you follow.
- **Social**: Like, comment, and follow functionality.
- **Media**: Single image upload support using Supabase Storage.
- **Design**: Premium "Modern Slate" UI with glassmorphism and animations.

## Tech Stack 🛠️

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Backend**: Next.js API Routes, Jose (JWT).
- **Database**: PostgreSQL (Supabase).
- **Storage**: Supabase Storage.
- **Icons**: Lucide React.

## Getting Started 🏁

1. **Clone the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup Environment Variables**:
   Create a `.env.local` file based on `.env.local.example` and fill in your Supabase credentials and JWT secret.
4. **Database Setup**:
   Run the SQL provided in `supabase/schema.sql` in your Supabase SQL Editor.
5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

## Folder Structure 📂

- `src/app`: Page routes and API endpoints.
- `src/components`: Reusable UI components.
- `src/context`: React Context for global state (Auth).
- `src/lib`: Utility functions (Supabase, JWT, Storage).
- `src/types`: TypeScript definitions.
- `supabase`: Database schema and policies.

---
*Created by SocialConnect Team*
