import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import React from 'react';
import { scale } from '../common/common';
import { useNavigation } from '@react-navigation/native';
import { getTasksList } from '../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setGlobal } from '../global/index';

export const BottomMenu = (props: any) => {
  const { fromWhere, isLogin } = props;

  const navigation = useNavigation();
  const getUsersTasks = async () => {
    try {
      const IdToken = await AsyncStorage.getItem('IdToken');
      const list = await getTasksList(IdToken);
      const tasks = list.tasks;
      setGlobal({
        userTasks: tasks,
      });
    } catch (error) {
      console.log('getUsersTasks error (BottomMenu.tsx) : ', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        disabled={isLogin}
        style={styles.button}
        onPress={() => {
          navigation.navigate('Home');
        }}
      >
        {fromWhere == 'home' ? (
          <Image
            style={styles.icon}
            source={require('../assets/bottomMenuIcons/home-selected.png')}
          />
        ) : (
          <Image style={styles.icon} source={require('../assets/bottomMenuIcons/home.png')} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        disabled={isLogin}
        style={[
          styles.button,
          {
            borderLeftWidth: scale(3),
            borderLeftColor: 'white',
            borderRightWidth: scale(3),
            borderRightColor: 'white',
          },
        ]}
        onPress={async () => {
          navigation.navigate('List');
          await getUsersTasks();
        }}
      >
        {fromWhere == 'list' ? (
          <Image
            style={styles.icon}
            source={require('../assets/bottomMenuIcons/list-selected.png')}
          />
        ) : (
          <Image style={styles.icon} source={require('../assets/bottomMenuIcons/list.png')} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        disabled={isLogin}
        style={styles.button}
        onPress={() => {
          navigation.navigate('Settings');
        }}
      >
        {fromWhere == 'settings' ? (
          <Image
            style={styles.icon}
            source={require('../assets/bottomMenuIcons/settings-selected.png')}
          />
        ) : (
          <Image style={styles.icon} source={require('../assets/bottomMenuIcons/settings.png')} />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    height: scale(120),
    // borderTopLeftRadius: scale(30),
    // borderTopRightRadius: scale(30),
    backgroundColor: '#201F1F',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  button: {
    height: '80%',
    width: '33.3%',
    marginTop: scale(15),
  },
  icon: {
    width: scale(50),
    height: scale(52),
    alignSelf: 'center',
    marginTop: scale(18),
  },
});
