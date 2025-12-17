# Privacy Policy for Yoda Wallet

**Last Updated:** December 17, 2024

## Overview

Yoda Wallet ("we", "our", or "the extension") is a non-custodial cryptocurrency wallet that allows users to manage their digital assets on the Keeta L1 and Base networks. We are committed to protecting your privacy and being transparent about how we handle your data.

## Data Collection and Storage

### What We Collect

Yoda Wallet is a **client-side, non-custodial wallet**. All sensitive data is stored locally on your device. We collect and store the following information **locally** on your device:

- **Private Keys and Seed Phrases**: Encrypted and stored locally in your browser's secure storage
- **Wallet Addresses**: Public addresses for your Keeta and Base accounts
- **Transaction History**: Cached locally for display purposes
- **Preferences and Settings**: Display language, currency preferences, hidden tokens
- **Connected Sites**: List of dApps you've authorized to connect to your wallet
- **NFT Metadata**: Cached NFT information fetched from blockchain APIs

### What We DO NOT Collect

- We **do not** collect, transmit, or store your private keys, seed phrases, or passwords on any server
- We **do not** track your browsing history
- We **do not** collect personal identification information (name, email, phone number)
- We **do not** share your wallet addresses or transaction data with third parties
- We **do not** use analytics or tracking tools

## Third-Party Services

Yoda Wallet connects to the following third-party services to function properly:

### Blockchain Networks
- **Keeta Network APIs** (`*.keeta.com`): To query balances, send transactions, and fetch blockchain data
- **Base Network RPCs** (`*.base.org`, `1rpc.io`, `base.llamarpc.com`): To interact with the Base blockchain

### Price Feeds
- **CoinGecko API** (`*.coingecko.com`): To fetch cryptocurrency prices
- **DexScreener API** (`*.dexscreener.com`): To fetch token prices and market data

### NFT Metadata
- **IPFS Gateways** (`ipfs.io`, `*.ipfs.io`): To display NFT images and metadata

### Web3 Connectivity
- **WalletConnect** (`*.walletconnect.org`): To enable connections with dApps

**Note**: When you use these services, you are subject to their respective privacy policies. We recommend reviewing them:
- [Keeta Network Privacy Policy](https://keeta.com/privacy)
- [Base Network](https://www.base.org)
- [CoinGecko Privacy Policy](https://www.coingecko.com/en/privacy)

## How We Use Your Data

All data is stored **locally on your device** and is used solely for:

1. **Wallet Functionality**: Managing your accounts, displaying balances, and executing transactions
2. **dApp Interactions**: Connecting to decentralized applications you authorize
3. **User Experience**: Remembering your preferences and settings

## Data Security

- **Encryption**: All sensitive data (private keys, seed phrases) is encrypted before being stored locally
- **No Server Storage**: We do not store any of your data on our servers
- **User Control**: You have complete control over your data and can delete it at any time by removing the extension

## Permissions Explained

Yoda Wallet requests the following Chrome permissions:

- **`storage`**: To save your encrypted wallet data, preferences, and settings locally
- **`activeTab`**: To interact with the current webpage when you explicitly authorize a dApp connection
- **`tabs`**: To open popup windows for transaction confirmations
- **`clipboardWrite`** and **`clipboardRead`**: To copy wallet addresses and paste transaction data
- **Host Permissions** (`<all_urls>`): To inject the Web3 provider (`window.yoda`, `window.ethereum`) into websites so dApps can request to connect to your wallet

**Important**: The `<all_urls>` permission does **not** mean we access all websites. It only allows the extension to offer connection capabilities when a dApp explicitly requests it. You must manually approve each connection.

## Your Rights

You have the right to:

- **Access**: View all data stored by the extension in your browser's local storage
- **Delete**: Remove the extension at any time to delete all locally stored data
- **Export**: Export your private keys or seed phrase (keep them secure!)
- **Disconnect**: Revoke access for any connected dApp at any time

## Children's Privacy

Yoda Wallet is not intended for use by anyone under the age of 18. We do not knowingly collect data from children.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this document. Continued use of the extension after changes indicates acceptance of the updated policy.

## Contact Us

If you have any questions or concerns about this privacy policy, please contact us:

- **Website**: https://keeta.com
- **Email**: support@keeta.com
- **GitHub**: https://github.com/cyberdreadx/keeta-galaxy-bank

## Open Source

Yoda Wallet is open source. You can review our code at:
https://github.com/cyberdreadx/keeta-galaxy-bank

## Compliance

Yoda Wallet complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

---

**By using Yoda Wallet, you acknowledge that you have read and understood this Privacy Policy.**

