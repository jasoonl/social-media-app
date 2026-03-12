/*
  # Create Feed Tables

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `user_name` (text)
      - `user_handle` (text)
      - `user_avatar` (text)
      - `user_color` (text)
      - `content` (text)
      - `created_at` (timestamp)
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key)
      - `user_name` (text)
      - `user_avatar` (text)
      - `user_color` (text)
      - `text` (text)
      - `created_at` (timestamp)
    - `likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key)
      - `user_session_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - All data is public (anyone can read)
    - Anyone can create posts, comments, and likes
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_handle text NOT NULL,
  user_avatar text NOT NULL,
  user_color text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_avatar text NOT NULL,
  user_color text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_session_id)
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are publicly readable"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create posts"
  ON posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Comments are publicly readable"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Likes are publicly readable"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create likes"
  ON likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete their own likes"
  ON likes FOR DELETE
  USING (true);
