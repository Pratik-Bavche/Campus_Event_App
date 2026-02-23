# Event Share Functionality Implementation Guide

## Overview

This implementation enables users to share events via the share button in the event details page. When someone opens a shared link:

- **App Installed**: The event opens directly in the app via deep linking
- **App Not Installed**: The share message includes a link to download from Play Store

## Files Created/Modified

### 1. **services/shareService.ts** (NEW)

Handles all sharing logic:

- `generateDeepLink()`: Creates a deep link for an event
- `shareEvent()`: Triggers native share dialog with event details and playstore link
- `generateShareableUrl()`: Creates a shareable URL with the collegeevents:// scheme

### 2. **services/redirectService.ts** (NEW)

Handles app store redirects and fallback URLs:

- `openAppStore()`: Opens Play Store or App Store
- `openURL()`: Opens any URL with error handling
- `generateFallbackUrl()`: Creates fallback web URL for events

### 3. **app.json** (MODIFIED)

Updated deep linking configuration:

- Changed scheme from "app" to "collegeevents"
- Added iOS bundle identifier: `com.pratikbavche.collegeevents`

### 4. **app/\_layout.tsx** (MODIFIED)

Added deep link handling:

- Listens for deep link events when app is already running
- Handles initial deep link when app is launched via link
- Parses URLs in format: `collegeevents://event/{eventId}`

### 5. **android/app/src/main/AndroidManifest.xml** (MODIFIED)

Added intent-filter for deep links:

- Registers `collegeevents://` scheme handler
- Kept backward compatibility with `app://` scheme

### 6. **app/event/[id].tsx** (MODIFIED)

- Added `shareService` import
- Added `handleShareEvent()` function
- Connected Share button to share functionality

## How It Works

### Sharing Flow

1. User clicks the **Share** button on event details
2. `handleShareEvent()` is called
3. `shareService.shareEvent()` generates:
   - Event name and description
   - Deep link: `collegeevents://event/{eventId}`
   - Message includes Play Store link for non-installed users
4. Native share dialog opens
5. User selects sharing method (WhatsApp, SMS, Email, etc.)

### Receiving Shared Link (App Installed)

1. User clicks the shared link
2. System recognizes `collegeevents://` scheme
3. App opens and routes to event details via deep link
4. Event details load immediately

### Fallback (App Not Installed)

When user opens a deep link with app not installed:

- Link format: `collegeevents://event/123` (won't work)
- User sees "Open with" dialog or nothing happens
- **Solution**: Share message includes explicit Play Store link
- User can tap link to download app

## Configuration Needed

### 1. Update Play Store URL (Optional)

In `services/shareService.ts`:

```typescript
const playStoreUrl =
  "https://play.google.com/store/apps/details?id=com.pratikbavche.App";
```

Replace `com.pratikbavche.App` with your actual package name.

### 2. Update App Store URL (Optional, for iOS)

In `services/shareService.ts`:

```typescript
const appStoreUrl = "https://apps.apple.com/us/app/college-events/id0000000000";
```

Replace `id0000000000` with your actual App Store ID.

### 3. Update Web Fallback Domain (Optional)

In `services/redirectService.ts`:

```typescript
const baseUrl = "https://collegeevents.com"; // Replace with your domain
```

## Testing the Implementation

### Test 1: Share Button Works

1. Open event details
2. Tap Share button
3. Native share dialog should appear with event details

### Test 2: Deep Link with App Installed

```bash
# Using adb (Android)
adb shell am start -W -a android.intent.action.VIEW -d "collegeevents://event/123" com.pratikbavche.App

# Using xcrun (iOS)
xcrun simctl openurl booted "collegeevents://event/123"
```

### Test 3: Deep Link Navigation

1. Share an event to yourself via WhatsApp/SMS
2. Click the link
3. App should open and navigate to that event

## Deep Link URL Formats

### Primary Format (expo-router compatible)

```
collegeevents://event/123
```

### Alternative Format (backward compatibility)

```
app://event/123
```

## Troubleshooting

### Deep links not working

1. Ensure app is rebuilt/compiled
2. Check AndroidManifest.xml has correct scheme
3. Verify event ID is valid

### Share dialog not appearing

1. Ensure `shareService` is imported correctly
2. Check `handleShareEvent` is called on button press
3. Verify event object has required fields (id, name, description)

### App not opening when link clicked

1. Check if app is properly registered for deep link scheme
2. Verify URL format matches expected pattern
3. Ensure authentication is complete before navigation

## Security Considerations

- Event IDs in deep links are public (anyone can construct a link)
- Consider rate-limiting event access from deep links
- Add analytics to track shared events
- Consider expiration for sensitive events

## Future Enhancements

1. **Web Fallback**: Create a web redirect service that:
   - Detects if app is installed
   - Redirects to app store if not
   - Shows event preview if web access allowed

2. **Share Analytics**: Track:
   - Number of shares per event
   - Share method used
   - Conversion to registration from shares

3. **Custom Share Image**: Generate event-specific share preview with poster image

4. **QR Codes**: Add option to share event as QR code

## Code Example: Manual Share

If you want to manually share programmatically:

```typescript
import { shareService } from "../../services/shareService";

// Share without native dialog
const deepLink = shareService.generateDeepLink("123");
const url = shareService.generateShareableUrl("123");

// Send via API to backend
await sendShareNotification(userId, eventId, deepLink);
```
