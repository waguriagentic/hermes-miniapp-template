import { useMemo, useState } from 'react';
import './App.css';

type Tab = 'dashboard' | 'router' | 'airdrops' | 'nft' | 'wallet' | 'ccgen' | 'video' | 'links';
type CardType = 'visa' | 'mc' | 'amex';

interface CcGenerateResponse { cards?: string[]; results?: string[]; data?: string[]; result?: string[] | string; error?: string }
interface CcValidateResponse { valid?: boolean; card?: string; brand?: string; type?: string; error?: string }
interface BinCheckResponse { bin?: string; brand?: string; scheme?: string; type?: string; bank?: string | { name?: string }; country?: string | { name?: string; alpha2?: string }; error?: string }
interface VideoResolveResponse { url?: string; directUrl?: string; direct_url?: string; result?: string | { url?: string; directUrl?: string; direct_url?: string }; error?: string }

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Hermes', icon: '📊' },
  { id: 'router', label: '9Router', icon: '🧠' },
  { id: 'airdrops', label: 'Airdrop', icon: '🎯' },
  { id: 'nft', label: 'NFT', icon: '🖼️' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
  { id: 'ccgen', label: 'CC Gen', icon: '💳' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'links', label: 'Links', icon: '🔗' },
];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let json: unknown;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { result: text }; }
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
  return [`BIN: ${data.bin ?? '-'}`, `Brand: ${data.brand ?? data.scheme ?? '-'}`, `Type: ${data.type ?? '-'}`, `Bank: ${bank ?? '-'}`, `Country: ${country || '-'}`].join('\n');
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
  return <FrameTab title="Hermes Dashboard" desc="Proxy: /dashboard → 127.0.0.1:9119" src="/dashboard/" openUrl="/dashboard/" />;
}

function RouterTab() {
  return (
    <section className="page-stack full-height">
      <div className="page-title-row">
        <div>
          <h1>9Router</h1>
          <p>Local proxy: <code>/9router</code> → <code>127.0.0.1:20128</code></p>
        </div>
        <div className="button-cluster">
          <a className="btn btn-sm" href="/9router/" target="_blank" rel="noreferrer">Local</a>
          <a className="btn btn-sm btn-primary" href="https://jackowi.empty.codes/" target="_blank" rel="noreferrer">Public</a>
        </div>
      </div>
      <div className="iframe-shell"><iframe title="9Router" src="/9router/" /></div>
    </section>
  );
}

function FrameTab({ title, desc, src, openUrl }: { title: string; desc: string; src: string; openUrl: string }) {
  return (
    <section className="page-stack full-height">
      <div className="page-title-row">
        <div><h1>{title}</h1><p>{desc}</p></div>
        <a className="btn btn-sm" href={openUrl} target="_blank" rel="noreferrer">Open</a>
      </div>
      <div className="iframe-shell"><iframe title={title} src={src} /></div>
    </section>
  );
}

function AirdropOpsTab() {
  const [output, setOutput] = useState('');
  const actions = [
    { label: 'Tavily keys', value: 'cd ~/aBaiAutoplus && python3 export_tavily_keys.py && tail -20 exports/tavily_api_keys.txt' },
    { label: 'Run Tavily cron', value: 'hermes cron run 15b79fa30dbd' },
    { label: 'Mimo progress', value: 'cat ~/aBaiAutoplus/MIMO_PROGRESS.md' },
    { label: 'Modal volume', value: 'modal volume ls abai-autoplus-data /' },
  ];
  return (
    <section className="page-stack">
      <div className="page-title-row"><div><h1>Airdrop Ops</h1><p>Quick commands buat farming/status. Copy command, run via PC/Hermes.</p></div></div>
      <div className="card command-grid">
        {actions.map(a => <button key={a.label} className="tool-option" onClick={() => setOutput(a.value)}><span>{a.label}</span><span className="sheet-row-chevron">›</span></button>)}
      </div>
      <pre className="result-box">{output || 'Pick an action.'}</pre>
    </section>
  );
}

