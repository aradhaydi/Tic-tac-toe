
// Register the service worker for PWA functionality with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Service Worker update found!');
          
          newWorker.addEventListener('statechange', () => {
            // When the service worker is installed, tell it to take control immediately
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, updating...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
    
    // Detect controller change and refresh the page
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        console.log('New service worker activated, reloading for fresh content');
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
