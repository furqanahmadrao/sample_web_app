import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [editingNote, setEditingNote] = useState(null);
  const { token, logout, user } = useAuth();

  const fetchNotes = async () => {
    if (!token) {
      setError('You are not logged in.');
      return;
    }
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);
      if (showPinnedOnly) params.append('pinned', 'true');
      if (showArchived) params.append('archived', 'true');

      const response = await axios.get(`${API_URL}/notes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes.');
      console.error(err);
      if (err.response && err.response.status === 403) {
        logout();
      }
    }
  };

  const fetchTags = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/notes/tags/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllTags(response.data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [token, searchTerm, selectedTag, showPinnedOnly, showArchived]);

  const createNote = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.post(`${API_URL}/notes`, {
        title: newNote.title,
        content: newNote.content,
        tags: tagsArray,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewNote({ title: '', content: '', tags: '' });
      fetchNotes();
      fetchTags();
    } catch (err) {
      setError('Failed to create note.');
      console.error(err);
    }
  };

  const togglePin = async (noteId) => {
    try {
      await axios.patch(`${API_URL}/notes/${noteId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      setError('Failed to pin/unpin note.');
      console.error(err);
    }
  };

  const archiveNote = async (noteId) => {
    try {
      await axios.patch(`${API_URL}/notes/${noteId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      setError('Failed to archive note.');
      console.error(err);
    }
  };

  const unarchiveNote = async (noteId) => {
    try {
      await axios.patch(`${API_URL}/notes/${noteId}/unarchive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      setError('Failed to unarchive note.');
      console.error(err);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to permanently delete this note?')) return;
    try {
      await axios.delete(`${API_URL}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      setError('Failed to delete note.');
      console.error(err);
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    if (!editingNote) return;
    try {
      const tagsArray = editingNote.tags.join(',').split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.put(`${API_URL}/notes/${editingNote.id}`, {
        title: editingNote.title,
        content: editingNote.content,
        tags: tagsArray,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingNote(null);
      fetchNotes();
      fetchTags();
    } catch (err) {
      setError('Failed to update note.');
      console.error(err);
    }
  };

  if (!user) {
    return <p>Please log in to see your dashboard.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Create Note Form */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Create New Note</h3>
        <form onSubmit={createNote}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows="4"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Tags (comma-separated, e.g., work, important)"
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px' }}>Create Note</button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', flex: '1', minWidth: '200px' }}
          />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showPinnedOnly}
              onChange={(e) => setShowPinnedOnly(e.target.checked)}
            />
            Pinned Only
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show Archived
          </label>
        </div>
      </div>

      {/* Edit Note Form */}
      {editingNote && (
        <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #007bff', borderRadius: '5px', backgroundColor: '#f0f8ff' }}>
          <h3>Edit Note</h3>
          <form onSubmit={updateNote}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Content"
                value={editingNote.content || ''}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={Array.isArray(editingNote.tags) ? editingNote.tags.join(', ') : ''}
                onChange={(e) => setEditingNote({ ...editingNote, tags: e.target.value.split(',').map(t => t.trim()) })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 16px' }}>Update Note</button>
              <button type="button" onClick={() => setEditingNote(null)} style={{ padding: '8px 16px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <h3 style={{ marginTop: '20px' }}>Your Notes ({notes.length})</h3>
      {notes.length === 0 ? (
        <p>No notes found. Try adjusting your filters or create a new note.</p>
      ) : (
        <div style={{ marginTop: '10px' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: '15px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: note.is_pinned ? '#fffacd' : (note.is_archived ? '#f0f0f0' : '#fff'),
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>
                    {note.is_pinned && '📌 '}
                    {note.title}
                    {note.is_archived && ' (Archived)'}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>{note.content}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            marginRight: '5px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '3px',
                            fontSize: '12px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <small style={{ color: '#999' }}>
                    Created: {new Date(note.created_at).toLocaleDateString()}
                    {note.updated_at !== note.created_at && (
                      <> • Updated: {new Date(note.updated_at).toLocaleDateString()}</>
                    )}
                  </small>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '10px' }}>
                  <button onClick={() => togglePin(note.id)} style={{ padding: '5px 10px', fontSize: '12px' }}>
                    {note.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={() => setEditingNote(note)} style={{ padding: '5px 10px', fontSize: '12px' }}>
                    Edit
                  </button>
                  {note.is_archived ? (
                    <button onClick={() => unarchiveNote(note.id)} style={{ padding: '5px 10px', fontSize: '12px' }}>
                      Unarchive
                    </button>
                  ) : (
                    <button onClick={() => archiveNote(note.id)} style={{ padding: '5px 10px', fontSize: '12px' }}>
                      Archive
                    </button>
                  )}
                  <button onClick={() => deleteNote(note.id)} style={{ padding: '5px 10px', fontSize: '12px', color: 'red' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;