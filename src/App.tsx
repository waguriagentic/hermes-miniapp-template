import { useState, useEffect } from 'react';
import { tabs, APP_NAME } from './config';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import Toast from './components/Toast';

const pageMap: Record<string, React.FC> = {
  home: Home,
  tools: Tools,
  settings: Settings,
};

export default function App() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [theme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const Page = pageMap[activeTab] || Home;

  return (
    <div className="app">
      <header className="app-header">
        <h1>{APP_NAME}</h1>
      </header>

      <main className="app-content">
        <Page />
      </main>

      <nav className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <Toast />
    </div>
  );
}
