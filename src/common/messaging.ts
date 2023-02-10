import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUrl } from '../api';

export class MessagingService {
  static async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }

    return enabled;
  }

  static deviceForegroundSubscribe(callback) {
    const unsubscribe = messaging().onMessage(callback);
    return unsubscribe;
  }

  static deviceBackgroundSubscribe(callback) {
    return messaging().setBackgroundMessageHandler(callback);
  }

  static async registerDeviceForNotification(idToken: string) {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const firebaseToken = await messaging().getToken();
      const url = (await getUrl()) + 'notifications/device';
      // const url = 'http://10.155.1.135:5000/notifications/device';
      let response = await axios({
        method: 'post',
        url: url,
        data: {
          deviceToken: firebaseToken,
          deviceId: deviceId,
        },
        headers: {
          Authorization: `Bearer ${idToken}`,
          'x-tenant-name': 'agam', // temporary
        },
      });
      return response;
    } catch (e) {
      console.log(e.response);
      console.log(e);
    }
  }
}
