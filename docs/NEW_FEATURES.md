# API Documentation - New Features

This document describes the new API endpoints and features added to CloudNotes.

## Notes Endpoints

### Get Notes with Filters
`GET /api/notes`

Query Parameters:
- `search` (string, optional): Search notes by title or content using full-text search
- `tag` (string, optional): Filter notes by a specific tag
- `pinned` (boolean, optional): Filter to show only pinned notes (pinned=true)
- `archived` (boolean, optional): Show archived notes (archived=true) or active notes (default: false)

Example:
```bash
# Search for notes containing "meeting"
GET /api/notes?search=meeting

# Get all notes tagged "work"
GET /api/notes?tag=work

# Get all pinned notes
GET /api/notes?pinned=true

# Get archived notes
GET /api/notes?archived=true

# Combine filters
GET /api/notes?tag=work&pinned=true&search=project
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Project Meeting",
    "content": "Discuss Q4 goals",
    "file_url": null,
    "tags": ["work", "meeting"],
    "is_pinned": true,
    "is_archived": false,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

### Create Note with Tags
`POST /api/notes`

Request Body:
```json
{
  "title": "My Note",
  "content": "Note content",
  "file_url": "https://...",
  "tags": ["work", "important"],
  "is_pinned": true
}
```

Response: Created note object (201)

### Update Note with Tags
`PUT /api/notes/:id`

Request Body:
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["updated", "tag"],
  "is_pinned": false
}
```

Response: Updated note object (200)

### Toggle Pin Status
`PATCH /api/notes/:id/pin`

Toggles the pinned status of a note (pinned ↔ unpinned).

Response: Updated note object (200)

Example:
```bash
curl -X PATCH http://localhost:3000/api/notes/1/pin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Archive Note
`PATCH /api/notes/:id/archive`

Archives a note (soft delete). Archived notes are hidden from the default list but can be retrieved with `?archived=true`.

Response: Archived note object (200)

Example:
```bash
curl -X PATCH http://localhost:3000/api/notes/1/archive \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unarchive Note
`PATCH /api/notes/:id/unarchive`

Restores an archived note to the active list.

Response: Unarchived note object (200)

Example:
```bash
curl -X PATCH http://localhost:3000/api/notes/1/unarchive \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Tags
`GET /api/notes/tags/all`

Returns all unique tags used in the user's non-archived notes.

Response:
```json
["work", "personal", "important", "meeting"]
```

Example:
```bash
curl http://localhost:3000/api/notes/tags/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Admin Endpoints

### Enhanced Analytics
`GET /api/admin/analytics`

Returns enhanced statistics about the application.

Response:
```json
{
  "users": 42,
  "notes": 156,
  "archived": 23,
  "pinned": 15,
  "tagged": 89
}
```

## Features Summary

### 1. Full-Text Search
Search across note titles and content using PostgreSQL's full-text search capabilities. The search automatically:
- Stems words (e.g., "running" matches "run")
- Ranks results by relevance (title matches ranked higher than content)
- Handles English language queries

### 2. Tags System
- Add multiple tags to any note
- Filter notes by tag
- Get all unique tags used
- Tags are stored as PostgreSQL arrays

### 3. Pin/Favorite Notes
- Pin important notes to keep them at the top
- Toggle pin status with a single API call
- Pinned notes appear first in the list

### 4. Archive System
- Soft-delete notes by archiving them
- Archived notes don't appear in default queries
- Easily restore archived notes
- Permanent deletion still available via DELETE endpoint

## Database Schema Updates

The following columns were added to the `notes` table:

```sql
ALTER TABLE notes ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE notes ADD COLUMN search_vector tsvector;
```

Indexes created for performance:
- GIN index on `tags` for fast tag filtering
- GIN index on `search_vector` for full-text search
- B-tree indexes on `is_pinned` and `is_archived`

## Testing

Run the test suite:
```bash
cd backend
npm test
```

The test suite includes comprehensive tests for:
- Creating notes with tags and pin status
- Filtering and searching notes
- Toggling pin status
- Archiving and unarchiving notes
- Getting all tags
- Updating notes with tags
