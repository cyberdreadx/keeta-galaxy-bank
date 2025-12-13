import { KEYUTIL, jws } from 'jsrsasign';

const CDP_API_KEY_NAME = "organizations/cd44dadf-d0a2-48e5-b909-b741c83020a7/apiKeys/56b8f1f1-e06f-48ae-bf88-32bc6fa12b75";

// Constructing key line by line to avoid escaping issues
const KEY_HEADER = "-----BEGIN EC PRIVATE KEY-----";
const KEY_BODY_1 = "MHcCAQEEID65wRnDlaEckIE+sStaFFprO+UFfB37QEMvBOudgvfdoAoGCCqGSM49";
const KEY_BODY_2 = "AwEHoUQDQgAEerUkLSVbCrNcMOXRENT95Vi1d2t+kHsNCNGQoWfBtu7ssNkvwF9a";
const KEY_BODY_3 = "lGB2Cy/PpFBZH66/QtPm9fznZF8DLJhTlg==";
const KEY_FOOTER = "-----END EC PRIVATE KEY-----";

const CDP_PRIVATE_KEY = `${KEY_HEADER}\n${KEY_BODY_1}\n${KEY_BODY_2}\n${KEY_BODY_3}\n${KEY_FOOTER}`;

export async function generateCoinbaseSessionToken(walletAddress: string) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const requestMethod = 'POST';
    const host = 'api.developer.coinbase.com';
    const requestPath = '/onramp/v1/token';
    const requestUrl = `https://${host}${requestPath}`;
    
    // JWT Header for CDP API Auth
    const header = { 
      alg: 'ES256', 
      typ: 'JWT', 
      kid: CDP_API_KEY_NAME,
      nonce: crypto.randomUUID() // Add nonce for security
    };
    
    // JWT Payload for CDP API Auth
    // The 'uri' claim must match the API endpoint we are calling
    const payload = {
      iss: 'cdp',
      nbf: now - 10,
      exp: now + 120,
      sub: CDP_API_KEY_NAME, // Subject is the API Key Name
      uri: `${requestMethod} ${host}${requestPath}`, // Format: "POST api.developer.coinbase.com/onramp/v1/token"
    };

    console.log("Signing JWT for CDP API...", payload.uri);
    
    // Parse key
    const keyObj = KEYUTIL.getKey(CDP_PRIVATE_KEY);
    
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
    console.log("Session Token received:", data.token);
    return data.token;

  } catch (error) {
    console.error("Error generating session token:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return null;
  }
}
