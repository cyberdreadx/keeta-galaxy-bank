// Yoda Wallet Provider - Injected into web pages
(function() {
  'use strict';

  // Create the Yoda provider
  const yodaProvider = {
    isYoda: true,
    isConnected: false,
    selectedAddress: null,
    chainId: 'keeta-main',
    networkVersion: 'main',

    // Request account connection
    async request(args) {
      console.log('[Yoda] Request:', args);
      
      return new Promise((resolve, reject) => {
        const messageId = Date.now() + Math.random();
        
        // Send message to content script
        window.postMessage({
          target: 'yoda-contentscript',
          data: {
            id: messageId,
            method: args.method,
            params: args.params || []
          }
        }, '*');

        // Listen for response
        const handleResponse = (event) => {
          if (event.source !== window) return;
          if (!event.data || event.data.target !== 'yoda-inpage') return;
          if (event.data.id !== messageId) return;

          window.removeEventListener('message', handleResponse);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        };

        window.addEventListener('message', handleResponse);

        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleResponse);
          reject(new Error('Request timeout'));
        }, 30000);
      });
    },

    // Connect to wallet (request accounts)
    async enable() {
      return this.request({ method: 'keeta_requestAccounts' });
    },

    // Get KTA balance
    async getBalance(address) {
      return this.request({ 
        method: 'keeta_getBalance',
        params: [address]
      });
    },

    // Send KTA transaction
    async sendTransaction(params) {
      return this.request({
        method: 'keeta_sendTransaction',
        params: [params]
      });
    },

    // Sign message
    async signMessage(params) {
      return this.request({
        method: 'keeta_signMessage',
        params: [params]
      });
    },

    // Disconnect
    async disconnect() {
      return this.request({ method: 'keeta_disconnect' });
    },

    // Event emitter (simplified)
    _events: {},
    on(event, callback) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
    },
    removeListener(event, callback) {
      if (!this._events[event]) return;
      this._events[event] = this._events[event].filter(cb => cb !== callback);
    },
    emit(event, ...args) {
      if (!this._events[event]) return;
      this._events[event].forEach(callback => callback(...args));
    }
  };

  // Listen for account/network changes from extension
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.target !== 'yoda-inpage') return;

    const { type, data } = event.data;

    switch (type) {
      case 'accountsChanged':
        yodaProvider.selectedAddress = data.accounts[0] || null;
        yodaProvider.isConnected = !!data.accounts[0];
        yodaProvider.emit('accountsChanged', data.accounts);
        break;
      case 'chainChanged':
        yodaProvider.chainId = data.chainId;
        yodaProvider.emit('chainChanged', data.chainId);
        break;
      case 'disconnect':
        yodaProvider.selectedAddress = null;
        yodaProvider.isConnected = false;
        yodaProvider.emit('disconnect');
        break;
    }
  });

  // Inject into window
  window.yoda = yodaProvider;
  
  // Also expose as window.keeta for compatibility
  window.keeta = yodaProvider;

  // Announce to page that Yoda is ready
  window.dispatchEvent(new Event('yoda#initialized'));
  
  console.log('[Yoda] Provider injected! Use window.yoda or window.keeta');
})();