function NftMinterTab() {
  const [chain, setChain] = useState('sepolia');
  const [rpc, setRpc] = useState('https://ethereum-sepolia-rpc.publicnode.com');
  const [contract, setContract] = useState('');
  const [fn, setFn] = useState('mint');
  const [qty, setQty] = useState(1);
  const [output, setOutput] = useState('');

  const prepare = () => setOutput(JSON.stringify({ chain, rpc, contract, function: fn, quantity: qty, mode: 'prepare_only', safety: 'No transaction is sent from Mini App. Use burner wallet and confirm manually.' }, null, 2));
  const explorer = chain.toLowerCase().includes('base') ? `https://basescan.org/address/${contract}` : chain.toLowerCase().includes('polygon') ? `https://polygonscan.com/address/${contract}` : `https://etherscan.io/address/${contract}`;

  return (
    <section className="page-stack">
      <div className="page-title-row"><div><h1>NFT Minter</h1><p>Prepare-only. Mint/send tx harus manual confirm.</p></div></div>
      <div className="card form-card">
        <div className="grid-2"><label><span>Chain</span><input className="input" value={chain} onChange={e => setChain(e.target.value)} /></label><label><span>Quantity</span><input className="input" type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value || 1))} /></label></div>
        <label><span>RPC</span><input className="input" value={rpc} onChange={e => setRpc(e.target.value)} /></label>
        <label><span>Contract</span><input className="input" value={contract} onChange={e => setContract(e.target.value)} placeholder="0x…" /></label>
        <label><span>Mint function</span><input className="input" value={fn} onChange={e => setFn(e.target.value)} placeholder="mint / publicMint / claim" /></label>
        <div className="action-row"><button className="btn btn-primary" onClick={prepare}>Prepare TX</button><a className="btn" href={explorer} target="_blank" rel="noreferrer">Explorer</a></div>
      </div>
      <pre className="result-box">{output || 'Prepared tx data will appear here.'}</pre>
    </section>
  );
}

function WalletToolsTab() {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const explorer = chain.toLowerCase().includes('sol') ? `https://solscan.io/account/${address}` : chain.toLowerCase().includes('base') ? `https://basescan.org/address/${address}` : chain.toLowerCase().includes('arb') ? `https://arbiscan.io/address/${address}` : `https://etherscan.io/address/${address}`;
  const revoke = chain.toLowerCase().includes('sol') ? 'https://famousfoxes.com/revoke' : 'https://revoke.cash/';
  return (
    <section className="page-stack">
      <div className="page-title-row"><div><h1>Wallet Tools</h1><p>Read-only shortcuts: explorer, revoke, approval/balance links.</p></div></div>
      <div className="card form-card">
        <label><span>Address</span><input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="0x… / Solana address" /></label>
        <label><span>Chain</span><input className="input" value={chain} onChange={e => setChain(e.target.value)} placeholder="ethereum/base/arbitrum/solana" /></label>
        <div className="action-row"><a className="btn btn-primary" href={explorer} target="_blank" rel="noreferrer">Open Explorer</a><a className="btn" href={revoke} target="_blank" rel="noreferrer">Revoke</a><a className="btn" href="https://debank.com/" target="_blank" rel="noreferrer">DeBank</a></div>
      </div>
    </section>
  );
}

function LinksTab() {
  const links = [
    ['9Router Public', 'https://jackowi.empty.codes/'],
    ['empty.codes', 'https://empty.codes/'],
    ['Modal', 'https://modal.com/'],
    ['GitHub PR', 'https://github.com/waguriagentic/hermes-miniapp-template/pull/1'],
    ['Revoke.cash', 'https://revoke.cash/'],
    ['DeBank', 'https://debank.com/'],
  ];
  return <section className="page-stack"><div className="page-title-row"><div><h1>Quick Links</h1><p>Shortcut biar gak bolak-balik PC.</p></div></div><div className="card command-grid">{links.map(([label, href]) => <a key={href} className="tool-option" href={href} target="_blank" rel="noreferrer"><span>{label}</span><span className="sheet-row-chevron">›</span></a>)}</div></section>;
}

