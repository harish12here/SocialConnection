# 🚀 SocialConnect – Web Application

A modern, premium social media platform built with Next.js 16, Supabase, Tailwind CSS v4, and TypeScript.

For full project documentation, architecture, folder structure, and setup instructions, see the main [Root README.md](../README.md).

## Quick Start 🏁

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Configure `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-32-character-secret-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```
