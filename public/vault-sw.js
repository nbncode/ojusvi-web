// Optional helper for vault.html: lets it open in airplane mode. Put it next to vault.html (site root).
// Network first, so a new vault.html always arrives when online; the saved copy is used only when offline.
// It never touches other sites (the Apps Script backend) and never sees what is written in the vault.
const CACHE = 'ojusvi-vault-single';
const isPage = u => u.origin === location.origin && /^\/vault(\.html|\/)?$/.test(u.pathname);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.add(new Request('/vault', { cache: 'reload' }))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ojusvi-vault-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || !isPage(u)) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('/vault', copy)); } return res; }).catch(() => caches.match('/vault')));
});
