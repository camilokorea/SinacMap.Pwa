// Template environment file — COMMITTED to the repo.
// Copy this file to `environment.ts` (gitignored) and fill in the real values
// for local development. The deployment pipeline (future ticket) will generate
// `environment.ts` from these placeholders.
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  apiUrl: 'http://localhost:5036/api'
};
