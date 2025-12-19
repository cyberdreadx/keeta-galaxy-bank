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
    // Keeta methods
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
    
    // Ethereum/Base methods
    case 'eth_requestAccounts':
      return handleEthRequestAccounts(tabId);
    
    case 'eth_accounts':
      return handleEthAccounts();
    
    case 'eth_chainId':
      return handleEthChainId();
    
    case 'eth_getBalance':
      return handleEthGetBalance(params);
    
    case 'eth_sendTransaction':
      return handleEthSendTransaction(params[0], tabId);
    
    case 'personal_sign':
    case 'eth_sign':
      return handleEthSign(params, tabId);
    
    case 'eth_signTypedData':
    case 'eth_signTypedData_v4':
      return handleEthSignTypedData(params, tabId);
    
    case 'wallet_switchEthereumChain':
      return handleSwitchChain(params[0]);
    
    case 'wallet_getCapabilities':
      return handleGetCapabilities(params);
    
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
      height: 700,
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

// Send transaction (KTA or token/NFT)
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
    
    // Detect if this is a token transfer (includes token parameter)
    const isTokenTransfer = txParams.token && txParams.token !== null;
    console.log('[Yoda Background] Is token transfer?', isTokenTransfer);
    
    // Store pending transaction with token info
    console.log('[Yoda Background] Storing pending transaction...');
    await chrome.storage.local.set({ 
      pending_tx: {
        ...txParams,
        isTokenTransfer // Flag for UI
      },
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

// ========== ETHEREUM/BASE HANDLERS ==========

// Handle eth_requestAccounts
async function handleEthRequestAccounts(tabId) {
  console.log('[Yoda Background] eth_requestAccounts...');
  
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
  const data = await chrome.storage.local.get(['base_wallet_address', 'base_connected_sites']);
  
  console.log('[Yoda Background] Base wallet data:', { 
    hasAddress: !!data.base_wallet_address,
    connectedSites: data.base_connected_sites 
  });
  
  if (data.base_wallet_address) {
    // Check if this site is already connected
    const connectedSites = data.base_connected_sites || [];
    const isConnected = connectedSites.some(site => site.origin === origin);
    
    console.log('[Yoda Background] Site already in base_connected_sites?', isConnected);
    
    if (isConnected) {
      // Site is already connected, return address without prompting
      console.log('[Yoda Background] Auto-approving for already connected Base site:', origin);
      
      // Update last used time
      const updatedSites = connectedSites.map(site => 
        site.origin === origin 
          ? { ...site, lastUsed: Date.now() }
          : site
      );
      await chrome.storage.local.set({ base_connected_sites: updatedSites });
      
      return { result: [data.base_wallet_address] };
    }
  }
  
  // Open extension popup to connect
  console.log('[Yoda Background] Opening Base connection popup for:', origin);
  
  // Store pending connection request
  await chrome.storage.local.set({ 
    pending_base_connection: true,
    pending_base_tab_id: tabId,
    pending_base_origin: origin
  });
  
  // Open popup to /connect-base route
  try {
    const popupUrl = chrome.runtime.getURL('index.html#/connect-base');
    const popupWindow = await chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 600,
      focused: true,
    });
    
    console.log('[Yoda Background] Base connection popup created:', popupWindow.id);
    await chrome.storage.local.set({ base_popup_window_id: popupWindow.id });
  } catch (error) {
    console.error('[Yoda Background] Error opening popup:', error);
    await chrome.storage.local.remove(['pending_base_connection', 'pending_base_tab_id', 'pending_base_origin']);
    throw new Error('Failed to open connection popup');
  }
  
  // Wait for user to connect
  return new Promise((resolve, reject) => {
    const checkConnection = async () => {
      const data = await chrome.storage.local.get(['base_wallet_address', 'pending_base_connection']);
      
      if (!data.pending_base_connection && data.base_wallet_address) {
        // User approved connection
        try {
          chrome.tabs.sendMessage(tabId, {
            type: 'eth_accountsChanged',
            accounts: [data.base_wallet_address]
          });
        } catch (error) {
          console.error('[Yoda Background] Error sending accounts changed:', error);
        }
        
        resolve({ result: [data.base_wallet_address] });
      } else if (data.pending_base_connection === false) {
        // User rejected
        reject(new Error('User rejected connection'));
      } else {
        setTimeout(checkConnection, 500);
      }
    };
    
    checkConnection();
    
    // Timeout after 60 seconds
    setTimeout(async () => {
      const data = await chrome.storage.local.get('pending_base_connection');
      if (data.pending_base_connection) {
        await chrome.storage.local.remove(['pending_base_connection', 'pending_base_tab_id', 'pending_base_origin']);
        reject(new Error('Connection request timeout'));
      }
    }, 60000);
  });
}

