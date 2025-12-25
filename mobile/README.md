# Smart Accounting Mobile App

React Native + Expo mobile application for the Smart Accounting system.

## Prerequisites

- Node.js 18+
- Android Studio (for Android development)
- Expo Go app on your phone (for testing)

## Setup

1. Install dependencies:
```bash
cd accounting-app/mobile
npm install
```

2. Configure API URL:
   - Edit `src/services/api.ts`
   - For Android Emulator: `http://10.0.2.2:3000/api`
   - For iOS Simulator: `http://localhost:3000/api`
   - For physical device: Use your computer's IP address (e.g., `http://192.168.1.100:3000/api`)

3. Make sure the backend is running:
```bash
cd ../backend
npm run dev
```

## Running the App

### Development (Expo Go)
```bash
npm start
```
Then scan the QR code with Expo Go app.

### Android Emulator
```bash
npm run android
```

### iOS Simulator (macOS only)
```bash
npm run ios
```

## Features

- User authentication (InsForge)
- Dashboard with monthly overview
- Transaction management (add, view, delete)
- Statistics with category breakdown
- Account management
- Profile and settings

## Project Structure

```
mobile/
©À©¤©¤ App.tsx                 # Main entry point
©À©¤©¤ src/
©¦   ©À©¤©¤ contexts/          # React contexts (Auth)
©¦   ©À©¤©¤ navigation/        # Navigation configuration
©¦   ©À©¤©¤ screens/           # Screen components
©¦   ©¸©¤©¤ services/          # API services
```

## Building for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA
```bash
npx expo build:ios
```
