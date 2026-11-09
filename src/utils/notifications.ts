import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// 1. Configure default foreground notification behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (err) {
  console.warn('Failed to set notification handler:', err);
}

export const notificationService = {
  /**
   * Initialize notification channels for Android
   */
  initialize: async () => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Daybook Gentle Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C58882',
          sound: 'default',
        });
      } catch (err) {
        console.warn('Failed to configure Android notification channel:', err);
      }
    }
  },

  /**
   * Request system notification permissions
   */
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: false,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (err) {
      console.warn('Failed to request notification permissions:', err);
      return false;
    }
  },

  /**
   * Check if notifications are currently permitted
   */
  hasPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Schedule recurring daily morning and evening reminders
   */
  scheduleDailyReminders: async () => {
    try {
      // First cancel existing to prevent duplicate reminders
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Morning Reflection at 9:00 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Morning Sanctuary',
          body: 'Good morning! Take a quiet moment to review your daily rituals and intentions.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 9,
          minute: 0,
        },
      });

      // Evening Reflection at 9:00 PM (21:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening Reflection',
          body: 'Unwind and record your thoughts, gratitude, and evening skincare routine.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
        },
      });

      return true;
    } catch (err) {
      console.warn('Failed to schedule daily reminders:', err);
      return false;
    }
  },

  /**
   * Send an immediate test notification to verify foreground & system delivery
   */
  sendTestNotification: async (title = 'Gentle Reminder', body = 'Your Daybook reminders are active and working smoothly.') => {
    try {
      const hasPerm = await notificationService.requestPermissions();
      if (!hasPerm) return false;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // triggers immediately
      });
      return true;
    } catch (err) {
      console.warn('Failed to send test notification:', err);
      return false;
    }
  },

  /**
   * Cancel all scheduled notifications (e.g. when disabled in Settings)
   */
  cancelAllReminders: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('Failed to cancel notifications:', err);
    }
  },
};
