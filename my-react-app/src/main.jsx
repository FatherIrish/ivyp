import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { useEffect, useState } from 'react';

const [rows, setRows] = useState([]);

useEffect(() => {
  const saved = localStorage.getItem("drillData");
  if (saved) {
    setRows(JSON.parse(saved));
  }
}, []);