export interface DailyAlert {
  title: string;
  body: string;
}

export function getDailyVedicAlert(): DailyAlert {
  return {
    title: "॥ सुप्रभातम! आज का वैदिक पंचांग संदेश ॥",
    body: "आज शुभ तिथि व नक्षत्र का संयोग है। प्रातःकालीन चौघड़िया में नया कार्य आरंभ करें व राहुकाल से बचें।",
  };
}

export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    Notification.requestPermission();
  }
}

export function triggerMorningAlert() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const alert = getDailyVedicAlert();
    try {
      new Notification(alert.title, { body: alert.body, icon: '/favicon.png' });
    } catch (e) {
      console.warn(e);
    }
  }
}