// Handle eth_accounts
async function handleEthAccounts() {
  const data = await chrome.storage.local.get('base_wallet_address');
  return { result: data.base_wallet_address ? [data.base_wallet_address] : [] };
}

// Handle eth_chainId
async function handleEthChainId() {
  // Base Mainnet = 8453 (0x2105)
  // Could make this configurable later
  return { result: '0x2105' };
}

// Handle eth_getBalance
async function handleEthGetBalance(params) {
  const [address, blockTag] = params;
  console.log('[Yoda Background] eth_getBalance for:', address, 'at block:', blockTag);
  
  try {
    // Use fetch to query Base RPC directly
    const response = await fetch('https://1rpc.io/base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, blockTag || 'latest'],
        id: 1
      })
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return { result: data.result };
  } catch (error) {
    console.error('[Yoda Background] eth_getBalance failed:', error);
    throw error;
  }
}

// Handle eth_sendTransaction
async function handleEthSendTransaction(txParams, tabId) {
  console.log('[Yoda Background] eth_sendTransaction:', txParams);
  
  // Get tab info for origin
  let origin = 'Unknown';
  try {
    const tab = await chrome.tabs.get(tabId);
    const url = new URL(tab.url);
    origin = url.origin;
  } catch (error) {
    console.error('[Yoda Background] Error getting tab info:', error);
  }
  
  // Store pending transaction
  await chrome.storage.local.set({ 
    pending_base_tx: txParams,
    pending_base_tx_origin: origin,
    pending_base_tab_id: tabId 
  });
  
  // Open popup for confirmation
  try {
    const popupUrl = chrome.runtime.getURL('index.html#/confirm-base-tx');
    const popupWindow = await chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 600,
      focused: true,
    });
    
    await chrome.storage.local.set({ base_tx_popup_window_id: popupWindow.id });
  } catch (error) {
    console.error('[Yoda Background] Error opening transaction popup:', error);
    await chrome.storage.local.remove(['pending_base_tx', 'pending_base_tx_origin', 'pending_base_tab_id']);
    throw new Error('Failed to open transaction confirmation popup');
  }

  // Wait for user to confirm
  return new Promise((resolve, reject) => {
    const checkTx = async () => {
      const data = await chrome.storage.local.get(['pending_base_tx', 'base_tx_result', 'base_tx_error']);
      
      if (!data.pending_base_tx && data.base_tx_result) {
        const result = data.base_tx_result;
        await chrome.storage.local.remove(['base_tx_result', 'base_tx_error', 'base_tx_popup_window_id']);
        resolve({ result });
      } else if (!data.pending_base_tx && data.base_tx_error) {
        const error = data.base_tx_error;
        await chrome.storage.local.remove(['base_tx_result', 'base_tx_error', 'base_tx_popup_window_id']);
        reject(new Error(error));
      } else {
        setTimeout(checkTx, 500);
      }
    };
    
    checkTx();
    
    setTimeout(async () => {
      const data = await chrome.storage.local.get('pending_base_tx');
      if (data.pending_base_tx) {
        await chrome.storage.local.remove(['pending_base_tx', 'pending_base_tx_origin', 'pending_base_tab_id', 'base_tx_popup_window_id']);
        reject(new Error('Transaction confirmation timeout'));
      }
    }, 60000);
  });
}

