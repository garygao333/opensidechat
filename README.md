# OpenSidechat (Penn)

An anonymous posting platform for University of Pennsylvania students that's always free with no ads.

## Summary of project

OpenSideChat is a web application that allows users to create anonymous posts and comments. This is built in response to the Sidechat application becoming filled with advertisements. It is built using Next.js, TypeScript, and Firebase.

## Features

- **Anonymous Posting**: Share thoughts and experiences without revealing your identity
- **Real-time Voting**: Upvote and downvote posts with instant updates
- **Comment System**: Comment on posts with tags (OP, #1, #2)
- **Image Uploads**: Share photos along with text posts
- **Post Sorting**: Posts ranked by popularity and recency
- **Sign In/Sign Up**: Sign in or sign up with Penn email
- **Password strength**: Animated password strength indicator
- **User ID**: Unique user ID generated for each user 
- **Animations**: Animated loading states, transitions, hover effects, and buttons
- **No Ads**: Forever free with no ads

## Tech Stack

### Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS** 
- **React Icons**
- **GSAP**
- **Three.js**
- **Heroicons**

### Backend
- **Firebase Authentication**
- **Firebase Firestore**
- **Firebase Storage**

## Time spent

Total time spent is around 5 hours. 

## Running the project 

The project is deployed via Vercel and can be accessed at https://frontend-a4g5lrrxw-garys-projects-e8df9a00.vercel.app

To run the project locally, use the following commands: 

### Steps

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
Create a `.env` file in the frontend directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Message garygao@wharton.upenn.edu for the environment variables :)

3. Start the development server
```bash
npm run dev
```

## Other information 

This project is developed for the Penn Spark Red team technical application. 