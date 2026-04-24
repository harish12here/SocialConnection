-- Run this SQL in your Supabase SQL editor to create all tables

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  first_name text not null,
  last_name text not null,
  bio text check (char_length(bio) <= 160),
  avatar_url text,
  website text,
  location text,
  posts_count int default 0,
  followers_count int default 0,
  following_count int default 0,
  last_login timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  content text not null check (char_length(content) <= 280),
  author_id uuid references public.profiles(id) on delete cascade not null,
  image_url text,
  is_active boolean default true,
  like_count int default 0,
  comment_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  content text not null check (char_length(content) <= 500),
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now()
);

-- Follows table (optional feature)
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Posts policies
create policy "Active posts are viewable by everyone" on public.posts for select using (is_active = true);
create policy "Authenticated users can create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = author_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = author_id);

-- Likes policies
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike own likes" on public.likes for delete using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Authenticated users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Storage bucket for images (run in Storage section or via SQL)
insert into storage.buckets (id, name, public) values ('posts', 'posts', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies
create policy "Anyone can view post images" on storage.objects for select using (bucket_id = 'posts');
create policy "Auth users can upload post images" on storage.objects for insert with check (bucket_id = 'posts' and auth.role() = 'authenticated');

create policy "Anyone can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Auth users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Messages policies
alter table public.messages enable row level security;
create policy "Users can view their own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can mark messages as read" on public.messages for update using (auth.uid() = receiver_id);

-- Calls table for signaling
create table public.calls (
  id uuid default gen_random_uuid() primary key,
  caller_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('audio', 'video')),
  status text default 'ringing' check (status in ('ringing', 'accepted', 'rejected', 'ended')),
  signal_data jsonb, -- For WebRTC offer/answer/candidates
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Calls policies
alter table public.calls enable row level security;
create policy "Users can see their calls" on public.calls for select using (auth.uid() = caller_id or auth.uid() = receiver_id);
create policy "Users can initiate calls" on public.calls for insert with check (auth.uid() = caller_id);
create policy "Users can update their calls" on public.calls for update using (auth.uid() = caller_id or auth.uid() = receiver_id);
