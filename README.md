# 🌸 Daybook

<p align="center">
  <strong>Make space for everything that matters.</strong><br>
  A calm, mindful, offline-first personal sanctuary and knowledge organizer built with Expo and React Native.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2058-000000.svg?style=flat-square&logo=expo" alt="Expo SDK 58" />
  <img src="https://img.shields.io/badge/React%20Native-0.88-61DAFB.svg?style=flat-square&logo=react" alt="React Native 0.88" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Storage-SQLite%20(Local)-003B57.svg?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
</p>

---

## 🌿 Overview

**Daybook** is designed around a single principle: *your digital sanctuary should bring stillness, not overwhelm.* 

Combining intentional aesthetics with high-performance mobile architecture, Daybook provides an all-in-one personal workspace for journaling, priority tasks, wellness routines, expense tracking, and local AI assistance - stored 100% on your device with zero cloud tracking.

---

## 🌸 Key Features

### 🌸 Mindful Dashboard & Mood Journal
- **Daily Watercolor Reactions**: Log daily feelings with 20 hand-drawn watercolor emotional avatars.
- **Dynamic Greetings & Calendar Strip**: Visual week view with instant day-to-day progress reflection.
- **Quick Access Shelves**: One-tap access to gratitude prompts, inner reflections, and routines.

### 🎙️ Notes & Voice Thoughts
- **Recorded Voice Memos**: Capture spoken thoughts with on-device microphone recording and instant audio playback.
- **Color-Coded Collections**: Organize reflections into personal categories, learning notes, routines, and wishlist buys.
- **Quick Search & Filter**: Instant, full-text offline search across all written notes and attachments.

### ✅ Tasks & Daily Rituals
- **A/B/C/D Priority Management**: Eisenhower-style focus ordering ensuring urgent essentials take precedence over non-critical tasks.
- **Customizable Daily Rituals**: Add custom routines with custom color themes (dusty rose, sage green, lavender, amber) and bespoke icons.
- **Streak & Habit Tracking**: Automatic completion ratios and active streak counters.

### 💳 Finance & Expense Management
- **Offline Ledger**: Track daily expenses, income streams, and running balances in your preferred currency.
- **Category Breakdowns**: Visual percentage distribution of spending across groceries, personal care, education, and leisure.
- **Recent Activity Ledger**: Fast, one-tap transaction logging with date formatting.

### 🌸 Cycle & Wellness Tracking
- **Phase Predictions**: Accurate cycle phase tracking (Follicular, Ovulation, Luteal, Menstrual).
- **Daily Symptom & Mood Logging**: Record physical signs, energy levels, and hydration notes.
- **Mind & Body Calm Audio**: Integrated soothing audio player for meditation, rest, and breathing exercises.

### 🧘 Guided Breath & Harmonic Audio
- **Mindful Breathing Visuals**: Smooth expanding and contracting circle for 4-second box breathing cycles (Inhale, Hold, Exhale, Rest).
- **Audio On / Off Switch**: Instant sound toggle in the header to switch between focused silence or soothing auditory immersion.
- **Harmonic Breath Cues**: Melodic chimes tuned for each phase (rising chime for Inhale, sustained shimmer for Hold, settling release for Exhale, grounding bell for Rest).
- **Peaceful Ambient Resonance**: Gentle background crystal singing bowl soundscape.

### 🤖 Private On-Device AI Assistant
- **Local Retrieval Assistant**: Ask questions directly about your saved notes, expenses, pending tasks, and habits.
- **Voice Query Support**: Dictate queries directly into the search bar using the microphone.
- **Contextual Follow-ups**: Fast chips suggesting actionable queries based on your latest records.

### 🔔 Gentle Local Reminders
- **Morning Sanctuary (9:00 AM)**: Review daily intentions and rituals.
- **Evening Reflection (9:00 PM)**: Check off habits and log evening skincare and thoughts.
- **Zero Server Tracking**: All notifications are generated and delivered locally by your device.

---

## 🎨 Visual Design System

Daybook follows an editorial, warm-minimalist aesthetic inspired by mindful stationery and Japanese editorial layouts:

