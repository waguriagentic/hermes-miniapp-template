import { useMemo, useState } from 'react';
import './App.css';

type Tab = 'dashboard' | 'ccgen' | 'video';
type CardType = 'visa' | 'mc' | 'amex';

interface CcGenerateResponse {
  cards?: string[];
  results?: string[];
  data?: string[];
  result?: string[] | string;
  error?: string;
}

interface CcValidateResponse {
  valid?: boolean;
  card?: string;
  brand?: string;
  type?: string;
  error?: string;
}

interface BinCheckResponse {
  bin?: string;
  brand?: string;
  scheme?: string;
  type?: string;
  bank?: string | { name?: string };
  country?: string | { name?: string; alpha2?: string };
  error?: string;
}

interface VideoResolveResponse {
  url?: string;
  directUrl?: string;
  direct_url?: string;
  result?: string | { url?: string; directUrl?: string; direct_url?: string };
  error?: string;
}

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'ccgen', label: 'CC Gen', icon: '💳' },
  { id: 'video', label: 'Video', icon: '🎬' },
];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { result: text };
  }
  if (!res.ok) {
    const err = json && typeof json === 'object' && 'error' in json ? String((json as { error?: unknown }).error) : text;
    throw new Error(err || `${res.status} ${res.statusText}`);
  }
  return json as T;
}

function flattenCards(data: CcGenerateResponse): string[] {
  const value = data.cards ?? data.results ?? data.data ?? data.result ?? [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\r?\n|,/).map(v => v.trim()).filter(Boolean);
  return [];
}

function formatBin(data: BinCheckResponse): string {
  const bank = typeof data.bank === 'string' ? data.bank : data.bank?.name;
  const country = typeof data.country === 'string' ? data.country : [data.country?.name, data.country?.alpha2].filter(Boolean).join(' ');
  return [
    `BIN: ${data.bin ?? '-'}`,
    `Brand: ${data.brand ?? data.scheme ?? '-'}`,
    `Type: ${data.type ?? '-'}`,
    `Bank: ${bank ?? '-'}`,
    `Country: ${country || '-'}`,
  ].join('\n');
}

function pickVideoUrl(data: VideoResolveResponse): string {
  if (data.directUrl) return data.directUrl;
  if (data.direct_url) return data.direct_url;
  if (data.url) return data.url;
  if (typeof data.result === 'string') return data.result;
  if (data.result?.directUrl) return data.result.directUrl;
  if (data.result?.direct_url) return data.result.direct_url;
  if (data.result?.url) return data.result.url;
  return JSON.stringify(data, null, 2);
}

function DashboardTab() {
  return (
    <section className="page-stack full-height">
      <div className="page-title-row">
        <div>
          <h1>Hermes Dashboard</h1>
          <p>Proxy: <code>/dashboard</code> → <code>127.0.0.1:9119</code></p>
        </div>
        <a className="btn btn-sm" href="/dashboard/" target="_blank" rel="noreferrer">Open</a>
      </div>
      <div className="iframe-shell">
        <iframe title="Hermes Dashboard" src="/dashboard/" />
      </div>
    </section>
  );
}

function CcGenTab() {
  const [bin, setBin] = useState('');
  const [count, setCount] = useState(10);
  const [type, setType] = useState<CardType>('visa');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState('');

  const payload = useMemo(() => ({ bin: bin.trim(), count, type }), [bin, count, type]);

  const runGenerate = async () => {
    setLoading('generate');
    setOutput('');
    try {
      const data = await postJson<CcGenerateResponse>('/ccgen/generate', payload);
      const cards = flattenCards(data);
      setOutput(cards.length ? cards.join('\n') : JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading('');
    }
  };

  const runValidate = async () => {
    setLoading('validate');
    setOutput('');
    try {
      const data = await postJson<CcValidateResponse>('/ccgen/validate', { card: bin.trim(), type });
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading('');
    }
  };

  const runCheckBin = async () => {
    setLoading('check');
    setOutput('');
    try {
      const data = await postJson<BinCheckResponse>('/ccgen/check-bin', { bin: bin.trim() });
      setOutput(formatBin(data));
    } catch (err) {
      setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading('');
    }
  };

  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>CC Generator API</h1>
          <p>Route: <code>/ccgen/*</code> → <code>127.0.0.1:9122</code></p>
        </div>
      </div>

      <div className="card form-card">
        <label>
          <span>BIN / Card</span>
          <input className="input" value={bin} onChange={e => setBin(e.target.value)} placeholder="Example: 411111 or full card for validate" />
        </label>

        <div className="grid-2">
          <label>
            <span>Count</span>
            <input className="input" type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value || 1))} />
          </label>
          <label>
            <span>Type</span>
            <select className="input" value={type} onChange={e => setType(e.target.value as CardType)}>
              <option value="visa">Visa</option>
              <option value="mc">MasterCard</option>
              <option value="amex">AMEX</option>
            </select>
          </label>
        </div>

        <div className="action-row">
          <button className="btn btn-primary" onClick={runGenerate} disabled={!!loading}>{loading === 'generate' ? 'Generating…' : 'Generate'}</button>
          <button className="btn" onClick={runValidate} disabled={!!loading}>{loading === 'validate' ? 'Validating…' : 'Validate'}</button>
          <button className="btn" onClick={runCheckBin} disabled={!!loading}>{loading === 'check' ? 'Checking…' : 'Check BIN'}</button>
        </div>
      </div>

      <pre className="result-box">{output || 'Result will appear here.'}</pre>
    </section>
  );
}

function VideoBypassTab() {
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const resolveVideo = async () => {
    setLoading(true);
    setOutput('');
    try {
      const data = await postJson<VideoResolveResponse>('/video/resolve', { url: url.trim() });
      setOutput(pickVideoUrl(data));
    } catch (err) {
      setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>Video Bypass API</h1>
          <p>Route: <code>/video/*</code> → <code>127.0.0.1:8888</code></p>
        </div>
      </div>

      <div className="card form-card">
        <label>
          <span>Video URL with ads</span>
          <textarea className="textarea" rows={4} value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste video URL…" />
        </label>
        <button className="btn btn-primary" onClick={resolveVideo} disabled={loading || !url.trim()}>{loading ? 'Resolving…' : 'Resolve direct URL'}</button>
      </div>

      <pre className="result-box">{output || 'Direct URL will appear here.'}</pre>
    </section>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'ccgen': return <CcGenTab />;
      case 'video': return <VideoBypassTab />;
    }
  };

  return (
    <div className="app miniapp">
      <div className="page-content">
        {renderPage()}
      </div>
      <nav className="tab-bar">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
