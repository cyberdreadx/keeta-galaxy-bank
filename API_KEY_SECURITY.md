# 🚨 API KEY SECURITY - CRITICAL INCIDENT RESPONSE

## IMMEDIATE ACTIONS IF API KEY WAS EXPOSED

### **Your Situation: Coinbase API Key Exposed**

If your Coinbase API key with full account permissions was exposed (committed to GitHub, shared, or leaked), follow this **EMERGENCY CHECKLIST**:

---

## ⚡ **WITHIN 5 MINUTES:**

### 1. REVOKE THE EXPOSED API KEY IMMEDIATELY

**Go to Coinbase CDP Portal:**
```
https://portal.cdp.coinbase.com/access/api
```

**Steps:**
1. Sign in to your Coinbase account
2. Navigate to API Keys section
3. Find the exposed API key
4. Click "Revoke" or "Delete"
5. Confirm revocation

**If you see suspicious activity:**
- Revoke ALL API keys
- Change your Coinbase password
- Enable 2FA if not already active

### 2. Check for Unauthorized Activity

**Immediately review:**
- [ ] Recent transactions on Coinbase
- [ ] Withdrawal history
- [ ] API call logs (if available)
- [ ] Account balance changes
- [ ] Connected devices/sessions

**Look for:**
- Unexpected withdrawals
- Trades you didn't make
- Changed withdrawal addresses
- New linked payment methods

### 3. Freeze Your Account (If Needed)

If you see unauthorized activity:
1. Contact Coinbase Support **IMMEDIATELY**
   - https://help.coinbase.com/en/contact-us
   - Phone: 1-888-908-7930 (US)
2. Request account freeze
3. File a security incident report

---

## 📋 **WITHIN 1 HOUR:**

### 4. Assess the Damage

**Check where the key was exposed:**

#### If Committed to GitHub:
```bash
# Check git history
git log --all --full-history -- src/lib/coinbase.ts

# Check if it was pushed
git log --remotes --grep="coinbase"

# Check all branches
git log --all --oneline | grep -i coinbase
```

**⚠️ CRITICAL:** If the key was pushed to GitHub (public or private):
- **The key is PERMANENTLY exposed in Git history**
- GitHub's scanners may have detected it
- Bots scan GitHub for exposed keys 24/7
- Even if you delete the commit, it's still in history

#### If the Repository was Public:
- 🚨 **ASSUME THE KEY IS COMPROMISED**
- Hackers scrape GitHub every minute for exposed keys
- Automated bots test found keys immediately
- **This is likely how you got hacked**

### 5. Clean Git History (If Applicable)

**⚠️ WARNING:** This rewrites history and requires force-push

```bash
# Install BFG Repo-Cleaner
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Backup your repo first!
cp -r keeta-galaxy-bank keeta-galaxy-bank-backup

# Remove the sensitive file from ALL history
bfg --delete-files coinbase.ts

# Alternative: Remove sensitive strings
bfg --replace-text passwords.txt  # Create passwords.txt with exposed keys

# Cleanup
cd keeta-galaxy-bank
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ DANGEROUS - coordinate with team!)
git push origin --force --all
git push origin --force --tags
```

**Better Option:** Delete and recreate the repository if possible.

### 6. Create New API Key with LIMITED Permissions

**On Coinbase CDP Portal:**
1. Create new API key
2. **ONLY grant minimal permissions:**
   - ✅ OnRamp (for buying crypto)
   - ❌ Trading
   - ❌ Withdrawals
   - ❌ Account management
   - ❌ Full access

3. Download the private key
4. **NEVER commit it to source code**
5. Store securely (see below)

---

## 🔒 **PROPER API KEY STORAGE**

### **NEVER Do This:** ❌

```typescript
// ❌ WRONG - Hardcoded in source code
const API_KEY = "sk_live_abc123...";
const PRIVATE_KEY = "-----BEGIN EC PRIVATE KEY-----\nMHc...";
```

### **DO This:** ✅

#### Option 1: Environment Variables (Recommended for Development)

**Create `.env` file:**
```env
COINBASE_API_KEY_NAME=organizations/xxx/apiKeys/yyy
COINBASE_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
MHcCAQEEI...
-----END EC PRIVATE KEY-----"
```

**Add to `.gitignore`:**
```
.env
.env.local
.env.production
```

**Use in code:**
```typescript
const apiKeyName = process.env.COINBASE_API_KEY_NAME;
const privateKey = process.env.COINBASE_PRIVATE_KEY;
```

#### Option 2: Chrome Storage (Recommended for Extensions)

**Store encrypted:**
```typescript
import { encrypt } from '@/lib/encryption';

// User enters API key in settings
async function saveApiKey(apiKey: string, privateKey: string) {
  const userPassword = prompt('Enter your wallet password to encrypt API key');
  
  const encryptedApiKey = await encrypt(apiKey, userPassword);
  const encryptedPrivateKey = await encrypt(privateKey, userPassword);
  
  await chrome.storage.local.set({
    coinbase_api_key: encryptedApiKey,
    coinbase_private_key: encryptedPrivateKey
  });
}
```

#### Option 3: Server-Side API (Most Secure)

