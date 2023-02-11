/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MessagingService} from './src/common/messaging';
import './src/i18n';

const {Navigator, Screen} = createStackNavigator();
const App = () => {
  useEffect(() => {
    const requestIntercept = axios.interceptors.request.use(request => {
      return request;
    });

    const responseIntercept = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem('IdToken');
          await AsyncStorage.removeItem('tenant');
          await AsyncStorage.removeItem('logo');
          await AsyncStorage.removeItem('viewMode');
          await AsyncStorage.setItem('stayLoggedIn', 'false').then(() => {});
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

  useEffect(() => {
    const unsubscribe = MessagingService.deviceForegroundSubscribe(message => {
      console.log('this is a foreground message', message);
    });

    MessagingService.getToken().then(console.log);

    return unsubscribe;
  });

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
      </LibProvider>
    </NavigationContainer>
  );
};

export default App;
