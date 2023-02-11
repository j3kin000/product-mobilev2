import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {BottomMenu} from '../../components/BottomMenu';
import {scale} from '../../common/common';
import {setGlobal, useGlobal} from '../../global/index';
import {
  getProfileInfo,
  getTaskStatus,
  getTasksList,
  getSettings,
  getTaskDetails,
} from '../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import {ListItem} from '../List/ListItem';
import {useTranslation} from 'react-i18next';
import {changeTaskStatus} from '../../api/index';
import {useIsFocused} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

export const Home = (props: any) => {
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      getUserInfo();
    }
  }, [isFocused]);

  const {t} = useTranslation();

  const [name, setName] = useState('');
  const [family_name, setFamily_name] = useState('');
  const [phone_number, setPhone_number] = useState('');

  const [todayTasks, setTodayTasks] = useState(0);
  const [openTasks, setOpenTasks] = useState(0);
  const [inProgressTasks, setInProgressTasks] = useState(0);

  const date = new Date();
  const fullDate =
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  const userPhoto = require('../../assets/img_lights.jpeg');
  const [logoBase64, setLogoBase64] = useState('');
  const [userTasks, setUserTasks] = useGlobal('userTasks');
  const [groups, setGroups] = useGlobal([]);

  const getDetails = async (token: string, tenant: string) => {
    const details = await getTaskDetails(token, tenant);

    details.sort((a, b) => {
      if (a.orderMobile === b.orderMobile) {
        return a.label.localeCompare(b.label);
      }

      if (a.orderMobile == null) {
        return 1;
      }
      if (b.orderMobile == null) {
        return -1;
      }

      return a.orderMobile - b.orderMobile;
    });

    return {
      tableHeaders: details.slice(0, 7).map(item => item.key),
      details,
    };
  };

  const countTasks = (userData, tasks) => {
    let varTodayTemp = 0;
    let varTasksAssignedToMe = 0;
    let varTasksAssignedToMeInProgress = 0;

    const todayDate = moment(date).format('YYYY/MM/DD');

    for (let task in tasks) {
      if (
        todayDate ==
          moment(tasks[task].executionEndDate).format('YYYY/MM/DD') &&
        tasks[task].statusId.toLowerCase().trim() !== 'done'
      ) {
        // ISO format always
        varTodayTemp++;
      }
      if (tasks[task].statusId.toLowerCase().trim() === 'assigned') {
        varTasksAssignedToMe++;
      }
      if (tasks[task].statusId.toLowerCase().trim() === 'inprogress') {
        varTasksAssignedToMeInProgress++;
      }
    }

    setTodayTasks(varTodayTemp);
    setOpenTasks(varTasksAssignedToMe);
    setInProgressTasks(varTasksAssignedToMeInProgress);
  };

  const refreshTasks = async () => {
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

  const getUserInfo = async () => {
    try {
      let uniqueId = await DeviceInfo.getUniqueId();
      console.log('uniqueId', uniqueId);
      const IdToken = (await AsyncStorage.getItem('IdToken')) as string;
      const userData = await getProfileInfo(IdToken);
      console.log('GG', userData['cognito:groups']);
      if (userData['cognito:groups'] != undefined) {
        setGroups(userData['cognito:groups']);
      } else {
        const emptyGroups = [];
        setGroups(emptyGroups);
      }
      const tenant = userData.tenant;
      await AsyncStorage.setItem('tenant', `${tenant}`);
      const settings = await getSettings(IdToken, tenant);

      let logo;
      for (let item in settings) {
        if (settings[item].key == 'tenantLogo') {
          logo = settings[item].value;
        }
      }
      logo = logo ? logo : 'no_logo';
      setLogoBase64(logo);
      await AsyncStorage.setItem('logo', logo);
      const list = await getTasksList(IdToken);

      const statuses = await getTaskStatus(IdToken);
      const tasks = list.tasks;

      const {tableHeaders, details} = await getDetails(IdToken, tenant);

      setGlobal({
        userData: userData,
        userTasks: tasks,
        statuses: statuses,
        tableHeaders,
        globalDetails: details,
      }).then(() => {
        setName(userData.name);
        setFamily_name(userData.family_name);
        setPhone_number(userData.phone_number);
        countTasks(userData, tasks);
      });
    } catch (error) {
      console.log('getUserInfo error (Home.tsx) : ', error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const sendPendingToServer = async () => {
    const IdToken = await AsyncStorage.getItem('IdToken');
    const tenant = await AsyncStorage.getItem('tenant');
    await AsyncStorage.getItem(`pending-${tenant}`).then(getPending => {
      if (getPending !== null) {
        const convertData = JSON.parse(getPending);
        convertData.forEach(async element => {
          element.statusId = 'done';
          await changeTaskStatus(element._id, IdToken, element).then(
            async res => {
              if (Object.keys(res).length !== 0) {
                await AsyncStorage.getItem(`pending-${tenant}`).then(
                  async items => {
                    if (items !== null) {
                      const setItems = JSON.parse(items);
                      const save = setItems.filter(function (e) {
                        return e._id !== element._id;
                      });
                      await AsyncStorage.setItem(
                        `pending-${tenant}`,
                        JSON.stringify(save),
                      );
                    }
                  },
                );
              }
            },
          );
        });
      }
    });
  };

  useEffect(() => {
    setInterval(() => {
      sendPendingToServer();
    }, 180000);
  }, []);

  if (!name && !phone_number) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <LottieView
          source={require('../../assets/lottie/loader.json')}
          autoPlay
          loop
        />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.headerBg}
        source={require('../../assets/home-header.png')}
      />

      {logoBase64 == 'no_logo' ? null : (
        <View style={styles.headerLogoWrapper}>
          <Image
            style={styles.headerLogo}
            source={{uri: logoBase64}}
            resizeMode={'contain'}
          />
        </View>
      )}

      <View style={styles.whitePanel} />
      <View style={styles.headerWrapper}>
        <View style={styles.headerPanel}>
          <Image style={styles.userAvatar} source={userPhoto} />
          <Text style={styles.userName}>
            {name} {family_name}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'row'}}>
              <Image
                style={styles.phoneIco}
                source={require('../../assets/phone-ico.png')}
              />
              <Text style={styles.phoneNumber}>{phone_number}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Image
                style={styles.phoneIco}
                source={require('../../assets/calendar-ico.png')}
              />
              <Text style={styles.textOfDate}>{fullDate}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>
          {t('todayTasks')}
          {'\n'}
          <Text style={styles.number}>{todayTasks}</Text>
        </Text>
        <Text style={styles.text}>
          {t('openTasks')}
          {'\n'}
          <Text style={styles.number}>{openTasks}</Text>
        </Text>
        <Text style={styles.text}>
          {t('inProgressTasks')}
          {'\n'}
          <Text style={styles.number}>{inProgressTasks}</Text>
        </Text>
      </View>

      {/*
            {tasks ?
                <View style={styles.headerWrapperHome}>
                    <View style={styles.headersPanelHome}>
                        {
                            tableHeaders.map((item, index) => {
                                return (
                                    <View style={styles.headerPanelCellHome}>
                                        <Text style={styles.headerPanelTextHome}>{item}</Text>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View> : null} */}

      {/* {tasks ? <View style={styles.listItemsView}>

                <FlatList
                    style={styles.listItems}
                    data={tasks}
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshing={false}
                    onRefresh={refreshTasks}
                    renderItem={(elem, index) => {
                        let { item } = elem
                        return (item.statusId != 'done' && item.statusId != 'new' ? <ListItem tableHeaders={tableHeaders} backgroundColor={elem.index % 2 == 0 ? '#F1FCFF' : 'white'} key={index} itemData={item} done={false} /> :
                            <></>)
                    }}
                />
            </View> : null} */}

      <BottomMenu fromWhere={'home'} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerLogoWrapper: {
    backgroundColor: 'white',
    borderRadius: scale(30),
    position: 'absolute',
    top: scale(20),
    left: scale(20),
  },
  headerLogo: {
    width: scale(200),
    height: scale(100),
  },
  container: {
    flex: 1,
  },
  headerBg: {
    width: '100%',
    height: scale(480),
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerPanel: {
    alignSelf: 'center',
    width: scale(700),
    height: scale(450),
    borderRadius: scale(80),
    backgroundColor: 'white',
    marginTop: scale(250),
  },
  horizontalBlueLine: {
    width: '100%',
    height: scale(110),
    backgroundColor: 'rgba(1, 170, 212, 0.8)',
    marginTop: scale(157),
  },
  blueLineText: {
    color: 'white',
    fontSize: scale(60),
    alignSelf: 'center',
    position: 'absolute',
    marginTop: scale(170),
    fontWeight: 'bold',
  },
  userAvatar: {
    borderRadius: scale(100),
    width: scale(180),
    height: scale(180),
    alignSelf: 'center',
    marginTop: scale(50),
  },
  userName: {
    alignSelf: 'center',
    fontSize: scale(36),
    marginTop: scale(25),
    fontWeight: 'bold',
  },
  textOfDate: {
    alignSelf: 'center',
    fontSize: scale(40),
    marginTop: scale(30),
  },
  phoneNumber: {
    alignSelf: 'center',
    fontSize: scale(40),
    marginTop: scale(30),
  },
  text: {
    fontSize: scale(35),
    marginTop: scale(30),
    marginRight: scale(40),
    textAlign: 'center',
    lineHeight: scale(60),
  },
  number: {
    fontSize: scale(40),
    fontWeight: 'bold',
  },
  textWrapper: {
    alignSelf: 'center',
    // flexDirection: 'row',
    marginLeft: scale(40),
  },
  phoneIco: {
    width: scale(40),
    height: scale(40),
    marginTop: scale(40),
    marginRight: scale(20),
    marginLeft: scale(50),
  },
  whitePanel: {
    width: '100%',
    backgroundColor: 'white',
    height: '100%',
    borderRadius: scale(40),
    position: 'absolute',
    top: scale(400),
  },
  listItemsView: {
    height: scale(590),
    width: '100%',
  },
  listItems: {
    flexGrow: 1,
  },
  headerWrapperHome: {
    width: '90%',
    height: 'auto',
    backgroundColor: '#DBF7FF',
    borderRadius: scale(40),
    alignSelf: 'center',
    marginBottom: scale(50),
    marginTop: scale(50),
  },
  headersPanelHome: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerPanelCellHome: {
    width: '20%',
    height: 'auto',
  },
  headerPanelTextHome: {
    color: 'black',
    width: scale(115),
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: scale(30),
    marginTop: scale(20),
    marginBottom: scale(20),
  },
});
