CREATE TABLE IF NOT EXISTS user_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  username_handle TEXT UNIQUE NOT NULL,
  phone TEXT,
  district TEXT NOT NULL,
  state TEXT DEFAULT 'Karnataka',
  profile_picture_url TEXT,
  bio TEXT,
  language TEXT DEFAULT 'kn',
  onboarding_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  acres REAL,
  district TEXT,
  soil_type TEXT,
  current_crop TEXT,
  npk_n REAL,
  npk_p REAL,
  npk_k REAL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clerk_user_id) REFERENCES user_profiles(clerk_user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  participant_one TEXT NOT NULL,
  participant_two TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(participant_one, participant_two),
  FOREIGN KEY (participant_one) REFERENCES user_profiles(clerk_user_id),
  FOREIGN KEY (participant_two) REFERENCES user_profiles(clerk_user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES user_profiles(clerk_user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL',
  district TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clerk_user_id) REFERENCES user_profiles(clerk_user_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  PRIMARY KEY (post_id, clerk_user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
