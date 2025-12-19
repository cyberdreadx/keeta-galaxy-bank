# 🪙 Send Any Token Feature

## ✅ **Feature Complete!**

Yoda Wallet now supports sending **ANY token** you have in your wallet, not just KTA!

---

## 🎯 **What's New**

### **Before (❌)**
- Could only send KTA (native token)
- No way to send custom tokens like KCHAD, PACA, MURF, etc.
- Had to use CLI or other tools for token transfers

### **After (✅)**
- ✅ Send **any token** from your wallet
- ✅ Automatic token detection from your balance
- ✅ Token selector dropdown with balances
- ✅ Proper decimal handling for each token
- ✅ Works with NFTs, meme coins, and custom tokens

---

## 🚀 **How It Works**

### **1. Token Detection**

The wallet automatically fetches ALL tokens you own:

```typescript
// From useKeetaBalance hook
const { allTokens } = useKeetaBalance();

// Returns array of:
[
  { symbol: 'KTA', balance: 1000.5, decimals: 18, address: 'keeta_...' },
  { symbol: 'KCHAD', balance: 500, decimals: 18, address: 'keeta_...' },
  { symbol: 'PACA', balance: 250, decimals: 18, address: 'keeta_...' },
  // ... all your tokens
]
```

### **2. Token Selection UI**

New dropdown selector on the Send page:

```
┌─────────────────────────────────────┐
│ SELECT TOKEN                        │
│ ┌─────────────────────────────────┐ │
│ │ KTA - 1,000.50 (Keeta)       ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Options:                            │
│ • KTA - 1,000.50 (Keeta)            │
│ • KCHAD - 500.00 (KeetaChad)        │
│ • PACA - 250.00 (Alpaca)            │
│ • MURF - 100 (Murphy)               │
│ • ... all your tokens               │
└─────────────────────────────────────┘
```

### **3. Smart Transfer Logic**

The wallet automatically determines how to send:

```typescript
if (selectedToken.symbol === 'KTA') {
  // Use simple send for native token
  await client.send(recipient, amount);
} else {
  // Use sendToken for custom tokens
  await sendToken(recipient, amount, tokenAddress);
}
```

---

## 📋 **Supported Tokens**

### **Automatically Recognized:**

| Symbol | Name | Decimals | Type |
|--------|------|----------|------|
| **KTA** | Keeta | 18 | Native |
| **USDC** | USD Coin | 6 | Stablecoin |
| **EURC** | Euro Coin | 6 | Stablecoin |
| **cbBTC** | Coinbase BTC | 8 | Wrapped BTC |
| **KCHAD** | KeetaChad | 18 | Meme |
| **KRT** | Kreet | 8 | Token |
| **MURF** | Murphy | 0 | NFT/Token |
| **PACA** | Alpaca | 18 | Token |
| **NDA** | NDA | 18 | Token |
| **AKTA** | Alpaca KTA | 18 | Token |
| **KTARD** | KTARD | 18 | Meme |
| **DRINK** | Drink | 18 | Token |
| **SPIT** | Spit | 18 | Token |
| **ERIC** | Eric | 18 | Meme |
| **SOON** | Soon | 18 | Token |
| **KWIF** | Kwif | 18 | Meme |

### **Unknown Tokens:**

If you have a token not in the list, it will show as:
- Symbol: `keeta_abc...` (truncated address)
- Decimals: 18 (default)
- Still fully sendable!

---

## 🎮 **How to Use**

### **Step 1: Open Send Page**

Navigate to the Send page in Yoda Wallet.

### **Step 2: Select Token**

1. Click the "SELECT TOKEN" dropdown
2. Choose the token you want to send
3. Your balance for that token will display

### **Step 3: Enter Details**

1. **Recipient**: Enter the Keeta address (starts with `keeta_`)
2. **Amount**: Enter the amount to send
3. Click "MAX" to send all of that token

### **Step 4: Send**

Click "SEND CREDITS" and confirm the transaction!

---

## 🔧 **Technical Implementation**

### **1. Updated KeetaWalletContext**

Added `sendToken` method:

```typescript
const sendToken = async (to: string, amount: string, tokenAddress: string) => {
  const recipientAccount = KeetaNet.lib.Account.fromPublicKeyString(to);
  const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenAddress);
  
  const builder = state.client.initBuilder();
  builder.send(recipientAccount, BigInt(amount), tokenAccount);
  
  await state.client.computeBuilderBlocks(builder);
  const transaction = await state.client.publishBuilder(builder);
  
  return transaction.hash;
};
```

### **2. Updated Send Page**

