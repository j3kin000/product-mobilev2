import messaging from '@react-native-firebase/messaging';

export class MessagingService {
  static async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  static deviceForegroundSubscribe(callback) {
    const unsubscribe = messaging().onMessage(callback);
    return unsubscribe;
  }

  static deviceBackgroundSubscribe(callback) {
    return messaging().setBackgroundMessageHandler(callback);
  }

  static async getToken() {
    return await messaging().getToken();
  }
}
