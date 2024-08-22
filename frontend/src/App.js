import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Todo from './components/Todo';
import './App.css'; // Ensure you have this CSS file for global styles

function App() {
  // Load dark mode preference from localStorage
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Update localStorage and body class when darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const headStyle = {
    textAlign: "center",
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1 style={headStyle}>Todo List</h1>
      <button onClick={toggleDarkMode} className="btn btn-toggle">
        Toggle Dark Mode
      </button>
      <BrowserRouter>
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Todo</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path='/' element={<Todo />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