// Handle eth_sign / personal_sign
async function handleEthSign(params, tabId) {
  console.log('[Yoda Background] eth_sign/personal_sign:', params);
  
  // Get tab info for origin
  let origin = 'Unknown';
  try {
    const tab = await chrome.tabs.get(tabId);
    const url = new URL(tab.url);
    origin = url.origin;
  } catch (error) {
    console.error('[Yoda Background] Error getting tab info:', error);
  }
  
  // personal_sign: params = [message, address]
  // eth_sign: params = [address, message]
  // We need to detect which one it is
  let message, address;
  if (params[0] && params[0].startsWith('0x') && params[0].length > 42) {
    // Likely personal_sign format (message first)
    message = params[0];
    address = params[1];
  } else {
    // Likely eth_sign format (address first)
    address = params[0];
    message = params[1];
  }
  
  // Store pending signature request
  await chrome.storage.local.set({ 
    pending_base_sign: {
      message,
      address,
      origin
    },
    pending_base_sign_tab_id: tabId 
  });
  
  // Open popup for confirmation
  try {
    const popupUrl = chrome.runtime.getURL('index.html#/confirm-base-sign');
    const popupWindow = await chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 700,
      focused: true,
    });
    
    await chrome.storage.local.set({ base_sign_popup_window_id: popupWindow.id });
  } catch (error) {
    console.error('[Yoda Background] Error opening sign popup:', error);
    await chrome.storage.local.remove(['pending_base_sign', 'pending_base_sign_tab_id']);
    throw new Error('Failed to open signature confirmation popup');
  }

  // Wait for user to confirm
  return new Promise((resolve, reject) => {
    const checkSign = async () => {
      const data = await chrome.storage.local.get(['pending_base_sign', 'base_sign_result', 'base_sign_error']);
      
      if (!data.pending_base_sign && data.base_sign_result) {
        const result = data.base_sign_result;
        await chrome.storage.local.remove(['base_sign_result', 'base_sign_error', 'base_sign_popup_window_id']);
        resolve({ result });
      } else if (!data.pending_base_sign && data.base_sign_error) {
        const error = data.base_sign_error;
        await chrome.storage.local.remove(['base_sign_result', 'base_sign_error', 'base_sign_popup_window_id']);
        reject(new Error(error));
      } else {
        setTimeout(checkSign, 500);
      }
    };
    
    checkSign();
    
    setTimeout(async () => {
      const data = await chrome.storage.local.get('pending_base_sign');
      if (data.pending_base_sign) {
        await chrome.storage.local.remove(['pending_base_sign', 'pending_base_sign_tab_id', 'base_sign_popup_window_id']);
        reject(new Error('Signature request timeout'));
      }
    }, 60000);
  });
}

// Handle eth_signTypedData
async function handleEthSignTypedData(params, tabId) {
  console.log('[Yoda Background] eth_signTypedData:', params);
  // TODO: Implement typed data signature confirmation popup
  throw new Error('Sign typed data not yet implemented for Base');
}

// Handle wallet_switchEthereumChain
async function handleSwitchChain(params) {
  const requestedChainId = params.chainId;
  console.log('[Yoda Background] wallet_switchEthereumChain:', requestedChainId);
  
  // For now, only support Base Mainnet
  if (requestedChainId === '0x2105') {
    return { result: null };
  }
  
  throw new Error(`Chain ${requestedChainId} not supported. Only Base Mainnet (0x2105) is supported.`);
}

// Handle wallet_getCapabilities (EIP-5792)
async function handleGetCapabilities(params) {
  console.log('[Yoda Background] wallet_getCapabilities:', params);
  
  // Return empty capabilities for now
  // This indicates no special capabilities like paymasters, session keys, etc.
  const address = params[0];
  
  return {
    result: {
      '0x2105': { // Base Mainnet
        // No special capabilities yet
      }
    }
  };
}

// Handle popup window closing
chrome.windows.onRemoved.addListener(async (windowId) => {
  const data = await chrome.storage.local.get([
    'popup_window_id', 
    'pending_connection',
    'base_popup_window_id',
    'pending_base_connection',
    'base_tx_popup_window_id',
    'pending_base_tx',
    'base_sign_popup_window_id',
    'pending_base_sign'
  ]);
  
  // Handle Keeta connection popup
  if (data.popup_window_id === windowId && data.pending_connection) {
    console.log('[Yoda Background] Keeta popup closed without response');
    await chrome.storage.local.set({ 
      pending_connection: false,
      popup_window_id: null 
    });
  }
  
  // Handle Base connection popup
  if (data.base_popup_window_id === windowId && data.pending_base_connection) {
    console.log('[Yoda Background] Base popup closed without response');
    await chrome.storage.local.set({ 
      pending_base_connection: false,
      base_popup_window_id: null 
    });
  }
  
  // Handle Base transaction popup
  if (data.base_tx_popup_window_id === windowId && data.pending_base_tx) {
    console.log('[Yoda Background] Base transaction popup closed without response');
    await chrome.storage.local.set({ 
      pending_base_tx: null,
      base_tx_error: 'User closed popup',
      base_tx_popup_window_id: null 
    });
  }
  
  // Handle Base signature popup
  if (data.base_sign_popup_window_id === windowId && data.pending_base_sign) {
    console.log('[Yoda Background] Base signature popup closed without response');
    await chrome.storage.local.set({ 
      pending_base_sign: null,
      base_sign_error: 'User closed popup',
      base_sign_popup_window_id: null 
    });
  }
});

console.log('[Yoda Background] Service worker ready!');

