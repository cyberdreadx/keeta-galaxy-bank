#!/bin/bash

# Yoda Wallet - Chrome Web Store Packaging Script
# This script builds the extension and creates a proper .zip file for submission

echo "🚀 Building Yoda Wallet for Chrome Web Store..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -f yoda-wallet-chrome-store.zip

# Step 2: Build the extension
echo "⚙️  Building extension..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 3: Check for required files in dist/
echo "📋 Checking required files..."

required_files=(
    "manifest.json"
    "index.html"
    "background.js"
    "content.js"
    "inject.js"
    "icon-16.png"
    "icon-48.png"
    "icon-128.png"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ ! -f "dist/$file" ]; then
        echo -e "${RED}❌ Missing: $file${NC}"
        all_files_exist=false
    else
        echo -e "${GREEN}✓${NC} $file"
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "${RED}❌ Some required files are missing!${NC}"
    exit 1
fi

# Step 4: Create zip file (files at root, not in a folder)
echo "📦 Creating Chrome Web Store package..."

cd dist/
zip -r ../yoda-wallet-chrome-store.zip ./* -x "*.DS_Store" -x "__MACOSX"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create zip file!${NC}"
    cd ..
    exit 1
fi

cd ..

echo -e "${GREEN}✅ Package created: yoda-wallet-chrome-store.zip${NC}"

# Step 5: Display package info
package_size=$(du -h yoda-wallet-chrome-store.zip | cut -f1)
echo ""
echo "📊 Package Information:"
echo "   Size: $package_size"
echo "   Version: $(grep -o '"version": "[^"]*' dist/manifest.json | cut -d'"' -f4)"
echo ""

# Step 6: Final checklist
echo "📝 Chrome Web Store Submission Checklist:"
echo ""
echo "   ${GREEN}✓${NC} manifest.json is at the root of the zip"
echo "   ${GREEN}✓${NC} All required files included"
echo "   ${GREEN}✓${NC} Using Manifest V3"
echo ""
echo "   ${YELLOW}⚠${NC}  Before submitting, make sure you have:"
echo "      • 128x128 icon (icon-128.png)"
echo "      • Privacy Policy URL ready"
echo "      • Store listing description prepared"
echo "      • Screenshots (1280x800 or 640x400)"
echo "      • Promotional tile (440x280) - optional but recommended"
echo ""
echo "📄 Documents created:"
echo "   • PRIVACY_POLICY.md - Host this on your website"
echo "   • STORE_LISTING.md - Use this for the store description"
echo ""
echo -e "${GREEN}🎉 Ready for Chrome Web Store submission!${NC}"
echo ""
echo "Upload yoda-wallet-chrome-store.zip to:"
echo "https://chrome.google.com/webstore/devconsole"

