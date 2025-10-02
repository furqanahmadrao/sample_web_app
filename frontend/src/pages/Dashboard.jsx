import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const { token, logout, user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) {
        setError('You are not logged in.');
        return;
      }
      try {
        const offset = (currentPage - 1) * notesPerPage;
        const response = await axios.get(`${API_URL}/notes?limit=${notesPerPage}&offset=${offset}`, {
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
  }, [token, logout, currentPage]);

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
      {notes.length > 0 && (
        <div>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span> Page {currentPage} </span>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={notes.length < notesPerPage}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;