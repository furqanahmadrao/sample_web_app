import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

function Dashboard() {
  const { user, logout } = useAuth()
  const [notes, setNotes] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', file: null })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(response.data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title', newNote.title)
      formData.append('content', newNote.content)
      if (newNote.file) {
        formData.append('file', newNote.file)
      }

      await axios.post('/api/notes', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setNewNote({ title: '', content: '', file: null })
      setShowCreateForm(false)
      fetchNotes()
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    setNewNote({ ...newNote, file: e.target.files[0] })
  }

  return (
    <div className="dashboard">
      <header>
        <h1>CloudNotes</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        <div className="notes-header">
          <h2>Your Notes</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="primary"
          >
            {showCreateForm ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateNote} className="note-form">
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              required
            />
            <input type="file" onChange={handleFileChange} />
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Note'}
            </button>
          </form>
        )}

        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              {note.file_url && (
                <div>
                  <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                </div>
              )}
              <small>
                Last updated: {new Date(note.updated_at).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard