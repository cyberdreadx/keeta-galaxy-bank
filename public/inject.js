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

  // Create the Ethereum provider for Base network dApps
  const ethereumProvider = {
    isYoda: true,
    isMetaMask: true, // Spoof MetaMask for compatibility
    isConnected: () => ethereumProvider._isConnected,
    _isConnected: false,
    selectedAddress: null,
    chainId: '0x2105', // Base Mainnet (8453)
    networkVersion: '8453',

    // Request method (EIP-1193)
    async request(args) {
      console.log('[Yoda EVM] Request:', args);
      
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

    // Legacy send method (deprecated but still used by some dApps)
    send(methodOrPayload, paramsOrCallback) {
      if (typeof methodOrPayload === 'string') {
        // New format: send(method, params)
        return this.request({ method: methodOrPayload, params: paramsOrCallback });
      } else {
        // Old format: send(payload, callback)
        const payload = methodOrPayload;
        const callback = paramsOrCallback;
        
        this.request(payload)
          .then(result => callback(null, { result }))
          .catch(error => callback(error, null));
      }
    },

    // Enable method (legacy)
    async enable() {
      return this.request({ method: 'eth_requestAccounts' });
    },

    // Event emitter (simplified)
    _events: {},
    on(event, callback) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
      return this;
    },
    removeListener(event, callback) {
      if (!this._events[event]) return this;
      this._events[event] = this._events[event].filter(cb => cb !== callback);
      return this;
    },
    removeAllListeners(event) {
      if (event) {
        this._events[event] = [];
      } else {
        this._events = {};
      }
      return this;
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

    // Handle Keeta provider events
    if (type === 'accountsChanged') {
      yodaProvider.selectedAddress = data.accounts[0] || null;
      yodaProvider.isConnected = !!data.accounts[0];
      yodaProvider.emit('accountsChanged', data.accounts);
    } else if (type === 'chainChanged') {
      yodaProvider.chainId = data.chainId;
      yodaProvider.emit('chainChanged', data.chainId);
    } else if (type === 'disconnect') {
      yodaProvider.selectedAddress = null;
      yodaProvider.isConnected = false;
      yodaProvider.emit('disconnect');
    }

    // Handle Ethereum provider events
    if (type === 'eth_accountsChanged') {
      ethereumProvider.selectedAddress = data.accounts[0] || null;
      ethereumProvider._isConnected = !!data.accounts[0];
      ethereumProvider.emit('accountsChanged', data.accounts);
    } else if (type === 'eth_chainChanged') {
      ethereumProvider.chainId = data.chainId;
      ethereumProvider.networkVersion = String(parseInt(data.chainId, 16));
      ethereumProvider.emit('chainChanged', data.chainId);
    } else if (type === 'eth_disconnect') {
      ethereumProvider.selectedAddress = null;
      ethereumProvider._isConnected = false;
      ethereumProvider.emit('disconnect');
    }
  });

  // Inject into window
  window.yoda = yodaProvider;
  window.keeta = yodaProvider; // Keeta compatibility
  window.ethereum = ethereumProvider; // Base/EVM dApps

  // Announce to page that Yoda is ready
  window.dispatchEvent(new Event('yoda#initialized'));
  window.dispatchEvent(new Event('ethereum#initialized'));
  
  console.log('[Yoda] Providers injected!');
  console.log('  - window.yoda (Keeta dApps)');
  console.log('  - window.keeta (Keeta dApps)');
  console.log('  - window.ethereum (Base/EVM dApps)');
})();

