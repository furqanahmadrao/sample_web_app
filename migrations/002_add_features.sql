-- Add new columns to notes table for additional features

-- Add is_pinned column for favorite/pin functionality
ALTER TABLE notes ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;

-- Add is_archived column for soft-delete functionality
ALTER TABLE notes ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Add tags column to store tags as a text array
ALTER TABLE notes ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create an index on tags for faster searching
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- Create an index on is_pinned for faster queries
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;

-- Create an index on is_archived for faster queries
CREATE INDEX idx_notes_is_archived ON notes(is_archived);

-- Create a full-text search index for title and content
ALTER TABLE notes ADD COLUMN search_vector tsvector;

CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);

-- Create a function to update the search_vector
CREATE OR REPLACE FUNCTION notes_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the search_vector
CREATE TRIGGER notes_search_vector_update_trigger
BEFORE INSERT OR UPDATE ON notes
FOR EACH ROW
EXECUTE PROCEDURE notes_search_vector_update();

-- Update existing notes to populate search_vector
UPDATE notes SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'B');
