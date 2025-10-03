# Quick Reference Guide - New Features

## Database Schema Changes

### New Columns in `notes` table:
- `is_pinned` (BOOLEAN): Whether the note is pinned/favorited
- `is_archived` (BOOLEAN): Whether the note is archived (soft-deleted)
- `tags` (TEXT[]): Array of tags for categorization
- `search_vector` (tsvector): Full-text search index

### Automatic Triggers:
- `notes_search_vector_update_trigger`: Automatically updates search vector on insert/update

### Indexes:
- GIN index on `tags` for fast array searches
- GIN index on `search_vector` for full-text search
- B-tree indexes on `is_pinned` and `is_archived`

## API Endpoints Summary

### GET /api/notes
**Query Parameters:**
- `search` - Full-text search string
- `tag` - Filter by specific tag
- `pinned` - Show only pinned notes (true/false)
- `archived` - Show archived notes (true/false, default: false)

**Example:**
```
GET /api/notes?search=meeting&tag=work&pinned=true
```

### POST /api/notes
**Body:**
```json
{
  "title": "Note Title",
  "content": "Note content",
  "tags": ["tag1", "tag2"],
  "is_pinned": false
}
```

### PUT /api/notes/:id
**Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["new", "tags"],
  "is_pinned": true
}
```

### PATCH /api/notes/:id/pin
Toggles pin status (no body required)

### PATCH /api/notes/:id/archive
Archives a note (no body required)

### PATCH /api/notes/:id/unarchive
Unarchives a note (no body required)

### GET /api/notes/tags/all
Returns array of all unique tags for the user

**Example Response:**
```json
["work", "personal", "important", "meeting"]
```

### GET /api/admin/analytics
**Response:**
```json
{
  "users": 42,
  "notes": 156,
  "archived": 23,
  "pinned": 15,
  "tagged": 89
}
```

## Frontend Components

### Dashboard Component Updates

**New State Variables:**
- `allTags` - List of all available tags
- `searchTerm` - Current search query
- `selectedTag` - Currently selected tag filter
- `showPinnedOnly` - Filter for pinned notes
- `showArchived` - Show archived notes flag
- `newNote` - Form state for creating notes
- `editingNote` - Currently editing note

**New Functions:**
- `fetchNotes()` - Fetches notes with current filters
- `fetchTags()` - Fetches all available tags
- `createNote()` - Creates a new note with tags
- `togglePin()` - Toggles pin status
- `archiveNote()` - Archives a note
- `unarchiveNote()` - Restores archived note
- `deleteNote()` - Permanently deletes a note
- `updateNote()` - Updates note with tags

**UI Features:**
- Create note form with tag input
- Search bar
- Tag filter dropdown
- Pinned/Archived checkboxes
- Note cards with:
  - 📌 indicator for pinned notes
  - Tag badges
  - Action buttons (Pin, Edit, Archive, Delete)
  - Yellow background for pinned notes
  - Gray background for archived notes
  - Timestamps

## Testing

### Running Tests:
```bash
cd backend
npm test
```

**Note:** Tests require a PostgreSQL database with the schema applied.

### Test Coverage:
- ✅ Create notes with tags and pin status
- ✅ Fetch notes with various filters
- ✅ Search notes by content
- ✅ Filter by tag
- ✅ Filter by pinned status
- ✅ Toggle pin status
- ✅ Archive and unarchive notes
- ✅ Get all tags
- ✅ Update notes with tags

## Migration Guide

### To apply the new schema:

1. **Using Docker:**
   ```bash
   docker-compose exec db psql -U postgres -d cloudnotes -f /migrations/002_add_features.sql
   ```

2. **Using psql directly:**
   ```bash
   psql -U postgres -d cloudnotes -f migrations/002_add_features.sql
   ```

3. **Using the migrate script:**
   ```bash
   cd backend
   npm run migrate
   ```

### Rollback (if needed):
Create a rollback script `migrations/002_rollback.sql`:
```sql
DROP TRIGGER IF EXISTS notes_search_vector_update_trigger ON notes;
DROP FUNCTION IF EXISTS notes_search_vector_update();
DROP INDEX IF EXISTS idx_notes_search;
DROP INDEX IF EXISTS idx_notes_is_archived;
DROP INDEX IF EXISTS idx_notes_is_pinned;
DROP INDEX IF EXISTS idx_notes_tags;

ALTER TABLE notes DROP COLUMN IF EXISTS search_vector;
ALTER TABLE notes DROP COLUMN IF EXISTS tags;
ALTER TABLE notes DROP COLUMN IF EXISTS is_archived;
ALTER TABLE notes DROP COLUMN IF EXISTS is_pinned;
```

## Code Examples

### Creating a Note with Tags (JavaScript):
```javascript
const response = await axios.post('/api/notes', {
  title: 'My Note',
  content: 'Note content',
  tags: ['work', 'important'],
  is_pinned: true
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Searching and Filtering:
```javascript
const params = new URLSearchParams();
params.append('search', 'meeting');
params.append('tag', 'work');
params.append('pinned', 'true');

const response = await axios.get(`/api/notes?${params.toString()}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Toggling Pin Status:
```javascript
await axios.patch(`/api/notes/${noteId}/pin`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Archiving a Note:
```javascript
await axios.patch(`/api/notes/${noteId}/archive`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Performance Considerations

### Indexes:
All new columns have appropriate indexes for optimal query performance.

### Full-Text Search:
Uses PostgreSQL's built-in full-text search with tsvector, which is highly performant even with large datasets.

### Tag Filtering:
GIN index on tags array enables fast `ANY` queries.

### Pagination:
Consider adding pagination for large note collections:
```sql
SELECT * FROM notes 
WHERE user_id = $1 
ORDER BY is_pinned DESC, created_at DESC 
LIMIT 20 OFFSET 0;
```

## Best Practices

1. **Tags**: Use lowercase, single-word tags for consistency
2. **Search**: Search queries are case-insensitive and use stemming
3. **Archiving**: Always prefer archiving over permanent deletion
4. **Pinning**: Limit pinned notes to truly important items
5. **Filtering**: Combine filters for powerful queries

## Troubleshooting

### Search not working:
- Verify search_vector column exists
- Check if trigger is active: `\d notes` in psql
- Ensure existing notes have search_vector populated

### Tags not filtering:
- Verify tags are stored as arrays, not strings
- Check GIN index exists: `\d notes`

### Performance issues:
- Add LIMIT/OFFSET for pagination
- Check query plans: `EXPLAIN ANALYZE SELECT ...`
- Verify all indexes are created

## Next Steps

Potential future enhancements:
- Note sharing between users
- Note templates
- Rich text editor
- Attachments/file uploads with tags
- Tag hierarchies/categories
- Bulk operations (archive multiple, tag multiple)
- Export notes (JSON, Markdown)
- Note history/versions
