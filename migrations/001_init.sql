-- CloudNotes Database Migration
-- Creates the initial schema for users and notes

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert sample data for testing (optional)
INSERT INTO users (email, password, name) VALUES
('test@example.com', '$2b$10$examplehashedpassword', 'Test User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO notes (user_id, title, content) VALUES
(1, 'Welcome Note', 'This is your first note in CloudNotes!')
ON CONFLICT DO NOTHING;