// Content Script - Bridge between web page and extension
(function() {
  'use strict';

  console.log('[Yoda Content] Initializing...');

  // Inject the provider script into the page
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  // Forward messages from page to background script
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.target !== 'yoda-contentscript') return;

    console.log('[Yoda Content] Received from page:', event.data);

    try {
      // Send to background script
      const response = await chrome.runtime.sendMessage({
        type: 'YODA_REQUEST',
        data: event.data.data
      });

      console.log('[Yoda Content] Response from background:', response);

      // Send response back to page
      window.postMessage({
        target: 'yoda-inpage',
        id: event.data.data.id,
        result: response.result,
        error: response.error
      }, '*');
    } catch (error) {
      console.error('[Yoda Content] Error:', error);
      window.postMessage({
        target: 'yoda-inpage',
        id: event.data.data.id,
        error: error.message
      }, '*');
    }
  });

  // Listen for events from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Yoda Content] Message from background:', message);

    if (message.type === 'ACCOUNTS_CHANGED') {
      window.postMessage({
        target: 'yoda-inpage',
        type: 'accountsChanged',
        data: { accounts: message.accounts }
      }, '*');
    } else if (message.type === 'CHAIN_CHANGED') {
      window.postMessage({
        target: 'yoda-inpage',
        type: 'chainChanged',
        data: { chainId: message.chainId }
      }, '*');
    } else if (message.type === 'DISCONNECT') {
      window.postMessage({
        target: 'yoda-inpage',
        type: 'disconnect',
        data: {}
      }, '*');
    }
  });

  console.log('[Yoda Content] Ready!');
})();

