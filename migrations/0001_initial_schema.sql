-- AZAIN D1 Initial Schema
-- Migration: 0001_initial_schema
-- Purpose: Replace the existing Supabase database structure.
-- Media remains in Cloudflare R2.

CREATE TABLE IF NOT EXISTS timeline (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    story TEXT,
    date TEXT,
    age TEXT,
    category TEXT,
    cover_image TEXT,
    gallery_images TEXT NOT NULL DEFAULT '[]',
    highlights TEXT NOT NULL DEFAULT '[]',
    favorite INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    folder_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    book TEXT,
    book_type TEXT,
    memory_type TEXT DEFAULT 'memory'
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    date TEXT,
    age TEXT,
    category TEXT,
    description TEXT,
    story TEXT,
    cover_image TEXT,
    gallery TEXT NOT NULL DEFAULT '[]',
    highlights TEXT NOT NULL DEFAULT '[]',
    favorite INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS favorite_songs (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    artist TEXT,
    month TEXT,
    age TEXT,
    slug TEXT,
    category TEXT DEFAULT 'Favourite Song',
    cover_image TEXT,
    gallery_images TEXT NOT NULL DEFAULT '[]',
    video_url TEXT,
    story TEXT,
    highlights TEXT NOT NULL DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    favorite INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_memories (
    id TEXT PRIMARY KEY NOT NULL,
    member_key TEXT NOT NULL,
    media_type TEXT NOT NULL,
    media_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY NOT NULL,
    slot_key TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    letter_content TEXT NOT NULL DEFAULT '',
    date TEXT,
    age TEXT,
    signature TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes used by the application.

CREATE INDEX IF NOT EXISTS idx_timeline_slug
    ON timeline(slug);

CREATE INDEX IF NOT EXISTS idx_timeline_date
    ON timeline(date);

CREATE INDEX IF NOT EXISTS idx_timeline_published
    ON timeline(published);

CREATE INDEX IF NOT EXISTS idx_milestones_slug
    ON milestones(slug);

CREATE INDEX IF NOT EXISTS idx_milestones_date
    ON milestones(date);

CREATE INDEX IF NOT EXISTS idx_milestones_published
    ON milestones(published);

CREATE INDEX IF NOT EXISTS idx_favorite_songs_slug
    ON favorite_songs(slug);

CREATE INDEX IF NOT EXISTS idx_favorite_songs_display_order
    ON favorite_songs(display_order);

CREATE INDEX IF NOT EXISTS idx_family_memories_member_key
    ON family_memories(member_key);

CREATE INDEX IF NOT EXISTS idx_family_memories_display_order
    ON family_memories(display_order);

CREATE INDEX IF NOT EXISTS idx_family_memories_published
    ON family_memories(published);

CREATE INDEX IF NOT EXISTS idx_letters_slug
    ON letters(slug);

CREATE INDEX IF NOT EXISTS idx_letters_slot_key
    ON letters(slot_key);

CREATE INDEX IF NOT EXISTS idx_letters_display_order
    ON letters(display_order);