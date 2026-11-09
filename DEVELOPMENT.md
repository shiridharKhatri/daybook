# Daybook — Development & Architecture Guide

> **"Everything you want to remember, in one place."**  
> A premium, calm, offline-first personal life organizer and knowledge library for iOS.

---

## 1. Domain & Purpose

Daybook is a **personal life organizer** designed to organize everyday life in one place:

- **Personal notes and knowledge management**
- **Expense and income tracking**
- **Task and to-do management (Priorities A/B/C/D)**
- **Shopping and product wishlists**
- **Hair care and skincare collections**
- **Personal routines and habit tracking**
- **Journaling**
- **Document and link storage**
- **AI-powered personal knowledge assistance**

The design adopts the **visual calmness** of the wellness reference (warm creamy backgrounds, rounded components, botanical line art, soft terracotta/rose accents, generous whitespace), while keeping the application functionality strictly focused on **everyday personal organization**.

---

## 2. Visual Design System

- **Primary Background**: `#FAF8F4` (Warm soothing cream)
- **Card Background**: `#FFFFFF` (Pure white with 18–24pt radius)
- **Primary Text**: `#34312F` (Deep soft charcoal)
- **Secondary Text**: `#88827E` (Warm taupe)
- **Primary Accent**: `#C58882` (Dusty rose / terracotta)
- **Secondary Accent**: `#E8B36F` (Warm amber)
- **Border**: `#EEEAE5` (Subtle boundary border)
- **Illustrations**:
  - `BotanicalHeader`: Delicate organic leaves line art & watercolor banner wash
  - `MindfulCharacter`: Calming header mascot and onboarding character
  - `OrganizeIcons`: Journal, Notes, Hair Care, Skincare, Shopping, Tasks
  - `WatercolorReaction`: 20 hand-drawn watercolor doodle emoticons extracted from vector artwork with transparency for daily moods and reactions.

---

## 3. Architecture & Project Structure

```
daybook/
├── assets/
│   └── emoticons/                # 20 transparent watercolor emotion doodles
├── src/
│   ├── app/                      # Expo Router screens
│   │   ├── _layout.tsx           # Database bootstrap & stack
│   │   ├── index.tsx             # Onboarding redirect logic
│   │   ├── (onboarding)/
│   │   │   └── index.tsx         # Multi-step "Make space for everything that matters"
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx       # 5 destination tab bar
│   │   │   ├── index.tsx         # Home Dashboard (Mood, Quick Access, Daily Overview)
│   │   │   ├── library.tsx       # Personal Library (Notes, Haircare, Skincare, Wishlist)
│   │   │   ├── tasks.tsx         # Priority tasks (A/B/C/D) & habits streak
│   │   │   ├── finance.tsx       # Finance (Income, expenses, balance, categories)
│   │   │   └── assistant.tsx     # AI Knowledge Assistant (offline RAG search)
│   │   ├── note/
│   │   │   └── [id].tsx          # Note editor
│   │   └── settings.tsx          # Settings & Privacy
│   ├── components/
│   │   ├── common/               # Card, Button, Input, BottomSheet, QuickCaptureSheet
│   │   ├── icons/                # Clean SVG icon system
│   │   └── illustrations/        # Botanical header, character, watercolor moods
│   ├── database/
│   │   ├── client.ts             # SQLite connection & schema initialization
│   │   ├── schema/               # Drizzle ORM schema definitions
│   │   └── repositories/         # Typed data access layer
│   ├── stores/
│   │   └── appStore.ts           # Zustand persisted preferences
│   └── theme/                    # Design tokens & typography scale
├── tests/
│   └── business-logic.test.ts    # Unit tests for finance, tasks, moods, AI
└── DEVELOPMENT.md
```

---

## 4. Phase Verification Status

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Foundation (Navigation, Design Tokens, SQLite, Onboarding) | ✅ Complete |
| **Phase 2** | Personal Library (Notes, Hair Care, Skincare, Search) | ✅ Complete |
| **Phase 3** | Organization (Tasks A/B/C/D, Habits, Finance, Quick Capture) | ✅ Complete |
| **Phase 4** | AI Assistant (Local Knowledge Retrieval, Product Research) | ✅ Complete |
| **Phase 5** | Personal Content (Daily Mood Tracker, 20 Watercolor Reactions) | ✅ Complete |
| **Phase 6** | Security & Settings (Privacy, Currency, Local Backup Export) | ✅ Complete |

---

## 5. Running & Testing

- **Run Tests**: `npm run test` (4/4 passed)
- **Run Typecheck**: `npm run typecheck` (0 errors)
- **Start App**: `npx expo start`
