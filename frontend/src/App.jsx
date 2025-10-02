import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CloudNotes</h1>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;