import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { scale } from '../../common/common';
import { BottomMenu } from '../../components/BottomMenu';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPhotoFromAmazon, getGroupsUser } from '../../api/index';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { useTranslation } from 'react-i18next';
import { PermissionsAndroid } from 'react-native';

const onClickViewButton = async imageUrl => {
  if (!imageUrl) return;
  const IdToken = await AsyncStorage.getItem('IdToken');
  const url = await getPhotoFromAmazon(IdToken, imageUrl);

  const getUrlExtension = url => {
    return url.split(/[#?]/)[0].split('.').pop().trim();
  };

  const extension = getUrlExtension(url);
  const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;

  const options = {
    fromUrl: url,
    toFile: localFile,
  } as any;
  RNFS.downloadFile(options)
    .promise.then(() => FileViewer.open(localFile))
    .then(() => {
      console.log('success');
    })
    .catch(error => {
      console.log('error', error);
    });
};

export const ListItemDetails = (props: any) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  let { taskDetails, taskType, statusId, taskId, groupName } = props.route.params.itemData;

  let fromListItemTab = [];
  fromListItemTab = props.route.params.fromListItemTab;

  taskDetails = fromListItemTab.length === 0 ? (taskDetails ? taskDetails : []) : fromListItemTab;

  const [getFormData, setFormData] = useState([]);
  const [getUserGroup, setUserGroup] = useState([]);
  let status = statusId;

  const loc = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Milgam',
          message: 'Milgam wants to get access to your location ',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
      } else {
        console.log('location permission denied');
        alert('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    loc();
  }, []);

  const getGroups = async () => {
    try {
      const IdToken = await AsyncStorage.getItem('IdToken');
      const getGroupTask = await getGroupsUser(IdToken, groupName);
      console.log('GGT', getGroupTask);
      setUserGroup(getGroupTask);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  const parseValueForRender = value => {
    const valueIsNull = value == null;
    const valueIsArray = Array.isArray(value);
    const valueIsObject = !valueIsNull && !valueIsArray && typeof value === 'object';
    const valueIsBoolean = typeof value === 'boolean';

    if (valueIsNull) return '';
    if (valueIsArray) return value.join(', ');
    if (valueIsObject) {
      return parseValueForRender(value.value);
    }

    if (valueIsBoolean) return t(value.toString().toLowerCase());

    return value.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={styles.arrowBackWrapper}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image style={styles.arrowBack} source={require('../../assets/arrow-back-white.png')} />
          </TouchableOpacity>
          <View style={styles.headerSigns}>
            <Text style={styles.itemName}>{taskType}</Text>
            <Text style={styles.itemDesc}>{status}</Text>
          </View>
        </View>
        <View style={styles.taskIdWrapper}>
          <Text style={styles.taskId}>{t('taskId')}</Text>
          <Text style={styles.id}>{taskId}</Text>
        </View>
      </View>
      <ScrollView
        style={[styles.scrollView, { marginBottom: statusId != 'done' ? scale(100) : scale(190) }]}
      >
        <View style={styles.mainText}>
          {taskDetails.map((item, index) => {
            const isDate = item.inputType === 'date';
            const isGroup = item.key === 'groupName';

            let displayValue = parseValueForRender(item.value);

            if (isGroup && getUserGroup.length) {
              const matchGroup = getUserGroup.find(group => group.GroupName === item.value);
              displayValue = matchGroup?.Description ?? displayValue;
            }

            if (isDate) {
              displayValue = moment(item.value).format('DD.MM.YYYY HH:MM');
            }

            return (
              <View
                key={index}
                style={{
                  width: scale(800),
                  borderTopRightRadius: scale(40),
                  borderBottomRightRadius: scale(40),
                  flexDirection: 'row',
                  marginBottom: scale(13),
                  height: 'auto',
                  backgroundColor: index % 2 == 0 ? '#F1FCFF' : 'white',
                }}
              >
                <View>
                  <Text style={{ color: 'black', marginLeft: scale(50), marginTop: scale(12) }}>
                    {item.label}
                  </Text>
                </View>
                <Text
                  style={{
                    marginLeft: scale(10),
                    marginTop: scale(15),
                    flexShrink: 1,
                    marginBottom: scale(15),
                    paddingRight: scale(30),
                  }}
                >
                  {item.key.startsWith('doc') && item.value ? (
                    <TouchableOpacity
                      style={styles.showButton}
                      onPress={() => onClickViewButton(item.value.value ?? item.value)}
                    >
                      <Text style={styles.showBtnText}>{t('show')}</Text>
                    </TouchableOpacity>
                  ) : (
                    displayValue
                  )}
                </Text>
              </View>
            );
          })}
        </View>
        {statusId != 'done' ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.navigate('FormsPage', {
                itemData: props.route.params.itemData,
                getUserGroup: getUserGroup,
              });
            }}
          >
            <Text style={styles.btnText}>{t('start')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.navigate('InfoPage', {
                itemData: props.route.params.itemData,
                getFormData: getFormData,
                getUserGroup: getUserGroup,
              });
            }}
          >
            <Text style={styles.btnText}>{t('formView')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <BottomMenu fromWhere={'list'} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: scale(280),
    backgroundColor: '#3ABEE0',
    flexDirection: 'row',
  },
  arrowBack: {
    width: scale(73),
    height: scale(73),
    alignSelf: 'center',
    marginTop: scale(100),
  },
  arrowBackWrapper: {
    width: scale(121),
    height: '100%',
    marginLeft: scale(40),
  },
  headerSigns: {
    alignSelf: 'center',
    marginLeft: scale(20),
  },
  calendarSmall: {
    width: scale(36),
    height: scale(39),
    marginTop: scale(8),
  },
  itemName: {
    color: 'white',
    fontSize: scale(42),
    fontWeight: 'bold',
  },
  itemDesc: {
    color: 'white',
    fontSize: scale(26),
  },
  timeWrapper: {
    right: scale(40),
    flexDirection: 'row',
    position: 'absolute',
  },
  timeText: {
    fontSize: scale(40),
    marginLeft: scale(10),
    marginTop: scale(37),
    color: 'white',
  },
  infoLine: {
    backgroundColor: '#33465D',
    width: '100%',
    height: scale(50),
  },
  infoText: {
    color: 'white',
    fontSize: scale(24),
    marginRight: scale(50),
    marginTop: scale(7),
  },
  mainText: {
    maxWidth: scale(750),
    fontSize: scale(26),
    // marginLeft: scale(40),
    marginTop: scale(50),
  },
  button: {
    width: scale(238),
    height: scale(82),
    borderRadius: scale(50),
    backgroundColor: '#00A7D3',
    alignSelf: 'center',
    marginTop: scale(50),
    marginBottom: scale(130),
  },
  btnText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: scale(34),
    marginTop: scale(15),
  },
  scrollView: {
    marginBottom: scale(100),
    backgroundColor: 'white',
    borderTopLeftRadius: scale(50),
    borderTopRightRadius: scale(50),
    marginTop: scale(-45),
  },
  showButton: {
    marginLeft: scale(20),
    paddingTop: scale(-5),
    alignItems: 'center',
    backgroundColor: '#00A7D3',
    padding: 2,
    borderRadius: 10,
    width: scale(150),
    height: scale(50),
  },
  showBtnText: {
    color: 'white',
  },
  taskId: {
    color: 'white',
    fontSize: scale(42),
    fontWeight: 'bold',
  },
  id: {
    color: 'white',
    fontSize: scale(40),
    alignSelf: 'center',
  },
  taskIdWrapper: {
    position: 'absolute',
    right: scale(100),
    top: scale(90),
  },
  wazeBtn: {
    backgroundColor: '#00A7D3',
    width: scale(170),
    height: scale(80),
    borderRadius: scale(30),
    marginLeft: scale(50),
    marginTop: scale(15),
    marginBottom: scale(15),
  },
  wazeBtnText: {
    alignSelf: 'center',
    color: 'white',
    marginTop: scale(15),
  },
});
