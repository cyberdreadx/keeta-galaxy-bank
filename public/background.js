// Background Service Worker
console.log('[Yoda Background] Service worker starting...');

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Yoda Background] Received message:', message);

  if (message.type === 'YODA_REQUEST') {
    handleRequest(message.data, sender.tab?.id)
      .then(result => {
        console.log('[Yoda Background] Sending response:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('[Yoda Background] Error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

// Handle requests from web pages
async function handleRequest(request, tabId) {
  const { method, params } = request;

  console.log('[Yoda Background] Handling method:', method);

  switch (method) {
    case 'keeta_requestAccounts':
      return handleRequestAccounts(tabId);
    
    case 'keeta_getBalance':
      return handleGetBalance(params[0]);
    
    case 'keeta_sendTransaction':
      return handleSendTransaction(params[0], tabId);
    
    case 'keeta_signMessage':
      return handleSignMessage(params[0], tabId);
    
    case 'keeta_disconnect':
      return handleDisconnect(tabId);
    
    default:
      throw new Error(`Method ${method} not supported`);
  }
}

// Request account access
async function handleRequestAccounts(tabId) {
  console.log('[Yoda Background] Requesting accounts...');
  
  // Get tab info for origin
  let origin = 'Unknown';
  try {
    const tab = await chrome.tabs.get(tabId);
    const url = new URL(tab.url);
    origin = url.origin;
  } catch (error) {
    console.error('[Yoda Background] Error getting tab info:', error);
  }
  
  // Get stored wallet data and connected sites
  const data = await chrome.storage.local.get(['keeta_wallet_connected', 'keeta_public_key', 'connected_sites']);
  
  console.log('[Yoda Background] Wallet data:', { 
    connected: data.keeta_wallet_connected, 
    hasKey: !!data.keeta_public_key,
    connectedSites: data.connected_sites 
  });
  
  if (data.keeta_wallet_connected && data.keeta_public_key) {
    // Check if this site is already connected
    const connectedSites = data.connected_sites || [];
    const isConnected = connectedSites.some(site => site.origin === origin);
    
    console.log('[Yoda Background] Site already in connected_sites?', isConnected);
    
    if (isConnected) {
      // Site is already connected, return address without prompting
      console.log('[Yoda Background] Auto-approving for already connected site:', origin);
      
      // Update last used time
      const updatedSites = connectedSites.map(site => 
        site.origin === origin 
          ? { ...site, lastUsed: Date.now() }
          : site
      );
      await chrome.storage.local.set({ connected_sites: updatedSites });
      
      return { result: [data.keeta_public_key] };
    }
  }
  
  // Open extension popup to connect
  console.log('[Yoda Background] Opening popup for connection from:', origin);
  
  // Store pending connection request
  await chrome.storage.local.set({ 
    pending_connection: true,
    pending_tab_id: tabId,
    pending_origin: origin
  });
  
  // Open popup window to /connect route
  try {
    const popupUrl = chrome.runtime.getURL('index.html#/connect');
    console.log('[Yoda Background] Opening popup window:', popupUrl);
    
    const popupWindow = await chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 600,
      focused: true
    });
    
    console.log('[Yoda Background] Popup window created:', popupWindow.id);
    
    // Store popup window ID to track when it closes
    await chrome.storage.local.set({ popup_window_id: popupWindow.id });
  } catch (error) {
    console.error('[Yoda Background] Error opening popup:', error);
    // If popup fails, reject the connection
    await chrome.storage.local.set({ 
      pending_connection: false,
      pending_origin: null 
    });
    throw error;
  }
  
  // Wait for user to connect (poll for connection)
  return new Promise((resolve, reject) => {
    const checkConnection = async () => {
      const data = await chrome.storage.local.get(['keeta_wallet_connected', 'keeta_public_key', 'pending_connection']);
      
      if (!data.pending_connection && data.keeta_wallet_connected && data.keeta_public_key) {
        // Notify tab of connection
        try {
          chrome.tabs.sendMessage(tabId, {
            type: 'ACCOUNTS_CHANGED',
            accounts: [data.keeta_public_key]
          });
        } catch (error) {
          console.error('[Yoda Background] Error sending accounts changed:', error);
        }
        
        resolve({ result: [data.keeta_public_key] });
      } else if (data.pending_connection === false && !data.keeta_wallet_connected) {
        // User rejected
        reject(new Error('User rejected connection'));
      } else {
        setTimeout(checkConnection, 500);
      }
    };
    
    checkConnection();
    
    // Timeout after 60 seconds
    setTimeout(async () => {
      await chrome.storage.local.remove(['pending_connection', 'pending_tab_id', 'pending_origin']);
      reject(new Error('Connection request timeout'));
    }, 60000);
  });
}

// Get KTA balance
async function handleGetBalance(address) {
  console.log('[Yoda Background] Getting balance for:', address);
  
  // Get balance from storage
  const data = await chrome.storage.local.get(['keeta_balance', 'keeta_public_key']);
  
  // Return balance if address matches
  if (data.keeta_public_key === address) {
    return { result: data.keeta_balance || '0' };
  }
  
  return { result: '0' };
}

// Send transaction
async function handleSendTransaction(txParams, tabId) {
  console.log('[Yoda Background] Send transaction:', txParams);
  console.log('[Yoda Background] Tab ID:', tabId);
  
  try {
    // Get tab info for origin
    let origin = 'Unknown';
    try {
      const tab = await chrome.tabs.get(tabId);
      const url = new URL(tab.url);
      origin = url.origin;
      console.log('[Yoda Background] Got origin:', origin);
    } catch (error) {
      console.error('[Yoda Background] Error getting tab info:', error);
    }
    
    // Store pending transaction
    console.log('[Yoda Background] Storing pending transaction...');
    await chrome.storage.local.set({ 
      pending_tx: txParams,
      pending_tx_origin: origin,
      pending_tab_id: tabId 
    });
    console.log('[Yoda Background] Pending transaction stored');
    
    // Open popup for confirmation
    const popupUrl = chrome.runtime.getURL('index.html#/confirm-tx');
    console.log('[Yoda Background] Opening transaction confirmation popup:', popupUrl);
    
    const popupWindow = await chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 600,
      focused: true,
    });
    
    console.log('[Yoda Background] Transaction confirmation popup created:', popupWindow.id);
    
    await chrome.storage.local.set({ tx_popup_window_id: popupWindow.id });
    console.log('[Yoda Background] Popup window ID stored');
  } catch (error) {
    console.error('[Yoda Background] Error in handleSendTransaction:', error);
    throw error;
  }

  // Wait for user to confirm
  return new Promise((resolve, reject) => {
    const checkTx = async () => {
      const data = await chrome.storage.local.get(['pending_tx', 'tx_result', 'tx_error']);
      
      if (!data.pending_tx && data.tx_result) {
        const result = data.tx_result;
        await chrome.storage.local.remove(['tx_result', 'tx_error', 'tx_popup_window_id']);
        console.log('[Yoda Background] Transaction confirmed:', result);
        resolve({ result });
      } else if (!data.pending_tx && data.tx_error) {
        const error = data.tx_error;
        await chrome.storage.local.remove(['tx_result', 'tx_error', 'tx_popup_window_id']);
        console.log('[Yoda Background] Transaction rejected:', error);
        reject(new Error(error));
      } else {
        setTimeout(checkTx, 500);
      }
    };
    
    checkTx();
    
    setTimeout(async () => {
      await chrome.storage.local.remove(['pending_tx', 'pending_tx_origin', 'pending_tab_id', 'tx_popup_window_id']);
      reject(new Error('Transaction confirmation timeout'));
    }, 60000);
  });
}

