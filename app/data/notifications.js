import * as Notifications from 'expo-notifications';

export const triggerAchievementNotification = async (title, description) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Achievement Unlocked! 🏆",
      body: `Congrats! You've earned the "${title}" badge: ${description}`,
      data: { url: '/(profile)/achievements' }, 
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, 
  });
};