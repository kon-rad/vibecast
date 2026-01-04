# Fixing Firebase & Gemini Errors

## 1. Firebase Error: "Missing or insufficient permissions"

This error means your Firestore Security Rules are rejecting the write operation.

### Solution
1.  Go to the **Firebase Console** -> **Firestore Database** -> **Rules**.
2.  Replace the current rules with the following to allow authenticated users to write to the `streams` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ALLOW authenticated users to read/write streams
    match /streams/{streamId} {
      allow read, write: if request.auth != null;
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
3.  Click **Publish**.

---

## 2. Gemini Error: "404 Not Found" for `gemini-1.5-pro`

The error message `models/gemini-1.5-pro is not found` indicates that the specific model string is either incorrect for the API version (`v1beta`) or valid availability.

### Solution
1.  **Use `gemini-1.5-pro-latest` or `gemini-1.5-pro-001`**:
    Change the model name in your app settings (Profile Page) to one of the following exact strings:
    *   `gemini-1.5-pro-latest`
    *   `gemini-1.5-pro-001`
    *   `gemini-pro` (The stable 1.0 version if others fail)

2.  **Verify API Key Scope**:
    Ensure your API key in Google AI Studio has access to the "Paid" or "Preview" models if you are targeting them.

3.  **App Update**:
    I have updated the code to allow `gemini-3-pro-preview`. Ensure you have selected this new model in the **Profile -> AI Settings** menu.
