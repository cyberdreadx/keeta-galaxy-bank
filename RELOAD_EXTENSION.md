# 🔄 How to Reload Yoda Wallet Extension

## ⚠️ **The extension MUST be reloaded for changes to take effect!**

---

## 📋 **Step-by-Step Reload Process**

### **Method 1: Quick Reload (Recommended)**

1. **Open Chrome Extensions:**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode** (top-right toggle)

3. **Find "Yoda Wallet"**

4. **Click the reload icon** (circular arrow) ↻

5. **Close ALL pages** that had the wallet injected
   - Close DegenSwap tab
   - Close test pages
   - Open fresh tabs

6. **Reopen your dApp**

---

### **Method 2: Complete Reinstall (If Method 1 Fails)**

1. **Go to:** `chrome://extensions/`

2. **Remove Yoda Wallet:**
   - Click "Remove" on Yoda Wallet
   - Confirm removal

3. **Click "Load unpacked"**

4. **Select the `dist` folder:**
   ```
   /Users/rouge/Documents/GitHub/keeta-galaxy-bank/dist
   ```

5. **Verify version is 1.0.3:**
   - Should show in extension details

6. **Close ALL browser tabs that had wallet**

7. **Reopen your dApp in a fresh tab**

---

## ✅ **How to Verify It Worked**

### **Check Extension Version:**

1. Go to `chrome://extensions/`
2. Find Yoda Wallet
3. Click "Details"
4. Version should show: **1.0.3**

### **Check Console Logs:**

Open browser console on your dApp page and you should see:

```
[Yoda] Providers injected!
  - window.yoda (Keeta dApps)
  - window.keeta (Keeta dApps)
  - window.ethereum (Base/EVM dApps)
```

### **Test Token Parameter:**

Open browser console and run:

```javascript
// This should NOT error anymore
window.yoda.sendTransaction({
  to: 'keeta_test',
  amount: '1',
  token: 'keeta_token_test'
}).catch(err => console.log('Expected to fail but with popup, not undefined error'));
```

If you still see `Cannot read properties of undefined`, the old extension is still loaded.

---

## 🐛 **Still Not Working?**

### **Nuclear Option: Clear Everything**

```bash
# 1. Close Chrome completely
# 2. Clear extension cache
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Extensions

# 3. Reopen Chrome
# 4. Load extension from dist/ folder
```

---

## 🔍 **Common Issues**

### **Issue: Same error after reload**
**Cause:** Chrome cached the old service worker  
**Fix:** 
1. Remove extension completely
2. Close Chrome
3. Reopen Chrome
4. Load extension again

### **Issue: Extension version still shows 1.0.2 or earlier**
**Cause:** Wrong folder selected  
**Fix:** Make sure you select the `dist` folder, not the root folder

### **Issue: "Cannot read properties of undefined" persists**
**Cause:** Old extension still loaded  
**Fix:** Follow "Complete Reinstall" method above

---

## 📌 **Remember:**

Every time you rebuild with `npm run build`:
1. The `dist/` folder is updated
2. BUT Chrome keeps running the old code
3. You MUST click the reload button
4. AND close/reopen pages that use the extension

---

## ✅ **Checklist**

- [ ] Ran `npm run build`
- [ ] Version in manifest.json is 1.0.3
- [ ] Went to chrome://extensions/
- [ ] Clicked reload button on Yoda Wallet
- [ ] Verified version shows 1.0.3
- [ ] Closed ALL tabs with dApps
- [ ] Reopened dApp in fresh tab
- [ ] Tested token transfer

---

**After reloading, your NFT transfer should work!** ✅

