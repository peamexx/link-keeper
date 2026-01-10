# LinkKeeper

A modern link management application built with React, TypeScript, and Firebase.

## Features

- 📝 Add, edit, and delete links
- 📋 Copy links to clipboard
- 🔗 Open links in new tabs
- 🔄 Drag & drop reordering (long press to enter reorder mode)
- 📱 Mobile-optimized UI
- ✨ Beautiful UI with Shadcn/ui components

## Tech Stack

- **Framework**: Vite + React (TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI based)
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit
- **Database**: Firebase Firestore (v10+ SDK)
- **Routing**: React Router DOM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase configuration
4. Open `src/lib/firebase.ts` and replace the placeholder values with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}
```

### 3. Set up Firestore Rules

In your Firebase Console, go to Firestore Database > Rules and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{document=**} {
      allow read, write: if true; // For development - restrict in production
    }
  }
}
```

**Note**: The above rule allows all reads and writes. For production, implement proper authentication and authorization.

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Main Screen

- **Add Link**: Tap the `+` button in the header
- **Edit Link**: Tap on any link card
- **Copy Link**: Tap the copy icon on a link card
- **Open Link**: Tap the external link icon on a link card
- **Reorder Links**: Long press on any link card to enter reorder mode, then drag items to reorder

### Add/Edit Screen

- Fill in the title and URL fields (both required)
- Tap "Save" to save changes
- In edit mode, tap the trash icon to delete a link (with confirmation)

## Project Structure

```
src/
├── components/
│   └── ui/          # Shadcn/ui components
├── lib/
│   ├── firebase.ts  # Firebase initialization
│   ├── firestore.ts # Firestore service functions
│   └── utils.ts     # Utility functions
├── pages/
│   ├── MainScreen.tsx   # Main list view
│   ├── AddScreen.tsx    # Add new link
│   └── EditScreen.tsx   # Edit/delete link
├── types/
│   └── index.ts     # TypeScript interfaces
├── App.tsx          # Main app component with routing
└── main.tsx         # Entry point
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT
