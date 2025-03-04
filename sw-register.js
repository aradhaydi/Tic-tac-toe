
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates on page load
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker update found!');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is installed but waiting for activation
            if (confirm('New version available! Reload to update?')) {
              navigator.serviceWorker.ready.then(registration => {
                registration.waiting.postMessage({ action: 'skipWaiting' });
                window.location.reload();
              });
            }
          }
        });
      });
      
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('New service worker activated, reloading for fresh content');
          window.location.reload();
        }
      });
      
    }).catch(error => {
      console.error('ServiceWorker registration failed: ', error);
    });
  });
}

// Add to Home Screen prompt handling
let deferredPrompt;
const addBtn = document.createElement('button');
addBtn.id = 'add-to-home';
addBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  
  // Find a good spot to add the button (after header)
  const header = document.querySelector('header');
  if (header && header.parentNode) {
    addBtn.style.display = 'flex';
    addBtn.style.margin = '0 auto 1rem auto';
    addBtn.style.padding = '0.7rem 1.2rem';
    addBtn.style.borderRadius = '10px';
    addBtn.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
    addBtn.style.color = 'white';
    addBtn.style.border = 'none';
    addBtn.style.fontWeight = 'bold';
    addBtn.style.cursor = 'pointer';
    addBtn.style.gap = '8px';
    addBtn.style.alignItems = 'center';
    addBtn.style.justifyContent = 'center';
    addBtn.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
    addBtn.style.transition = 'transform 0.2s, box-shadow 0.2s';
    header.parentNode.insertBefore(addBtn, header.nextSibling);
  }
});

document.body.addEventListener('click', (e) => {
  if (e.target.id === 'add-to-home' || e.target.parentNode.id === 'add-to-home') {
    // Show the prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
          // Hide the button after user installs
          if (addBtn) addBtn.style.display = 'none';
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
    }
  }
});

// Handle app installed event
window.addEventListener('appinstalled', (evt) => {
  // Hide the button once installed
  if (addBtn) addBtn.style.display = 'none';
  console.log('App was installed to the home screen');
});

// Detect when app is launched in standalone mode
window.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    console.log('App launched in standalone mode');
    // We could add special UI elements or features for installed app here
    document.body.classList.add('standalone-mode');
  }
});

// Check for network status changes
window.addEventListener('online', () => {
  console.log('App is now online');
  // Show online status indicator or reload data
  document.body.classList.remove('offline-mode');
  document.body.classList.add('online-mode');
  
  // Show temporary notification
  const notification = document.createElement('div');
  notification.className = 'network-status online';
  notification.innerHTML = '<i class="fas fa-wifi"></i> You\'re back online!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }, 100);
});

window.addEventListener('offline', () => {
  console.log('App is now offline');
  // Show offline status indicator
  document.body.classList.remove('online-mode');
  document.body.classList.add('offline-mode');
  
  // Show temporary notification
  const notification = document.createElement('div');
  notification.className = 'network-status offline';
  notification.innerHTML = '<i class="fas fa-wifi"></i> You\'re offline - using cached data';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }, 100);
});
