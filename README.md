# Student Event Registration App

A production-ready mobile application built with React Native and Expo for college students to register for campus events.

## Features

- **Authentication**: Secure login and sign-up with college email and roll number.
- **Event Discovery**: Browse featured events on the home screen or search all events.
- **Detailed Event Info**: View descriptions, rules, venues, and deadlines.
- **Registration Flow**: 
  - Individual registration.
  - Group registration (Create or Join via code).
- **Manage Registrations**: Keep track of registered events and their status.
- **Notifications**: Stay updated with new events and registration confirmations.
- **Premium UI**: Modern design with dark/light mode support, smooth transitions, and rich visuals.

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **State Management**: Zustand
- **API Calls**: Axios with mock data support
- **Storage**: Expo Secure Store (for auth tokens)
- **Icons**: Lucide React Native
- **Styling**: React Native StyleSheet + Expo Linear Gradient

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo Go app on your physical device or an emulator

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

- `app/`: Expo Router screens and layouts.
  - `(auth)/`: Authentication screens (Login, Sign Up).
  - `(tabs)/`: Tab-based navigation screens.
  - `event/[id].tsx`: Event detail view.
  - `register/[id].tsx`: Multi-step registration flow.
- `components/`: Reusable UI components (Button, Input, Card).
- `constants/`: Theme colors and configuration.
- `services/`: API services and mock data.
- `store/`: Zustand state management.
- `types/`: TypeScript interfaces.

## Environment Variables

Create a `.env` file (or set in `constants/Config.ts`):
```
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## Mock Data

The app is currently configured to use mock data for development. To switch to a real API, toggle `IS_DEVELOPMENT` in `constants/Config.ts`.
