/**
 * App configuration
 * Customize tabs, metadata, and API settings here.
 */

export interface Tab {
  id: string;
  label: string;
  icon: string;
}

export const APP_NAME = 'Hermes Mini App';
export const APP_VERSION = '1.0.0';

/**
 * Tab definitions — add, remove, or reorder tabs here.
 */
export const tabs: Tab[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'tools', label: 'Tools', icon: '🔧' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

/**
 * Default API base URL (overridden by localStorage if set).
 */
export const DEFAULT_API_BASE = 'http://localhost:9122';
