// Service Worker mínimo para habilitar instalación (A2HS)
self.addEventListener('install', (event) => {
  // Activación inmediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Tomar control de las páginas bajo scope
  event.waitUntil(self.clients.claim());
});

// Opcional: no interceptamos fetch para no afectar funcionalidad
self.addEventListener('fetch', () => {});