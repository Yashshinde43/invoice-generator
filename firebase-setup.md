# Firebase Storage Setup Guide

This guide will help you fix the Firebase Storage upload error and deploy the necessary security rules.

## 🔧 Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged in to Firebase**
   ```bash
   firebase login
   ```

3. **In the project root directory** (`D:\Invoice_generator`)

## 🚀 Step 1: Deploy Storage Security Rules

This is the **most critical step** to fix the "storage/unknown" error.

### Option A: Deploy All Firebase Rules (Recommended)

Run this command from the project root:

```bash
firebase deploy --only storage
```

This deploys the `storage.rules` file to your Firebase project.

### Option B: Deploy All Firebase Services

If you also want to deploy Firestore rules:

```bash
firebase deploy
```

This deploys:
- Storage rules
- Firestore rules
- Firestore indexes
- Hosting (if configured)

## ✅ Step 2: Verify Deployment

After deployment, verify the rules are active:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `invoice-generator-f9f9a`
3. Go to **Storage** → **Rules** tab
4. You should see the deployed rules from `storage.rules`

The rules should look like:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /b/invoice-generator-f9f9a.firebasestorage.app/o {
      match /expenses/{businessId}/{allPaths=**} {
        allow read, write: if request.auth != null;
      }
      // ... other rules
    }
  }
}
```

## 🔍 Step 3: Check Environment Variables

Ensure your `.env.local` file in the `frontend` directory has the correct Firebase configuration:

```bash
cd frontend
cat .env.local
```

Verify these variables are set:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=invoice-generator-f9f9a.firebasestorage.app`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🧪 Step 4: Test Image Upload

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Try uploading a receipt image** when adding an expense

3. **Check the browser console** - you should see detailed logs:
   ```
   Starting image upload... {fileName: "receipt.jpg", fileSize: 12345, ...}
   Uploading to storage path: expenses/{businessId}/1234567890_receipt.jpg
   Upload successful: {bucket: "invoice-generator-f9f9a.firebasestorage.app", ...}
   Download URL generated successfully: https://firebasestorage.googleapis.com/...
   ```

## 🛡️ Security Rules Explanation

The storage rules allow:

- ✅ **Authenticated users** can upload expense receipts
- ✅ **Business-scoped storage** - files organized by businessId
- ✅ **Multiple categories**: expenses, invoices, business files, profiles
- ❌ **Unauthenticated users** cannot access any files

## 🚨 Common Issues & Solutions

### Issue: "storage/unknown" Error

**Cause:** Storage rules not deployed

**Solution:** Run `firebase deploy --only storage`

### Issue: "storage/unauthorized" Error

**Cause:** User not authenticated or rules too restrictive

**Solution:** 
1. Check user is logged in
2. Verify rules allow `request.auth != null`

### Issue: "storage/object-not-found" Error

**Cause:** Incorrect bucket configuration

**Solution:** 
1. Verify `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` in `.env.local`
2. Check bucket name matches Firebase Console

### Issue: "storage/retry-limit-exceeded" Error

**Cause:** Network issues

**Solution:** 
1. Check internet connection
2. Verify Firebase service status at https://status.firebase.google.com/

## 📚 Additional Resources

- [Firebase Storage Security Rules Docs](https://firebase.google.com/docs/storage/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Console](https://console.firebase.google.com/)

## 🔄 Need More Help?

If you continue to have issues:

1. **Open browser DevTools** → Network tab
2. **Reproduce the error**
3. **Look for failed requests** to `firebasestorage.googleapis.com`
4. **Check the response** - it will show the exact rule violation or error
5. **Update rules** if needed and redeploy

The browser network tab will show exactly which rule is blocking the request!
