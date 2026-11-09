import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sqliteStorage } from './sqliteStorage';

interface UserProfile {
  id: string;
  displayName: string;
  avatarUri?: string;
}

interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;

  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateDisplayName: (name: string) => void;
  logout: () => void;

  // Preferences
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  weekStartDay: 'sunday' | 'monday';
  setWeekStartDay: (day: 'sunday' | 'monday') => void;

  // AI
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Security
  faceIdEnabled: boolean;
  setFaceIdEnabled: (enabled: boolean) => void;

  // Quick capture
  quickCaptureVisible: boolean;
  setQuickCaptureVisible: (visible: boolean) => void;

  // Active Bottom Sheet overlay
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),

      // User profile
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),
      updateDisplayName: (name) =>
        set((state) => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, displayName: name }
            : null,
        })),
      logout: () =>
        set({
          hasCompletedOnboarding: false,
          userProfile: null,
        }),

      // Preferences
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      currency: 'NPR',
      setCurrency: (currency) => set({ currency }),
      dateFormat: 'MM/DD/YYYY',
      setDateFormat: (format) => set({ dateFormat: format }),
      weekStartDay: 'sunday',
      setWeekStartDay: (day) => set({ weekStartDay: day }),

      // AI
      aiEnabled: true,
      setAiEnabled: (enabled) => set({ aiEnabled: enabled }),

      // Notifications
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      // Security
      faceIdEnabled: false,
      setFaceIdEnabled: (enabled) => set({ faceIdEnabled: enabled }),

      // Quick capture
      quickCaptureVisible: false,
      setQuickCaptureVisible: (visible) => set({ quickCaptureVisible: visible }),

      // Active Bottom Sheet overlay
      isSheetOpen: false,
      setIsSheetOpen: (open) => set({ isSheetOpen: open }),
    }),
    {
      name: 'daybook-app-store',
      storage: createJSONStorage(() => sqliteStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userProfile: state.userProfile,
        theme: state.theme,
        currency: state.currency,
        dateFormat: state.dateFormat,
        weekStartDay: state.weekStartDay,
        aiEnabled: state.aiEnabled,
        notificationsEnabled: state.notificationsEnabled,
        faceIdEnabled: state.faceIdEnabled,
      }),
    }
  )
);
