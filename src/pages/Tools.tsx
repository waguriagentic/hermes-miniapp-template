import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { showToast } from '../components/Toast';

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
  hasOptions?: { label: string; value: string }[];
}

const tools: Tool[] = [
  {
    id: 'transform',
    name: 'Text Transform',
    icon: '🔤',
    description: 'Transform text to uppercase, lowercase, or reversed.',
    placeholder: 'Enter text to transform...',
    hasOptions: [
      { label: 'UPPERCASE', value: 'upper' },
      { label: 'lowercase', value: 'lower' },
      { label: 'Reverse', value: 'reverse' },
    ],
  },
  {
    id: 'format-json',
    name: 'JSON Formatter',
    icon: '📋',
    description: 'Format and validate JSON input.',
    placeholder: 'Paste JSON here...',
  },
];

export default function Tools() {
  const [activeTool, setActiveTool] = useState(tools[0].id);
  const [input, setInput] = useState('');
  const [option, setOption] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const tool = tools.find((t) => t.id === activeTool) || tools[0];

  const runTool = async () => {
    if (!input.trim()) {
      showToast('Please enter some input', 'error');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const endpoint = activeTool === 'transform' ? '/api/tools/transform' : '/api/tools/format-json';
      const body = activeTool === 'transform'
        ? { text: input, mode: option || 'upper' }
        : { text: input };

      const data = await apiFetch<{ result: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setResult(data.result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    showToast('Copied!', 'success');
  };

  return (
    <div>
      <div className="tool-list">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`tool-option ${activeTool === t.id ? 'active' : ''}`}
            onClick={() => { setActiveTool(t.id); setResult(''); setInput(''); }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <h2>{tool.icon} {tool.name}</h2>
        <p style={{ marginBottom: 12 }}>{tool.description}</p>

        {tool.hasOptions && (
          <select
            className="select"
            style={{ width: '100%', marginBottom: 10 }}
            value={option || tool.hasOptions[0].value}
            onChange={(e) => setOption(e.target.value)}
          >
            {tool.hasOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}

        <textarea
          className="textarea"
          placeholder={tool.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={runTool} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Running...' : 'Run'}
          </button>
          <button className="btn" onClick={() => { setInput(''); setResult(''); }}>
            Clear
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <h2>Result</h2>
          <div className="result-area">
            <button className="copy-btn btn btn-sm" onClick={copyResult}>Copy</button>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
