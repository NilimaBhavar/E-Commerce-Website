// Thin fetch wrapper used by all React Query hooks.
// Auth header is injected automatically by the global fetch override in main.jsx.

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  // Some DELETE routes return empty 204 bodies
  return res.json().catch(() => null);
}

// Build a ?key=value query string, ignoring undefined/null/empty values
export function toQueryString(params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}
