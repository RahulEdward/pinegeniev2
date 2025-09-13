# 🧪 Local Testing Guide for Pine Genie Extension

## Before uploading screenshots, test your extension locally:

### Step 1: Load Unpacked Extension
1. Open Chrome
2. Go to: chrome://extensions/
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select folder: `pine-genie-extension` (not the ZIP)

### Step 2: Test on TradingView
1. Go to: https://www.tradingview.com/chart/
2. Open any Pine Script strategy
3. Click your extension icon in Chrome toolbar
4. Test the optimization features
5. Take screenshots of working interface

### Step 3: Screenshots to Take
1. **Main Interface** - Extension popup/widget
2. **Optimization in Progress** - Live optimization
3. **3D Results** - Visualization charts
4. **Settings Panel** - Configuration options
5. **Export Results** - CSV download feature

### Step 4: Screenshot Specs
- **Size:** 1280x800 pixels minimum
- **Format:** PNG (preferred) or JPEG
- **Count:** 1-5 screenshots
- **Quality:** High resolution, clear text

### Step 5: After Screenshots
1. Upload to Chrome Web Store listing
2. Complete Privacy section
3. Set Distribution settings
4. Submit for review

## Quick Commands for Testing:

```powershell
# Navigate to extension folder
cd "C:\Users\USER\OneDrive\Desktop\pinegeniev\pine-genie-extension"

# Check all files are present
Get-ChildItem -Recurse

# Verify manifest.json
Get-Content manifest.json | ConvertFrom-Json
```
