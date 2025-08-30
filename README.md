# UPenn Sidechat

An anonymous posting platform for University of Pennsylvania students, built with Next.js and Firebase.

## Features

- **Anonymous Posting**: Share thoughts and experiences without revealing your identity
- **UPenn Email Verification**: Access restricted to verified UPenn email addresses
- **Real-time Voting**: Upvote and downvote posts with instant updates
- **Comment System**: Comment on posts with special tags (OP, #1, #2)
- **Image Uploads**: Share photos along with text posts
- **Post Sorting**: Posts ranked by popularity and recency
- **Responsive Design**: Works seamlessly on desktop and mobile

## Supported Email Domains

- `@upenn.edu` - General UPenn students
- `@sas.upenn.edu` - School of Arts & Sciences
- `@seas.upenn.edu` - School of Engineering and Applied Science  
- `@wharton.upenn.edu` - Wharton School

## Tech Stack

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons

### Backend
- **Firebase Authentication** - User authentication with email verification
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Storage** - Image and file storage

## Project Structure

```
frontend/
├── app/
│   ├── components/        # Reusable UI components
│   ├── create/           # Create new post page
│   ├── discover/         # Main posts feed
│   ├── login/            # User login
│   ├── settings/         # User settings
│   └── signup/           # User registration
├── contexts/             # React context providers
├── lib/                  # Firebase configuration
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd sidedoor-main/frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the frontend directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

### Firestore Collections
- **posts**: Stores all user posts with content, votes, and metadata
- **comments**: Stores comments linked to posts with commenter tags
- **votes**: Tracks user voting patterns to prevent duplicates

### Security Rules
Ensure your Firestore rules allow authenticated users to read/write data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{document} {
      allow read, write: if request.auth != null;
    }
    match /comments/{document} {
      allow read, write: if request.auth != null;
    }
    match /votes/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Features Overview

### Anonymous Posting
- Users can create text and image posts
- All posts are anonymous - no usernames or profiles
- Posts sorted by engagement and recency

### Commenting System
- **OP** tag for original poster
- **#1** and **#2** tags for first and second unique commenters
- Real-time comment loading and posting

### Voting System
- Upvote/downvote functionality with real-time updates
- Vote persistence to prevent duplicate voting
- Visual feedback for user votes

### Authentication
- Email-based authentication through Firebase
- Restricted to UPenn email domains
- Secure session management

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- Tailwind CSS for styling
- React functional components with hooks
- Clean, documented code structure

## Deployment

The app can be deployed to Vercel, Netlify, or any platform supporting Next.js applications. Ensure all environment variables are configured in your deployment environment.

## Contributing

This is an educational project built for technical assessment purposes.

## License

This project is for educational and assessment purposes.