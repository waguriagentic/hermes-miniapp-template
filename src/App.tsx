import { useState } from 'react';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import Toast from './components/Toast';
import './App.css';

type Tab = 'home' | 'tools' | 'settings';

interface TabDef {
  id: Tab;
  label: string;
  icon: string;
  desc?: string;
}

// Primary tabs shown directly in the bottom bar (max 5).
const primaryTabs: TabDef[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'tools', label: 'Tools', icon: '🔧' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// Secondary tools live in the "More" bottom sheet. When this array is empty,
// the "More" button and sheet are automatically hidden. Add an entry here
// (with a `desc`) and More re-appears on its own — no other changes needed.
//
// Example — to add a new secondary tool:
//   1. Add a Tab union member: type Tab = ... | 'mytool'
//   2. Push to secondaryTabs: { id: 'mytool', label: 'My Tool', icon: '🪄', desc: 'Does something cool' }
//   3. Add a case in renderPage below
const secondaryTabs: TabDef[] = [];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [moreOpen, setMoreOpen] = useState(false);

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'tools': return <Tools />;
      case 'settings': return <Settings />;
    }
  };

  const selectTab = (id: Tab) => {
    setActiveTab(id);
    setMoreOpen(false);
  };

  const hasSecondary = secondaryTabs.length > 0;

  // "More" is active when the current page is one of the secondary tools.
  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

  return (
    <div className="app">
      <div className="page-content">
        {renderPage()}
      </div>

      <nav className="tab-bar">
        {primaryTabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => selectTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
        {hasSecondary && (
          <button
            className={`tab-item ${isSecondaryActive || moreOpen ? 'active' : ''}`}
            onClick={() => setMoreOpen(true)}
          >
            <span className="tab-icon">⋯</span>
            <span className="tab-label">More</span>
          </button>
        )}
      </nav>

      {hasSecondary && (
        <>
          {/* Backdrop sits below the sheet; clicking it closes the sheet. */}
          <div
            className={`sheet-backdrop ${moreOpen ? 'open' : ''}`}
            onClick={() => setMoreOpen(false)}
          />

          <div className={`more-sheet ${moreOpen ? 'open' : ''}`}>
            <div className="sheet-handle" onClick={() => setMoreOpen(false)} />
            <div className="sheet-title">All Tools</div>
            <div className="sheet-list">
              {secondaryTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`sheet-row ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => selectTab(tab.id)}
                >
                  <span className="sheet-row-icon">{tab.icon}</span>
                  <span className="sheet-row-text">
                    <span className="sheet-row-label">{tab.label}</span>
                    {tab.desc && <span className="sheet-row-desc">{tab.desc}</span>}
                  </span>
                  <span className="sheet-row-chevron">›</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Toast />
    </div>
  );
}

export default App;
