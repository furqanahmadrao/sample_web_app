# CloudNotes New Features Demo Script

This script demonstrates the new features added to CloudNotes application.

## Prerequisites

Ensure you have the backend running with the database schema updated:

```bash
# Start the database and backend
docker-compose up -d

# Run the migration (if not auto-applied)
docker-compose exec backend npm run migrate
```

## Demo Flow

### 1. User Registration and Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@cloudnotes.com",
    "password": "demo123456"
  }'

# Login to get a token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@cloudnotes.com",
    "password": "demo123456"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. Create Notes with Tags

```bash
# Create a work note with tags
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q4 Planning Meeting",
    "content": "Discuss quarterly goals and objectives",
    "tags": ["work", "meeting", "planning"],
    "is_pinned": true
  }'

# Create a personal note
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grocery List",
    "content": "Milk, eggs, bread, coffee",
    "tags": ["personal", "shopping"]
  }'

# Create an important note (pinned)
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Deadline",
    "content": "Complete CloudNotes demo by Friday",
    "tags": ["work", "important", "deadline"],
    "is_pinned": true
  }'

# Create a general note
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Book Recommendations",
    "content": "Clean Code, Design Patterns, The Pragmatic Programmer",
    "tags": ["books", "learning"]
  }'
```

### 3. Get All Notes (Default - Non-archived, Pinned First)

```bash
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Search Notes

```bash
# Search for notes containing "meeting"
curl -X GET "http://localhost:3000/api/notes?search=meeting" \
  -H "Authorization: Bearer $TOKEN" | jq

# Search for notes containing "project"
curl -X GET "http://localhost:3000/api/notes?search=project" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5. Filter by Tags

```bash
# Get all work notes
curl -X GET "http://localhost:3000/api/notes?tag=work" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get all personal notes
curl -X GET "http://localhost:3000/api/notes?tag=personal" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get all important notes
curl -X GET "http://localhost:3000/api/notes?tag=important" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 6. Get All Available Tags

```bash
curl -X GET http://localhost:3000/api/notes/tags/all \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 7. Filter by Pinned Status

```bash
# Get only pinned notes
curl -X GET "http://localhost:3000/api/notes?pinned=true" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 8. Pin/Unpin Notes

```bash
# Get the ID of the grocery list note
NOTE_ID=$(curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.title=="Grocery List") | .id')

# Pin it
curl -X PATCH http://localhost:3000/api/notes/$NOTE_ID/pin \
  -H "Authorization: Bearer $TOKEN" | jq

# Unpin it (toggle)
curl -X PATCH http://localhost:3000/api/notes/$NOTE_ID/pin \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 9. Archive Notes (Soft Delete)

```bash
# Get the ID of the grocery list note
NOTE_ID=$(curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.title=="Grocery List") | .id')

# Archive it
curl -X PATCH http://localhost:3000/api/notes/$NOTE_ID/archive \
  -H "Authorization: Bearer $TOKEN" | jq

# Verify it doesn't appear in default list
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" | jq

# View archived notes
curl -X GET "http://localhost:3000/api/notes?archived=true" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 10. Unarchive Notes

```bash
# Unarchive the grocery list
curl -X PATCH http://localhost:3000/api/notes/$NOTE_ID/unarchive \
  -H "Authorization: Bearer $TOKEN" | jq

# Verify it appears in default list again
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 11. Update Notes with Tags

```bash
# Get the ID of the book recommendations note
NOTE_ID=$(curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.title=="Book Recommendations") | .id')

# Update it with new tags
curl -X PUT http://localhost:3000/api/notes/$NOTE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Programming Books",
    "content": "Clean Code, Design Patterns, The Pragmatic Programmer, Refactoring",
    "tags": ["books", "programming", "learning", "reference"],
    "is_pinned": true
  }' | jq
```

### 12. Combine Multiple Filters

```bash
# Search for "project" in work notes
curl -X GET "http://localhost:3000/api/notes?search=project&tag=work" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get pinned work notes
curl -X GET "http://localhost:3000/api/notes?pinned=true&tag=work" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 13. View Enhanced Analytics

```bash
curl -X GET http://localhost:3000/api/admin/analytics | jq
```

Expected output:
```json
{
  "users": 1,
  "notes": 3,
  "archived": 0,
  "pinned": 3,
  "tagged": 4
}
```

## Frontend Demo

1. Open the application in your browser: `http://localhost:3001`
2. Login with the demo credentials: `demo@cloudnotes.com` / `demo123456`
3. You should see:
   - **Create Note Form**: Add title, content, and comma-separated tags
   - **Filter Panel**: Search box, tag dropdown, pinned/archived checkboxes
   - **Notes List**: Notes displayed with:
     - 📌 Pin indicator for pinned notes
     - Tags shown as badges
     - Pin/Unpin, Edit, Archive/Unarchive, Delete buttons
     - Yellow background for pinned notes
     - Gray background for archived notes
     - Creation and update timestamps

4. Try these features:
   - Create a note with tags
   - Search for specific content
   - Filter by tags using the dropdown
   - Pin/unpin notes
   - Edit a note to change tags
   - Archive and unarchive notes
   - View archived notes by checking "Show Archived"

## Performance Testing

```bash
# Create 100 notes with various tags
for i in {1..100}; do
  TAGS=$(shuf -e "work" "personal" "important" "meeting" "project" "learning" -n 2 | paste -sd,)
  curl -s -X POST http://localhost:3000/api/notes \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Note $i\",
      \"content\": \"This is test note number $i with various tags\",
      \"tags\": [\"$TAGS\"]
    }" > /dev/null
done

# Test search performance
time curl -X GET "http://localhost:3000/api/notes?search=test" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Test tag filtering performance
time curl -X GET "http://localhost:3000/api/notes?tag=work" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
```

## Cleanup

```bash
# Delete all notes for the demo user (if needed)
# This would require implementing a batch delete endpoint
# Or manually delete notes one by one

# Stop the application
docker-compose down
```

## Features Demonstrated

✅ Full-text search in titles and content
✅ Multi-tag support with filtering
✅ Pin/favorite notes functionality
✅ Archive system (soft delete)
✅ Enhanced admin analytics
✅ Combined filters (search + tag + pinned/archived)
✅ Updated frontend UI with all new features
