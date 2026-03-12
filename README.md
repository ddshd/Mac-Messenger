# Messenger Top Call

A lightweight macOS desktop wrapper around Facebook Messenger built with Electron.

## Features

- Opens `https://www.messenger.com/` in a native macOS window
- Supports Messenger audio and video calls
- One-click **Pin on Top** floating control
- Keyboard shortcut: **Cmd+Shift+P** to toggle always-on-top
- Avoids Xcode for local development and packaging

## Requirements

- macOS
- Node.js 20+
- npm 10+

## Run locally

```bash
npm install
npm start
```

## Build a macOS app bundle

```bash
npm install
npm run dist
```

The generated `.dmg` and `.zip` files will be placed in `dist/`.

## Notes about camera and microphone permissions

On macOS, packaged apps need usage descriptions in `Info.plist` for camera and microphone access. This project already injects:

- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`

For unsigned local builds, macOS may still prompt the user the first time Messenger asks for camera or mic access.

## Notes about pinning video calls

This app pins the **entire Messenger window** above other windows. Messenger itself controls the layout of the video call UI, so this wrapper does not extract just the video tile into a separate native macOS floating window.

If you want, the next step would be building a more advanced version that detects active calls and opens them in a dedicated compact floating window.
