import { useState, useEffect } from 'react';
import { APP_NAME, APP_VERSION } from '../config';
import { getApiBase } from '../lib/api';

export default function Home() {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/health`, { signal: AbortSignal.timeout(3000) });
        setStatus(res.ok ? 'online' : 'offline');
      } catch {
        setStatus('offline');
      }
    };
    check();
  }, []);

  return (
    <div>
      <div className="card">
        <h2>Welcome to {APP_NAME}</h2>
        <p>
          A customizable Telegram Mini App powered by Hermes Agent.
          Use the Tools tab to run utilities, or fork this repo to build your own.
        </p>
        <div style={{ marginTop: 12 }}>
          <span className="status">
            <span className={`status-dot ${status}`} />
            {status === 'checking' ? 'Checking...' : status === 'online' ? 'API Connected' : 'API Offline'}
          </span>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tools' }))}>
            <span className="icon">🔧</span>
            Run a Tool
          </button>
          <button className="quick-action-btn" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}>
            <span className="icon">⚙️</span>
            Settings
          </button>
        </div>
      </div>

      <div className="card">
        <h2>About</h2>
        <p>Version {APP_VERSION} &middot; Built with React + Vite</p>
        <p style={{ marginTop: 8, fontSize: 13 }}>
          Fork this template on GitHub and add your own tools.
        </p>
      </div>
    </div>
  );
}
