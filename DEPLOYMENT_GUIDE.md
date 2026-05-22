# 🚀 TiliGo - Live App Store Deployment Guide

## Status: ✅ Ready to Deploy

**Repository**: https://github.com/agentextern-a11y/tiligo (main branch)  
**Latest Commit**: 33cd161 (Fix plist heredoc YAML parsing error)  
**Build System**: Codemagic CI/CD  
**Target**: Apple App Store (iOS 14+)

---

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ Apple Developer Account (paid)
- ✅ App Store Connect Access
- ✅ App Store Connect API Key (JSON file)
- ✅ App-Specific Password from Apple ID

---

## Step 1: Set Up Codemagic Project (5 mins)

### 1.1 Connect Repository
1. Go to **[codemagic.io](https://codemagic.io)**
2. Sign in with your account
3. Click **"Add app"**
4. Search for and select `agentextern-a11y/tiligo`
5. Choose **iOS** platform
6. Click **"Add"**

### 1.2 Select Workflow Configuration
1. When prompted, choose **"Use existing codemagic.yaml"**
2. This will automatically detect your `codemagic.yaml` from the repo
3. Click **"Confirm"**

---

## Step 2: Configure Environment Variables (3 mins)

### 2.1 Add Apple Credentials

Go to **Project Settings** → **Environment Variables** and add:

#### Variable 1: App Store Connect API Key
- **Name**: `APP_STORE_CONNECT_API_KEY_JSON`
- **Value**: Paste your complete App Store Connect API Key (JSON)
- **Check**: ✅ "Encrypted"
- Click **"Save"**

#### Variable 2: App-Specific Password
- **Name**: `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`
- **Value**: Your Apple ID App-Specific Password
- **Check**: ✅ "Encrypted"
- Click **"Save"**

---

## Step 3: Start the Build (1 min)

### 3.1 Trigger Build

1. Click **"Start new build"** button
2. Select **Workflow**: `ios-app-store`
3. Select **Branch**: `main`
4. Click **"Build"**

### 3.2 Monitor Progress

The build will automatically:
1. ✓ Clone repository
2. ✓ Install npm dependencies
3. ✓ Build Vite web app → `dist/`
4. ✓ Sync to iOS via Capacitor
5. ✓ Install CocoaPods
6. ✓ Build iOS app archive
7. ✓ Export for App Store
8. ✓ Upload to App Store with fastlane

**Estimated time**: 15-20 minutes

---

## Step 4: Verify Deployment

Once the build completes:

1. Go to **App Store Connect** → **My Apps** → **TiliGo**
2. Check **TestFlight** → **Internal Testing** for the new build
3. Once approved, the build will be available in the App Store

---

## Troubleshooting

### Build Fails with "Code Signing" Error
→ Verify App Store Connect API Key is valid and has signing permissions

### Build Fails with "Team ID" Error
→ Check your API key includes the correct Team ID

### Upload Fails
→ Ensure App-Specific Password is correct (not your main Apple ID password)

### Build Gets Stuck
→ Check Codemagic build logs (usually stuck at CocoaPods step)
→ Try clearing CocoaPods cache: `pod repo update`

---

## Next Steps After Deployment

1. **TestFlight**: Review build in TestFlight before submitting
2. **App Review**: Submit to Apple for review (1-2 days)
3. **Monitor Approval**: Check App Store Connect for review status
4. **Release**: Click "Release to App Store" when approved

---

## Build Files Generated

- **Web App**: `dist/index.html` + `dist/assets/`
- **iOS App**: `ios/App/` (Capacitor wrapper)
- **Build Artifact**: `TiliGo.ipa` (uploaded to App Store)

---

## Codemagic API Token

Your token: `usDiW5THy_4AY3tAOb9XwoDBHjuIjdS4QITYYVHYM7o`

*(Can be used to automate builds after initial setup)*

---

## Support

**Documentation**:
- [Codemagic Docs](https://docs.codemagic.io)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Fastlane App Store Docs](https://docs.fastlane.tools/actions/upload_to_app_store/)

