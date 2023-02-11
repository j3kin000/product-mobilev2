import {Geo} from '../Forms/FormElements/Geo';
import {Button} from '../Forms/FormElements/Button';
import {PermissionsAndroid} from 'react-native';
import {changeTaskStatus} from '../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';

export const doAction = async ({
  type,
  wholeTask,
  navigation = null,
  callback,
}) => {
  const IdToken = await AsyncStorage.getItem('IdToken');

  switch (type) {
    case 'startTask':
      return startTask(wholeTask, IdToken);
    case 'closeForm':
      return closeForm(navigation);
    case 'transmitDone':
      // return transmitDone(wholeTask, IdToken)
      const res = await transmitDone(wholeTask, IdToken);
      return res;
    case 'reschedualTask':
      return reschedualTask(wholeTask, IdToken, callback);
    case 'transmitReschedualed':
      return transmitReschedualed(wholeTask, IdToken);
  }
};

export const startTask = async (wholeTask, IdToken, startKey?) => {
  wholeTask.statusId = 'inProgress';
  const res = await changeTaskStatus(wholeTask._id, IdToken, wholeTask);
};

export const closeForm = navigation => {
  navigation?.navigate('List');
};

export const transmitDone = async (wholeTask, IdToken) => {
  wholeTask.statusId = 'done';
  const getResponse = await changeTaskStatus(wholeTask._id, IdToken, wholeTask);
  return getResponse;
};

export const reschedualTask = async (wholeTask, IdToken, callback) => {
  if (callback) {
    let d = callback();
    wholeTask.executionStartDate = d;
    await changeTaskStatus(wholeTask._id, IdToken, wholeTask);
  }
};

export const transmitReschedualed = async (wholeTask, IdToken) => {
  wholeTask.statusId = 'assign';
  await changeTaskStatus(wholeTask._id, IdToken, wholeTask);
};

export const getGeo = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async info => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Milgam App',
              message: 'Allow access to your location.',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve(info);
          } else {
            alert('Location permission denied');
            resolve(null);
          }
        } catch (err) {
          console.warn(err);
          resolve(null);
        }
      },
      err => {
        alert('Getting location failed');
        console.warn('Error getting location: ', err);
        resolve(null);
      },
      {maximumAge: 1},
    );
  });
};
