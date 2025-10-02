import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const { token, logout, user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) {
        setError('You are not logged in.');
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(response.data);
      } catch (err) {
        setError('Failed to fetch notes.');
        console.error(err);
        if (err.response && err.response.status === 403) {
          logout(); // If token is invalid, log out user
        }
      }
    };

    fetchNotes();
  }, [token, logout]);

  if (!user) {
    return <p>Please log in to see your dashboard.</p>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h3>Your Notes</h3>
      {notes.length === 0 ? (
        <p>You have no notes yet.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <h4>{note.title}</h4>
              <p>{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;