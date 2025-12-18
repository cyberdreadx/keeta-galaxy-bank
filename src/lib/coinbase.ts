import { KEYUTIL, jws } from 'jsrsasign';

// ⚠️ SECURITY: NEVER hardcode API keys in source code!
// Users must provide their own Coinbase API credentials

interface CoinbaseConfig {
  apiKeyName: string;
  privateKey: string;
}

// Get API credentials from secure storage
async function getCoinbaseCredentials(): Promise<CoinbaseConfig | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(['coinbase_api_key_name', 'coinbase_private_key']);
      
      if (!result.coinbase_api_key_name || !result.coinbase_private_key) {
        console.warn('⚠️ Coinbase API credentials not configured. User must set them up.');
        return null;
      }
      
      return {
        apiKeyName: result.coinbase_api_key_name,
        privateKey: result.coinbase_private_key
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Coinbase credentials:', error);
    return null;
  }
}

export async function generateCoinbaseSessionToken(walletAddress: string) {
  try {
    // Get API credentials from secure storage
    const credentials = await getCoinbaseCredentials();
    
    if (!credentials) {
      throw new Error('Coinbase API credentials not configured. Please set up in Settings.');
    }

    const now = Math.floor(Date.now() / 1000);
    const requestMethod = 'POST';
    const host = 'api.developer.coinbase.com';
    const requestPath = '/onramp/v1/token';
    const requestUrl = `https://${host}${requestPath}`;
    
    // JWT Header for CDP API Auth
    const header = { 
      alg: 'ES256', 
      typ: 'JWT', 
      kid: credentials.apiKeyName,
      nonce: crypto.randomUUID() // Add nonce for security
    };
    
    // JWT Payload for CDP API Auth
    // The 'uri' claim must match the API endpoint we are calling
    const payload = {
      iss: 'cdp',
      nbf: now - 10,
      exp: now + 120,
      sub: credentials.apiKeyName, // Subject is the API Key Name
      uri: `${requestMethod} ${host}${requestPath}`, // Format: "POST api.developer.coinbase.com/onramp/v1/token"
    };

    console.log("Signing JWT for CDP API...");
    
    // Parse key
    const keyObj = KEYUTIL.getKey(credentials.privateKey);
    
    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);
    
    // Sign Bearer Token
    const jwt = jws.JWS.sign("ES256", sHeader, sPayload, keyObj);
    
    console.log("JWT generated. Calling Coinbase API...");

    // Call Coinbase API to get the Session Token
    const body = {
      addresses: [
        {
          address: walletAddress,
          blockchains: ["base"] 
        }
      ],
      assets: ["ETH", "USDC"], // Assets to enable
    };

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Coinbase API Error:", response.status, errText);
      throw new Error(`Coinbase API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    console.log("Session Token received");
    return data.token;

  } catch (error) {
    console.error("Error generating session token:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return null;
  }
}

// Helper function to save Coinbase API credentials securely
export async function saveCoinbaseCredentials(apiKeyName: string, privateKey: string): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({
      coinbase_api_key_name: apiKeyName,
      coinbase_private_key: privateKey
    });
  }
}

// Helper function to check if credentials are configured
export async function hasCoinbaseCredentials(): Promise<boolean> {
  const credentials = await getCoinbaseCredentials();
  return credentials !== null;
}
