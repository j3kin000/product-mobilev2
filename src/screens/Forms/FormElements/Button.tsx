import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useContext} from 'react';
import {scale} from '../../../common/common';
import {getTasksList} from '../../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setGlobal} from 'reactn';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {doAction} from '../FormActions';
import {FormContext} from '../FormContext';
import moment from 'moment';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid} from 'react-native';

export const Button = React.forwardRef((props: any, ref) => {
  const navigation = useNavigation();

  const {
    _id,
    setShowAlert,
    showAlert,
    taskData,
    answersData,
    availableActions,
    wholeTask,
  } = props;

  let {key, label, rules} = props.itemData;

  const {
    setOpen,
    actionsQ,
    setActionsQ,
    checkRequiredFields,
    setRequiredButEmptyFields,
  } = useContext(FormContext);

  const getGeo = () => {
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
          console.log('Error getting location: ', err);
          resolve(null);
        },
        {maximumAge: 5000, enableHighAccuracy: true},
      );
    });
  };

  const btnPress = async () => {
    if (rules.actions?.includes('transmitDone')) {
      const invalidFields = checkRequiredFields(taskData.form, answersData);
      setRequiredButEmptyFields(invalidFields);

      if (invalidFields.length > 0) {
        props.scrollTo({key: invalidFields[0]});
        props.setShowRequiredError(true);
        return;
      } else {
        const tenant = await AsyncStorage.getItem('tenant');
        await AsyncStorage.removeItem(_id);

        let answersArr = [];
        for (let key in answersData) {
          if (
            answersData[key].length ||
            typeof answersData[key] === 'boolean'
          ) {
            answersArr.push(key);
          }
        }

        if (taskData) {
          const wholeTask = taskData;

          for (let item in wholeTask.form) {
            let field = wholeTask.form[item];

            if (answersArr?.includes(field.key)) {
              const val = answersData[field.key];
              field.value = val;
            }

            // for putting an end time to the done button
            if (field.key == key) {
              const timeNow = moment().toISOString();
              field.value = timeNow;
            }

            if (field.inputType == 'geo') {
              const geo = await getGeo();

              const arrayHasValue =
                Array.isArray(field.value) && field.value.length;

              if (arrayHasValue) {
                field.value = [field.value[0], geo];
              } else {
                field.value = [null, geo];
              }
            }
          }

          doAction({type: 'transmitDone', wholeTask, navigation})
            .then(async res => {
              if (Object.keys(res).length === 0) {
                const getPending = await AsyncStorage.getItem(
                  `pending-${tenant}`,
                );
                if (getPending === null) {
                  const temp = [];
                  wholeTask.statusId = 'Pending';
                  temp.push(wholeTask);
                  await AsyncStorage.setItem(
                    `pending-${tenant}`,
                    JSON.stringify(temp),
                  ).then(() => {
                    navigation?.navigate('List', {submitted: true});
                  });
                } else {
                  const getParseData = JSON.parse(getPending);
                  wholeTask.statusId = 'Pending';
                  getParseData.push(wholeTask);
                  await AsyncStorage.setItem(
                    `pending-${tenant}`,
                    JSON.stringify(getParseData),
                  ).then(() => {
                    navigation?.navigate('List', {submitted: true});
                  });
                }
              } else {
                navigation?.navigate('List', {submitted: true});
              }
            })
            .finally(async () => {
              const getPending = await AsyncStorage.getItem(
                `pending-${tenant}`,
              );
              if (getPending === null) {
                const temp = [];
                wholeTask.statusId = 'Pending';
                temp.push(wholeTask);
                await AsyncStorage.setItem(
                  `pending-${tenant}`,
                  JSON.stringify(temp),
                ).then(() => {
                  navigation?.navigate('List', {submitted: true});
                });
              } else {
                const getParseData = JSON.parse(getPending);
                wholeTask.statusId = 'Pending';
                getParseData.push(wholeTask);
                await AsyncStorage.setItem(
                  `pending-${tenant}`,
                  JSON.stringify(getParseData),
                ).then(() => {
                  navigation?.navigate('List', {submitted: true});
                });
              }
            });
        }
      }
    } else {
      if (rules.actions?.includes('startTask')) {
        if (taskData) {
          const wholeTask = taskData;
          for (let item in wholeTask.form) {
            let field = wholeTask.form[item];

            if (
              field.inputType == 'button' &&
              field.rules.actions?.includes('startTask')
            ) {
              const timeNow = moment().format('DD/MM/YYYY HH:mm');
              field.value = timeNow;
            }

            if (field.inputType == 'geo') {
              const geo = await getGeo();
              field.value = [geo];
            }
          }

          doAction({
            type: 'startTask',
            wholeTask,
            navigation,
          });
        }
      } else if (wholeTask) {
        for (let actions in availableActions) {
          if (availableActions[actions] == 'reschedualTask') {
            setOpen(true);
            const res = date => {
              const callback = () => {
                return date;
              };
              doAction({
                type: availableActions[actions],
                wholeTask,
                callback,
              });
            };
            setActionsQ([...actionsQ, res]);
          } else {
            doAction({
              type: availableActions[actions],
              wholeTask,
              navigation,
            });
          }
        }
      }
    }
    props.focusComponent();
  };

  return (
    <View style={{maxWidth: scale(720)}} ref={ref}>
      <TouchableOpacity
        style={[styles.btn, {width: label.length > 25 ? 'auto' : scale(300)}]}
        onPress={btnPress}>
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#3ABEE0',
    // width: 'auto',
    height: 'auto',
    borderRadius: scale(15),
    marginTop: scale(10),
    marginBottom: scale(100),
  },
  text: {
    color: 'white',
    alignSelf: 'center',
    margin: scale(14),
    marginRight: scale(35),
    marginLeft: scale(35),
    flexShrink: 1,
  },
});
