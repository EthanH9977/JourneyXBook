<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

# Shikoku Travel Log

A smart, cloud-synced travel itinerary planner.

## 🚀 Firebase Setup (Important!)

This app uses Firebase Firestore for data storage. The Firebase config is already integrated in the code.

### Data Structure
- Users can create and manage their own itineraries
- Data is stored in Firestore under: `/users/{username}/itineraries/{tripId}`
- All data is synced in real-time

### Firestore Rules
Make sure your Firestore is in **test mode** for development, or set up proper security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/itineraries/{document=**} {
      allow read, write: if true; // Change this for production
    }
  }
}
```

View your app in AI Studio: https://ai.studio/apps/drive/1cUPNjM00FhoV7eIIvNfP_LR-6EPRMK8m

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