- **Canvas Background**: `#FAF8F4` (Calm warm cream)
- **Primary Text**: `#34312F` (Deep soft charcoal)
- **Secondary Text**: `#88827E` (Warm taupe)
- **Primary Accent**: `#C58882` (Dusty rose / terracotta)
- **Amber Accent**: `#E8B36F` (Warm amber highlight)
- **Sage Accent**: `#8DB580` (Calm botanic green)
- **Bespoke Iconography**: Handcrafted continuous-curve SVG vector icons for navigation and cards.
- **Floating Pill Tab Bar**: Glassmorphic capsule navigation with spring haptic feedback.

---

## 🏗️ Architecture & Tech Stack

```
daybook/
├── assets/                       # Custom illustrations, emoticons & icons
├── src/
│   ├── app/                      # Expo Router (file-based navigation)
│   │   ├── _layout.tsx           # Database bootstrap, notification channels, root stack
│   │   ├── index.tsx             # Onboarding redirect controller
│   │   ├── (onboarding)/         # 3-step mindful setup flow
│   │   ├── (tabs)/               # Main floating pill tab screens
│   │   │   ├── index.tsx         # Home Dashboard
│   │   │   ├── library.tsx       # Personal Library & Voice Notes
│   │   │   ├── assistant.tsx     # On-device AI Assistant
│   │   │   ├── tasks.tsx         # Activity & Daily Rituals
│   │   │   └── finance.tsx       # Finance & Expenses
│   │   ├── note/[id].tsx         # Rich note editor with voice recorder
│   │   ├── cycle.tsx             # Cycle & Wellness Tracker
│   │   └── settings.tsx          # Settings, Privacy & Notification controls
│   ├── components/
│   │   ├── common/               # BottomSheet, Card, Button, Input, QuickCapture
│   │   ├── icons/                # Clean SVG icon system
│   │   ├── illustrations/        # Mindful character & watercolor doodle reactions
│   │   └── navigation/           # Floating pill tab bar with rounded SVG glyphs
│   ├── database/
│   │   ├── client.ts             # SQLite connection & table initializers
│   │   ├── schema/               # Drizzle ORM schemas
│   │   └── repositories/         # Type-safe repository layer (notes, tasks, habits, etc.)
│   ├── stores/
│   │   ├── appStore.ts           # Zustand store with persistent SQLite storage
│   │   └── sqliteStorage.ts      # Custom asynchronous storage engine for Zustand
│   └── utils/
│       ├── audio.ts              # Native recording, fallback chime synthesis, audio playback
│       ├── notifications.ts      # Daily reminders & foreground notification handler
│       └── haptics.ts            # Tactile feedback utilities
└── tests/
    └── business-logic.test.ts    # Unit tests for finance, tasks, cycles, habits, and AI
```

### Core Technologies
- **Framework**: [Expo SDK 58](https://expo.dev/) (React Native 0.88)
- **Navigation**: [Expo Router v58](https://docs.expo.dev/router/introduction/) (Typed file-based routing)
- **Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) with [Drizzle ORM](https://orm.drizzle.team/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with custom SQLite persistence
- **Audio & Media**: [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) with custom PCM audio synthesis fallback
- **Notifications**: [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- **Gestures & Haptics**: [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) and native `PanResponder`
- **Vector Graphics**: [react-native-svg](https://github.com/software-mansion/react-native-svg)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app on your iOS or Android device (or iOS Simulator / Android Emulator)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/daybook.git
   cd daybook
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Launch on your device**:
   - **iOS**: Press `i` in the terminal to launch the iOS Simulator, or scan the QR code with the Expo Go app on iPhone.
   - **Android**: Press `a` in the terminal to launch Android Emulator, or scan the QR code with Expo Go.

---

## 🧪 Testing & Code Quality

Daybook includes a comprehensive test suite for core business logic, calculations, and local AI retrieval:

```bash
# Run unit tests
npm test

# Run TypeScript typechecker
npm run typecheck
```

---

## 🔒 Privacy & Offline-First Philosophy

- **Zero Remote Databases**: Everything you write, record, or track stays on your device.
- **No Analytics / Telemetry**: No tracking cookies, advertising IDs, or third-party behavioral trackers.
- **Biometric Security**: Optional Face ID / App Lock support via iOS secure enclave.
- **Complete Data Ownership**: Your database can be exported, cleared, or reset at any time in Settings.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
