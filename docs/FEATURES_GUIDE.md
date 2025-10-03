# CloudNotes - Features Guide

This guide explains all the features available in CloudNotes, including the newly added capabilities.

## Table of Contents
- [Basic Features](#basic-features)
- [New Features](#new-features)
- [Usage Examples](#usage-examples)
- [Tips and Best Practices](#tips-and-best-practices)

## Basic Features

### User Authentication
- **Sign Up**: Create a new account with email and password
- **Login**: Secure authentication using JWT tokens
- **Session Management**: Automatic token refresh and logout

### Notes Management
- **Create**: Add new notes with title and content
- **Read**: View all your notes in the dashboard
- **Update**: Edit existing notes
- **Delete**: Permanently remove notes

## New Features

### 🔍 Search and Filter

**Full-Text Search**
- Search across note titles and content
- Powered by PostgreSQL's full-text search
- Automatically handles word stemming (e.g., "running" matches "run")
- Results ranked by relevance (title matches ranked higher)

**Filter Options**
- Filter by tag
- Show only pinned notes
- Show archived notes
- Combine multiple filters

### 🏷️ Tags System

**Organize with Tags**
- Add multiple tags to any note
- Tags help categorize and find related notes
- View all your tags in a dropdown for easy filtering
- Add tags when creating or editing notes

**Tag Best Practices**
- Use descriptive, single-word tags (e.g., "work", "personal", "urgent")
- Keep tags lowercase for consistency
- Common tag examples: work, personal, ideas, projects, meetings, todo

### 📌 Pin Important Notes

**Pin/Favorite Notes**
- Mark important notes by pinning them
- Pinned notes appear at the top of your list
- Visual indicator (📌) shows pinned status
- Yellow background highlights pinned notes
- Toggle pin status with one click

**When to Pin**
- Time-sensitive information
- Frequently accessed notes
- Important references
- Current projects

### 🗄️ Archive System

**Soft Delete with Archive**
- Archive notes instead of permanently deleting them
- Archived notes don't clutter your active list
- Easily restore archived notes
- View archived notes anytime

**Archive vs Delete**
- **Archive**: Temporary removal, can be restored
- **Delete**: Permanent removal, cannot be undone

## Usage Examples

### Creating a Note with Tags

**Frontend:**
1. Fill in the title field
2. Add content (optional)
3. Add tags separated by commas (e.g., "work, meeting, project")
4. Click "Create Note"

**API:**
```bash
POST /api/notes
{
  "title": "Team Meeting Notes",
  "content": "Discussed Q4 goals and deliverables",
  "tags": ["work", "meeting", "q4"],
  "is_pinned": false
}
```

### Searching Notes

**Frontend:**
1. Type your search term in the search box
2. Results update automatically as you type
3. Search looks in both titles and content

**API:**
```bash
GET /api/notes?search=meeting
```

### Filtering by Tag

**Frontend:**
1. Select a tag from the dropdown menu
2. Only notes with that tag will appear

**API:**
```bash
GET /api/notes?tag=work
```

### Pinning a Note

**Frontend:**
1. Find the note you want to pin
2. Click the "Pin" button
3. The note moves to the top with a 📌 indicator

**API:**
```bash
PATCH /api/notes/:id/pin
```

### Archiving a Note

**Frontend:**
1. Find the note you want to archive
2. Click the "Archive" button
3. The note is removed from the main list

**API:**
```bash
PATCH /api/notes/:id/archive
```

### Viewing Archived Notes

**Frontend:**
1. Check the "Show Archived" checkbox
2. All archived notes appear with a gray background
3. Click "Unarchive" to restore them

**API:**
```bash
GET /api/notes?archived=true
```

### Combining Filters

You can combine multiple filters for powerful searches:

**Frontend:**
- Search for "project" + Filter by "work" tag + Show only pinned
- This finds all pinned work notes containing "project"

**API:**
```bash
GET /api/notes?search=project&tag=work&pinned=true
```

## Tips and Best Practices

### Organization Tips
1. **Use Tags Consistently**: Develop a standard set of tags and stick to them
2. **Pin Sparingly**: Only pin truly important notes (aim for 5-10 max)
3. **Archive Regularly**: Move completed or outdated notes to archive
4. **Search First**: Before creating a new note, search to avoid duplicates

### Tag Strategies

**By Context:**
- work, personal, study, hobby

**By Status:**
- todo, in-progress, done, waiting

**By Project:**
- project-alpha, project-beta

**By Priority:**
- urgent, important, someday

**By Type:**
- meeting, idea, reference, note

### Search Tips
1. **Be Specific**: More specific terms yield better results
2. **Use Keywords**: Think about key words in your notes
3. **Combine Filters**: Use tag filters with search for precision
4. **Try Variations**: If you don't find what you're looking for, try synonyms

### Workflow Examples

**Daily Work Routine:**
1. Start day by viewing pinned notes (current priorities)
2. Create new notes for meetings with "meeting" tag
3. Tag action items with "todo"
4. Archive completed tasks at end of day
5. Review and unpin completed projects weekly

**Project Management:**
1. Create project notes with project-specific tag
2. Pin active project notes
3. Tag by status: "todo", "in-progress", "review"
4. Archive when project is complete
5. Search project tag to review all related notes

**Knowledge Base:**
1. Create reference notes with descriptive tags
2. Use "reference", "howto", or "docs" tags
3. Pin frequently needed references
4. Use search to quickly find information
5. Update notes rather than creating duplicates

## Advanced Features

### Keyboard Shortcuts (Future Enhancement)
Potential future shortcuts:
- `Ctrl+N`: New note
- `Ctrl+F`: Focus search
- `P`: Pin/unpin selected note
- `A`: Archive selected note
- `E`: Edit selected note

### Bulk Operations (Future Enhancement)
Planned features:
- Select multiple notes
- Bulk archive
- Bulk tag application
- Bulk delete

### Export/Import (Future Enhancement)
Coming soon:
- Export notes as JSON
- Export notes as Markdown
- Import from other note apps
- Backup and restore

## Troubleshooting

### Search Not Finding Notes
- Ensure the note contains the search term
- Try different words or synonyms
- Check if note is archived (enable "Show Archived")
- Verify search is not filtered by tag

### Tags Not Showing
- Ensure tags were added with commas
- Refresh the page to reload tags
- Check that notes are not archived

### Notes Disappeared
- Check if "Show Archived" filter is needed
- Verify you're logged in as the correct user
- Try clearing search and tag filters

### Cannot Delete Note
- Archive the note first if you want soft delete
- Use delete button only for permanent removal
- Confirm you have permission (owner of note)

## Getting Help

If you encounter issues or have questions:
1. Check this guide and the Quick Reference
2. Review the API documentation
3. Check the demo script for examples
4. Report issues on GitHub

## Feature Comparison

| Feature | Before | Now |
|---------|--------|-----|
| Search | ❌ None | ✅ Full-text search |
| Tags | ❌ None | ✅ Multiple tags per note |
| Pin | ❌ None | ✅ Pin important notes |
| Archive | ❌ Delete only | ✅ Soft delete with archive |
| Filters | ❌ None | ✅ Multiple filter options |
| UI | Basic list | Rich interface with actions |
| Analytics | Basic counts | Enhanced with tags/archive data |
