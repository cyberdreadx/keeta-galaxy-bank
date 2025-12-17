# Chrome Web Store Submission Guide - Yoda Wallet

## Prerequisites

Before you start, make sure you have:

- [ ] Google Account
- [ ] $5 for Chrome Web Store developer registration (one-time fee)
- [ ] Privacy Policy hosted online (we've created PRIVACY_POLICY.md)
- [ ] Store listing description (see STORE_LISTING.md)
- [ ] Visual assets (icons, screenshots - see below)

## Step 1: Build and Package the Extension

### Quick Method:
```bash
./package-extension.sh
```

This script will:
1. Clean previous builds
2. Run `npm run build`
3. Verify all required files
4. Create `yoda-wallet-chrome-store.zip` with proper structure

### Manual Method:
```bash
npm run build
cd dist/
zip -r ../yoda-wallet-chrome-store.zip ./*
cd ..
```

**Important**: The `manifest.json` must be at the **root** of the zip, not inside a subfolder!

## Step 2: Prepare Visual Assets

### Required Assets

#### 1. Store Icon (Already done! ✓)
- **Size**: 128x128 pixels
- **Format**: PNG
- **File**: `dist/icon-128.png`
- **Purpose**: Main icon displayed in Chrome Web Store

#### 2. Screenshots (Need to create)
- **Size**: 1280x800 pixels OR 640x400 pixels
- **Format**: PNG or JPEG
- **Count**: At least 1 (recommended 3-5)
- **What to show**:
  - Main wallet dashboard
  - NFT gallery
  - Send/Receive interface
  - dApp connection approval
  - Transaction confirmation

**How to create screenshots**:
1. Open the extension popup (400x600)
2. Use a screenshot tool to capture at 2x resolution (800x1200)
3. Place the screenshot on a 1280x800 canvas with a nice background
4. Add a subtle drop shadow or glow effect (optional)

#### 3. Promotional Tile (Optional but recommended)
- **Size**: 440x280 pixels
- **Format**: PNG or JPEG
- **Purpose**: Featured in Chrome Web Store promotions
- **Content**: Extension name, logo, and tagline

**Suggested design**:
- Background: Space/cyberpunk theme
- Yoda Wallet logo (Hexagon with "Y")
- Text: "Yoda Wallet - The Intergalactic Web3 Wallet"
- Keeta + Base logos

#### 4. Small Promotional Tile (Optional)
- **Size**: 440x280 pixels
- **Format**: PNG or JPEG

## Step 3: Host Privacy Policy

### Option A: GitHub (Free)
Upload `PRIVACY_POLICY.md` to your GitHub repo, then use:
```
https://raw.githubusercontent.com/cyberdreadx/keeta-galaxy-bank/main/PRIVACY_POLICY.md
```

### Option B: Your Website (Recommended)
Host the privacy policy at:
```
https://keeta.com/yoda-wallet/privacy
```

Convert the Markdown to HTML or use a Markdown renderer.

## Step 4: Register as a Chrome Web Store Developer

1. Go to: https://chrome.google.com/webstore/devconsole
2. Sign in with your Google Account
3. Accept the Chrome Web Store Developer Agreement
4. Pay the $5 registration fee (one-time, non-refundable)
5. Fill in your developer information

## Step 5: Upload Your Extension

### In the Chrome Web Store Developer Dashboard:

1. Click **"+ NEW ITEM"** button

2. **Upload the ZIP file**:
   - Select `yoda-wallet-chrome-store.zip`
   - Wait for upload and validation
   - Fix any errors if they appear

3. **Fill in Store Listing**:

#### Package Tab
- Upload successful ✓

#### Store Listing Tab

**Product Details**:
- **Detailed Description**: (Copy from STORE_LISTING.md)
- **Category**: Choose "Productivity" or "Developer Tools"
- **Language**: English

**Graphic Assets**:
- **Store Icon**: Upload `icon-128.png` (128x128)
- **Screenshots**: Upload your created screenshots (1280x800)
- **Promotional Tile**: Upload if created (440x280)

**Additional Fields**:
- **Official URL**: `https://keeta.com` or your website
- **Support URL**: `https://github.com/cyberdreadx/keeta-galaxy-bank/issues`

#### Privacy Tab (CRITICAL!)

**Single Purpose**:
```
Yoda Wallet is a non-custodial cryptocurrency wallet for managing digital assets on Keeta L1 and Base networks.
```

**Permission Justification**:
```
storage: Store encrypted wallet data locally
activeTab: Interact with current webpage when user authorizes dApp connection
tabs: Open popup windows for transaction confirmations
clipboardWrite/Read: Copy wallet addresses and paste transaction data
<all_urls>: Inject Web3 provider to enable dApp connectivity (requires explicit user approval for each site)
```

**Data Usage**:
- Select: **"Not collecting user data"** (if true)
- Or declare what you collect and provide Privacy Policy URL

**Privacy Policy URL**:
```
https://keeta.com/yoda-wallet/privacy
```
(Or your GitHub raw URL)

**Certification**:
- Check all required boxes
- Certify that you're compliant with Chrome Web Store policies

## Step 6: Submit for Review

1. Review all information
2. Click **"Submit for Review"**
3. Wait for Google's review (typically 1-7 days)

### Expected Review Timeline:
- **Simple extensions**: 1-2 days
- **Extensions with `<all_urls>`**: 3-7 days (manual review required)
- **Complex extensions**: Up to 14 days

## Step 7: After Approval

Once approved:
1. Your extension will be live in the Chrome Web Store
2. You'll receive an email notification
3. Share the store link: `https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID`

## Common Rejection Reasons and How to Avoid Them

### 1. Excessive Permissions
**Issue**: Requesting unnecessary permissions
**Solution**: We've minimized permissions to only what's needed

### 2. Missing Privacy Policy
**Issue**: No privacy policy URL provided
**Solution**: Host PRIVACY_POLICY.md and provide the URL

### 3. Unclear Description
**Issue**: Store listing doesn't explain what the extension does
**Solution**: Use the detailed description from STORE_LISTING.md

### 4. Low-Quality Graphics
**Issue**: Blurry or unprofessional screenshots
**Solution**: Create high-resolution, professional screenshots

### 5. Functionality Issues
**Issue**: Extension doesn't work as described
**Solution**: Test thoroughly before submission

### 6. Keyword Stuffing
**Issue**: Too many keywords in description
**Solution**: Our description is clean and focused

## Post-Submission Checklist

After submitting:
- [ ] Monitor your email for review feedback
- [ ] Check the developer dashboard daily
- [ ] Prepare to respond to any feedback within 7 days
- [ ] Have a plan for updates if changes are requested

## Updating the Extension

To publish an update:
1. Increment version in `manifest.json`
2. Run `./package-extension.sh` to create new zip
3. Go to Chrome Web Store Developer Dashboard
4. Click on your extension
5. Click "Upload Updated Package"
6. Submit the new `yoda-wallet-chrome-store.zip`
7. Wait for review (usually faster for updates)

## Support Resources

- **Chrome Web Store Developer Policies**: https://developer.chrome.com/docs/webstore/program-policies/
- **Publishing Guide**: https://developer.chrome.com/docs/webstore/publish/
- **Developer Dashboard**: https://chrome.google.com/webstore/devconsole
- **Support Forum**: https://groups.google.com/a/chromium.org/g/chromium-extensions

## Tips for Faster Approval

1. **Minimize Permissions**: We've already done this
2. **Clear Documentation**: Privacy policy and store listing are comprehensive
3. **Professional Assets**: Create high-quality screenshots
4. **Test Thoroughly**: Make sure everything works before submitting
5. **Respond Quickly**: If reviewers ask questions, respond within 24 hours

## Cost Summary

- **Developer Registration**: $5 (one-time)
- **Hosting Privacy Policy**: $0 (use GitHub) or minimal (on your website)
- **Extension Development**: Already done! ✓

---

## Quick Start

1. Run `./package-extension.sh`
2. Create screenshots of the extension
3. Upload PRIVACY_POLICY.md to GitHub or your website
4. Go to https://chrome.google.com/webstore/devconsole
5. Upload `yoda-wallet-chrome-store.zip`
6. Fill in store listing using STORE_LISTING.md
7. Submit for review!

**Good luck! May the Force be with your submission! 🚀**