// Sign message
async function handleSignMessage(message, tabId) {
  console.log('[Yoda Background] Sign message:', message);
  
  // Similar to send transaction - open popup for confirmation
  await chrome.storage.local.set({ 
    pending_sign: message,
    pending_tab_id: tabId 
  });
  
  await chrome.action.openPopup();
  
  return { result: 'signature_placeholder' };
}

// Disconnect
async function handleDisconnect(tabId) {
  console.log('[Yoda Background] Disconnecting from tab:', tabId);
  
  // Get the origin of the tab that's disconnecting
  let origin = null;
  if (tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      const url = new URL(tab.url);
      origin = url.origin;
      console.log('[Yoda Background] Disconnecting from origin:', origin);
    } catch (error) {
      console.error('[Yoda Background] Error getting tab info:', error);
    }
  }
  
  // Remove this site from connected_sites
  if (origin) {
    const data = await chrome.storage.local.get('connected_sites');
    const connectedSites = data.connected_sites || [];
    const updatedSites = connectedSites.filter(site => site.origin !== origin);
    
    console.log('[Yoda Background] Removing site from connected_sites:', origin);
    console.log('[Yoda Background] Remaining connected sites:', updatedSites);
    
    await chrome.storage.local.set({ 
      connected_sites: updatedSites
    });
  }
  
  // Notify tab
  if (tabId) {
    try {
      chrome.tabs.sendMessage(tabId, { type: 'DISCONNECT' });
    } catch (error) {
      console.error('[Yoda Background] Error sending disconnect:', error);
    }
  }
  
  return { result: true };
}

// Handle popup window closing
chrome.windows.onRemoved.addListener(async (windowId) => {
  const data = await chrome.storage.local.get(['popup_window_id', 'pending_connection']);
  
  if (data.popup_window_id === windowId && data.pending_connection) {
    // User closed popup without approving - reject connection
    console.log('[Yoda Background] Popup closed, rejecting connection');
    await chrome.storage.local.set({ 
      pending_connection: false,
      popup_window_id: null 
    });
  }
});

console.log('[Yoda Background] Service worker ready!');

