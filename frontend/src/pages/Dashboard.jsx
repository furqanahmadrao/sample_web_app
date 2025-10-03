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
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout} className="btn-logout">Logout</button>
      {error && <p className="error">{error}</p>}

      {/* Create Note Form */}
      <div className="form-section">
        <h3>Create New Note</h3>
        <form onSubmit={createNote}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows="4"
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tags (comma-separated, e.g., work, important)"
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-primary">Create Note</button>
        </form>
      </div>

      {/* Filters */}
      <div className="form-section">
        <h3>Filters</h3>
        <div className="filters">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showPinnedOnly}
              onChange={(e) => setShowPinnedOnly(e.target.checked)}
            />
            Pinned Only
          </label>
          <label className="checkbox-label">
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
        <div className="form-section edit-section">
          <h3>Edit Note</h3>
          <form onSubmit={updateNote}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Content"
                value={editingNote.content || ''}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                rows="4"
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={Array.isArray(editingNote.tags) ? editingNote.tags.join(', ') : ''}
                onChange={(e) => setEditingNote({ ...editingNote, tags: e.target.value.split(',').map(t => t.trim()) })}
                className="form-input"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn-primary">Update Note</button>
              <button type="button" onClick={() => setEditingNote(null)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <h3 className="notes-header">Your Notes ({notes.length})</h3>
      {notes.length === 0 ? (
        <p className="no-notes">No notes found. Try adjusting your filters or create a new note.</p>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <article key={note.id} className={`note-card ${note.is_pinned ? 'pinned' : ''} ${note.is_archived ? 'archived' : ''}`}>
              <div className="note-content">
                <h4 className="note-title">
                  {note.is_pinned && '📌 '}
                  {note.title}
                  {note.is_archived && ' (Archived)'}
                </h4>
                <p className="note-text">{note.content}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <small className="note-meta">
                  Created: {new Date(note.created_at).toLocaleDateString()}
                  {note.updated_at !== note.created_at && (
                    <> • Updated: {new Date(note.updated_at).toLocaleDateString()}</>
                  )}
                </small>
              </div>
              <div className="note-actions">
                <button onClick={() => togglePin(note.id)} className="btn-small">
                  {note.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <button onClick={() => setEditingNote(note)} className="btn-small">Edit</button>
                {note.is_archived ? (
                  <button onClick={() => unarchiveNote(note.id)} className="btn-small">Unarchive</button>
                ) : (
                  <button onClick={() => archiveNote(note.id)} className="btn-small">Archive</button>
                )}
                <button onClick={() => deleteNote(note.id)} className="btn-danger">Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;