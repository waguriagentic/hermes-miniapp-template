import { useState } from 'react';
import { APP_NAME, APP_VERSION, DEFAULT_API_BASE } from '../config';
import { showToast } from '../components/Toast';

export default function Settings() {
  const [apiBase, setApiBase] = useState(() => localStorage.getItem('api_base') || DEFAULT_API_BASE);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');

  const saveApiBase = () => {
    localStorage.setItem('api_base', apiBase);
    showToast('API URL saved', 'success');
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <div>
      <div className="card">
        <h2>API Configuration</h2>
        <p style={{ marginBottom: 12, fontSize: 13 }}>
          Set the backend API URL. Default: {DEFAULT_API_BASE}
        </p>
        <input
          className="input"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          placeholder="http://localhost:9122"
        />
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-primary" onClick={saveApiBase}>Save</button>
        </div>
      </div>

      <div className="card">
        <h2>Appearance</h2>
        <div className="toggle-row">
          <span>Dark Mode</span>
          <button
            className={`toggle ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
          />
        </div>
      </div>

      <div className="card">
        <h2>About</h2>
        <p><strong>{APP_NAME}</strong> v{APP_VERSION}</p>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          A customizable Telegram Mini App template.
          Fork and extend with your own tools.
        </p>
      </div>
    </div>
  );
}
