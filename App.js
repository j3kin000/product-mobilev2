/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

import React from 'react';
import {useEffect} from 'react';
import {Home} from './src/screens/Home/Home';
import {Calendar} from './src/screens/Calendar/Calendar';
import {List} from './src/screens/List/List';
import {Settings} from './src/screens/Settings/Settings';
import {ListItemDetails} from './src/screens/List/ListItemDetails';
import {Login} from './src/screens/Login/Login';
import {FormsPage} from './src/screens/Forms/FormsPage';
import {Splash} from './src/screens/Splash/Splash';
import {CreateTask} from './src/screens/Tasks/CreateTask';
import {InfoPage} from './src/screens/Forms/InfoPage';
import axios from 'axios';
import {setGlobal} from './src/global';
import {LibProvider} from './src/common/context/lib';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {MessagingService} from './src/common/messaging';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import firebase from '@react-native-firebase/app';

import './src/i18n';
const credentials = {
  apiKey: 'AIzaSyAg-F1cUnd8-K07j5RDp6QEba8ntVhlUt0',
  authDomain: 'menu-3a9c9.firebaseapp.com',
  databaseURL: 'https://menu-3a9c9-default-rtdb.firebaseio.com',
  projectId: 'menu-3a9c9',
  storageBucket: 'menu-3a9c9.appspot.com',
  messagingSenderId: '888652844141',
  appId: '1:888652844141:web:d88f0dd6ef845e09c48364',
  measurementId: 'G-GC79VQ93WG',
};

const {Navigator, Screen} = createStackNavigator();
const App = () => {
  const toastConfig = {
    success: props => (
      <BaseToast
        {...props}
        style={{borderLeftColor: 'pink'}}
        contentContainerStyle={{paddingHorizontal: 15}}
        text1Style={{
          fontSize: 20,
          fontWeight: '400',
        }}
        text2Style={{
          fontSize: 15,
          fontWeight: '400',
        }}
      />
    ),

    error: props => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
        }}
        text2Style={{
          fontSize: 15,
        }}
      />
    ),
  };
  useEffect(() => {
    const requestIntercept = axios.interceptors.request.use(request => {
      return request;
    });

    const responseIntercept = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error?.response?.status == 401) {
          await AsyncStorage.removeItem('IdToken');
          await AsyncStorage.removeItem('tenant');
          await AsyncStorage.removeItem('logo');
          await AsyncStorage.removeItem('viewMode');
          await AsyncStorage.setItem('stayLoggedIn', 'false').then(() => {
            // navigation.navigate('Login');
          });
          setGlobal({
            tableHeaders: [],
          });
        }
        return Promise.reject(error);
      },
    );
    return () => {
      axios.interceptors.request.eject(requestIntercept);
      axios.interceptors.request.eject(responseIntercept);
    };
  }, []);

  // const initMessaging = async () => {
  //   const unsubscribe = MessagingService.deviceForegroundSubscribe(
  //     async remoteMessage => {
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Notification ⚠️',
  //         text2: `${remoteMessage.data.default} 👋`,
  //       });
  //     },
  //   );

  //   const acceptPermission = await MessagingService.requestUserPermission();

  //   if (!acceptPermission) {
  //     return unsubscribe();
  //   }
  // };

  // MessagingService.deviceBackgroundSubscribe(async remoteMessage => {
  //   console.log('inBackground');
  // });

  useEffect(() => {
    try {
      initMessaging();
    } catch (error) {
      console.error(error);
    }
  }, []);
  // useEffect(() => {
  //   return async () => {
  //     await firebase.initializeApp(credentials);
  //   };
  // }, []);
  return (
    <NavigationContainer>
      <LibProvider>
        <Navigator screenOptions={{headerShown: false}}>
          {/* <Screen name="Splash" component={Splash} /> */}
          <Screen name="Login" component={Login} />
          <Screen name="Home" component={Home} />
          <Screen name="Calendar" component={Calendar} />
          <Screen name="List" component={List} />
          <Screen name="Settings" component={Settings} />
          <Screen name="ListItemDetails" component={ListItemDetails} />
          <Screen
            name="FormsPage"
            component={FormsPage}
            options={{animationEnabled: false}}
          />
          <Screen name="CreateTask" component={CreateTask} />
          <Screen
            name="InfoPage"
            component={InfoPage}
            options={{animationEnabled: false}}
          />
        </Navigator>
        <Toast config={toastConfig} visibilityTime={6000} />
      </LibProvider>
    </NavigationContainer>
  );
};

export default App;