**Never expose API keys in client-side code:**
```typescript
// Client-side: Just call your backend
const response = await fetch('https://your-backend.com/api/coinbase/create-session', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${userToken}` },
  body: JSON.stringify({ walletAddress })
});

// Server-side: API keys stay on server
// Keys never leave your server
```

---

## 📝 **SECURITY BEST PRACTICES**

### 1. .gitignore Configuration

**Add to `.gitignore`:**
```
# API Keys and Secrets
.env
.env.local
.env.production
.env.test
*.pem
*.key
*-key.json
secrets/
config/secrets.json

# Development
node_modules/
.DS_Store
```

### 2. Pre-Commit Hooks

**Install git-secrets:**
```bash
brew install git-secrets

# Set up
cd your-repo
git secrets --install
git secrets --register-aws
git secrets --add 'BEGIN.*PRIVATE KEY'
git secrets --add 'api[_-]?key'
git secrets --add 'secret[_-]?key'
```

### 3. GitHub Secret Scanning

**Enable on GitHub:**
1. Go to repository Settings
2. Security & analysis
3. Enable "Secret scanning"
4. Enable "Push protection"

### 4. Regular Security Audits

**Weekly:**
- [ ] Review API key permissions
- [ ] Check API call logs
- [ ] Rotate keys if suspicious activity
- [ ] Scan codebase for exposed secrets

**Monthly:**
- [ ] Rotate all API keys
- [ ] Review access logs
- [ ] Update security practices
- [ ] Train team on key security

---

## 🛡️ **API KEY HYGIENE CHECKLIST**

### Before Creating API Key:
- [ ] Determine minimum required permissions
- [ ] Plan secure storage method
- [ ] Set up monitoring/alerts
- [ ] Document key purpose and owner

### After Creating API Key:
- [ ] Store in secure location (NOT source code)
- [ ] Add to .gitignore if stored locally
- [ ] Test with minimal permissions first
- [ ] Set up expiration/rotation schedule
- [ ] Document in secure location (password manager)

### During Development:
- [ ] Use environment variables
- [ ] Never commit keys to Git
- [ ] Use different keys for dev/prod
- [ ] Implement key rotation
- [ ] Monitor key usage

### If Key is Compromised:
- [ ] Revoke immediately
- [ ] Check for unauthorized usage
- [ ] Create new key with new permissions
- [ ] Update all systems using the key
- [ ] Conduct security audit
- [ ] File incident report

---

## 🚫 **COMMON MISTAKES TO AVOID**

### 1. "It's a Private Repo, It's Safe" ❌

**Wrong!**
- Team members can see it
- Repository can be made public by accident
- GitHub has access
- Compromised accounts expose all repos

### 2. "I'll Remove It Later" ❌

**Wrong!**
- Git history keeps everything forever
- Even deleted commits are recoverable
- Remove it NOW, not later

### 3. "I'll Just .gitignore It" ❌

**Wrong!**
- .gitignore only affects NEW files
- Already committed files stay in history
- Must use BFG or filter-branch to remove

### 4. "Only I Have Access" ❌

**Wrong!**
- Laptops get stolen
- Screens get shared
- Backups get compromised
- Malware can steal files

### 5. "It's Encrypted in Storage" ❌

**Wrong!**
- Source code encryption doesn't help
- Compiled/built code contains keys
- Keys are decrypted at runtime
- Use proper key management instead

---

## 📞 **EMERGENCY CONTACTS**

### Coinbase Support:
- **Website:** https://help.coinbase.com/en/contact-us
- **Phone (US):** 1-888-908-7930
- **Email:** security@coinbase.com (for security issues)
- **Emergency:** Use in-app chat for fastest response

### GitHub Support (for exposed keys):
- **Email:** support@github.com
- **Security:** security@github.com
- **Docs:** https://docs.github.com/en/code-security/secret-scanning

---

## 📚 **ADDITIONAL RESOURCES**

### Learn More:
- **OWASP Top 10:** https://owasp.org/Top10/
- **API Key Security:** https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password
- **Git Secrets:** https://github.com/awslabs/git-secrets
- **BFG Repo Cleaner:** https://rtyley.github.io/bfg-repo-cleaner/

### Tools:
- **TruffleHog:** Scan Git history for secrets
  ```bash
  docker run trufflesecurity/trufflehog github --org=your-org
  ```

- **GitGuardian:** Automated secret detection
  https://www.gitguardian.com/

- **AWS Secrets Manager:** For production secret storage
- **HashiCorp Vault:** Enterprise secret management

---

## ✅ **FINAL CHECKLIST**

After API Key Exposure:
- [ ] Revoked exposed API key
- [ ] Checked for unauthorized activity
- [ ] Contacted support if needed
- [ ] Cleaned Git history (if applicable)
- [ ] Created new key with minimal permissions
- [ ] Implemented proper key storage
- [ ] Added .gitignore rules
- [ ] Set up secret scanning
- [ ] Documented incident
- [ ] Educated team on key security
- [ ] Set up monitoring/alerts
- [ ] Scheduled regular key rotation

---

**Remember: The ONLY truly secure API key is one that was NEVER exposed in source code in the first place. When in doubt, REVOKE and REGENERATE!** 🔒