function CcGenTab() {
  const [bin, setBin] = useState('');
  const [count, setCount] = useState(10);
  const [type, setType] = useState<CardType>('visa');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState('');
  const payload = useMemo(() => ({ bin: bin.trim(), count, type }), [bin, count, type]);

  const runGenerate = async () => { setLoading('generate'); setOutput(''); try { const data = await postJson<CcGenerateResponse>('/ccgen/generate', payload); const cards = flattenCards(data); setOutput(cards.length ? cards.join('\n') : JSON.stringify(data, null, 2)); } catch (err) { setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`); } finally { setLoading(''); } };
  const runValidate = async () => { setLoading('validate'); setOutput(''); try { const data = await postJson<CcValidateResponse>('/ccgen/validate', { card: bin.trim(), type }); setOutput(JSON.stringify(data, null, 2)); } catch (err) { setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`); } finally { setLoading(''); } };
  const runCheckBin = async () => { setLoading('check'); setOutput(''); try { const data = await postJson<BinCheckResponse>('/ccgen/check-bin', { bin: bin.trim() }); setOutput(formatBin(data)); } catch (err) { setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`); } finally { setLoading(''); } };

  return (
    <section className="page-stack"><div className="page-title-row"><div><h1>CC Generator API</h1><p>Route: <code>/ccgen/*</code> → <code>127.0.0.1:9122</code></p></div><a className="btn btn-sm" href="/ccgen/" target="_blank" rel="noreferrer">API</a></div><div className="card form-card"><label><span>BIN / Card</span><input className="input" value={bin} onChange={e => setBin(e.target.value)} placeholder="Example: 411111 or full card for validate" /></label><div className="grid-2"><label><span>Count</span><input className="input" type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value || 1))} /></label><label><span>Type</span><select className="input" value={type} onChange={e => setType(e.target.value as CardType)}><option value="visa">Visa</option><option value="mc">MasterCard</option><option value="amex">AMEX</option></select></label></div><div className="action-row"><button className="btn btn-primary" onClick={runGenerate} disabled={!!loading}>{loading === 'generate' ? 'Generating…' : 'Generate'}</button><button className="btn" onClick={runValidate} disabled={!!loading}>{loading === 'validate' ? 'Validating…' : 'Validate'}</button><button className="btn" onClick={runCheckBin} disabled={!!loading}>{loading === 'check' ? 'Checking…' : 'Check BIN'}</button></div></div><pre className="result-box">{output || 'Result will appear here.'}</pre></section>
  );
}

function VideoBypassTab() {
  const [url, setUrl] = useState(''); const [output, setOutput] = useState(''); const [loading, setLoading] = useState(false);
  const resolveVideo = async () => { setLoading(true); setOutput(''); try { const data = await postJson<VideoResolveResponse>('/video/resolve', { url: url.trim() }); setOutput(pickVideoUrl(data)); } catch (err) { setOutput(`ERROR: ${err instanceof Error ? err.message : String(err)}`); } finally { setLoading(false); } };
  return <section className="page-stack"><div className="page-title-row"><div><h1>Video Bypass API</h1><p>Route: <code>/video/*</code> → <code>127.0.0.1:8888</code></p></div><a className="btn btn-sm" href="/video/" target="_blank" rel="noreferrer">API</a></div><div className="card form-card"><label><span>Video URL with ads</span><textarea className="textarea" rows={4} value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste video URL…" /></label><button className="btn btn-primary" onClick={resolveVideo} disabled={loading || !url.trim()}>{loading ? 'Resolving…' : 'Resolve direct URL'}</button></div><pre className="result-box">{output || 'Direct URL will appear here.'}</pre></section>;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'router': return <RouterTab />;
      case 'airdrops': return <AirdropOpsTab />;
      case 'nft': return <NftMinterTab />;
      case 'wallet': return <WalletToolsTab />;
      case 'ccgen': return <CcGenTab />;
      case 'video': return <VideoBypassTab />;
      case 'links': return <LinksTab />;
    }
  };
  return <div className="app miniapp"><div className="page-content">{renderPage()}</div><nav className="tab-bar scroll-tabs">{tabs.map(tab => <button key={tab.id} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}><span className="tab-icon">{tab.icon}</span><span className="tab-label">{tab.label}</span></button>)}</nav></div>;
}

export default App;