- Added token selector dropdown
- Integrated with `allTokens` from `useKeetaBalance`
- Dynamic balance display based on selected token
- Proper decimal handling per token

### **3. Updated Background Script**

- Token transfers now properly flagged as `isTokenTransfer`
- Confirmation UI shows token details
- Works seamlessly with dApps

---

## 🧪 **Testing**

### **Test Sending Different Tokens:**

1. **KTA (Native):**
   ```
   Recipient: keeta_...
   Amount: 10
   Token: KTA
   ```

2. **Meme Coin (KCHAD):**
   ```
   Recipient: keeta_...
   Amount: 100
   Token: KCHAD
   ```

3. **NFT (MURF - 0 decimals):**
   ```
   Recipient: keeta_...
   Amount: 1
   Token: MURF
   ```

4. **Stablecoin (USDC - 6 decimals):**
   ```
   Recipient: keeta_...
   Amount: 50
   Token: USDC
   ```

---

## 📊 **Decimal Handling**

The wallet automatically handles different decimal places:

| Token | Decimals | Input | Sent (Raw) |
|-------|----------|-------|------------|
| KTA | 18 | 1.5 | 1500000000000000000 |
| USDC | 6 | 100 | 100000000 |
| cbBTC | 8 | 0.01 | 1000000 |
| MURF | 0 | 5 | 5 |

---

## 🎨 **UI Features**

### **Token Dropdown:**
- Shows symbol, balance, and full name
- Sorted: KTA first, then by balance
- Searchable (browser default)
- Icon indicator (Coins icon)

### **Balance Display:**
- Updates dynamically when token changes
- Shows correct symbol
- Formatted with proper decimals

### **Send Button:**
- Validates balance for selected token
- Shows correct symbol in confirmation

---

## 🔐 **Security**

- ✅ Balance validation per token
- ✅ Decimal precision maintained
- ✅ Transaction confirmation required
- ✅ Proper error handling
- ✅ No token address spoofing

---

## 🚀 **Use Cases**

### **1. Send Meme Coins to Friends**
```
Token: KCHAD
Amount: 420
To: Your friend's address
```

### **2. Pay with Stablecoins**
```
Token: USDC
Amount: 50
To: Merchant address
```

### **3. Transfer NFTs**
```
Token: MURF (or any NFT)
Amount: 1
To: New owner address
```

### **4. Distribute Tokens**
```
Token: PACA
Amount: 100
To: Multiple recipients (send multiple times)
```

---

## 📝 **Known Tokens Reference**

Based on [Keeta SDK documentation](https://docs.keeta.com) and the wallet's token map:

### **Mainnet Tokens:**
- `keeta_anqdilpazdekdu4acw65fj7smltcp26wbrildkqtszqvverljpwpezmd44ssg` - KTA (18 decimals)
- `keeta_amnkge74xitii5dsobstldatv3irmyimujfjotftx7plaaaseam4bntb7wnna` - USDC (6 decimals)
- `keeta_apblhar4ncp3ln62wrygsn73pt3houuvj7ic47aarnolpcu67oqn4xqcji3au` - EURC (6 decimals)
- `keeta_apyez4az5r6shtblf3qtzirmikq3tghb5svrmmrltdkxgnnzzhlstby3cuscc` - cbBTC (8 decimals)

### **Community Tokens:**
- `keeta_anin2xcn2ijmhezrmrzyoabztxc5kq43n3ftr4bziw2unvg46dvncqkbbpc72` - KCHAD (18 decimals)
- `keeta_ao55q4okjv4hrbo7z7zl3hivrf64og3fpokup5hvt2wfejim5mxzxcykboc3w` - PACA (18 decimals)
- `keeta_ao7nitutebhm2pkrfbtniepivaw324hecyb43wsxts5rrhi2p5ckgof37racm` - MURF (0 decimals)
- ... and many more!

---

## ✅ **Summary**

| Feature | Status |
|---------|--------|
| Send KTA | ✅ Works |
| Send Custom Tokens | ✅ Works |
| Send NFTs | ✅ Works |
| Token Selector UI | ✅ Implemented |
| Decimal Handling | ✅ Automatic |
| Balance Validation | ✅ Per Token |
| dApp Integration | ✅ Compatible |

---

## 🎉 **Result**

You can now send **ANY token** you own in Yoda Wallet!

- ✅ No more CLI required
- ✅ User-friendly dropdown
- ✅ Automatic token detection
- ✅ Works with all token types
- ✅ Proper decimal handling

---

**Version:** 1.0.3  
**Status:** ✅ Live and Ready  
**Documentation:** Complete  

**Happy token sending!** 🚀

