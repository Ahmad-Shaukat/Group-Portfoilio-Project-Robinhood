import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchData = (value) => {
    if (value) {
      fetch(`/api/stocks/search/${value}`)
        .then((response) => response.json())
        .then((data) => setResults(data));
    } else {
      setResults([]);
    }
  };

  const handleChange = (value) => {
    setInput(value);
    if (value.trim() === '') {
      setResults([]);
    } else {
      fetchData(value);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setResults([]);
    }
  };

  return (
    <div className="search-bar">
      <div className="input-wrapper">
        <FaSearch id="search-icon" />
        <input
          placeholder="Search"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div className="dropdown-menu" ref={dropdownRef}>
          <ul className="results-list">
            {results.map((result) => (
              <li key={result.symbol}>
                <Link
                  to={`/stocks/${result.symbol}`}
                  onClick={() => setResults([])}
                >
                  <span>
                    {result.symbol} - {result.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
