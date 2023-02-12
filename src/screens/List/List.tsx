import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import {BottomMenu} from '../../components/BottomMenu';
import {scale} from '../../common/common';
import {ListItem} from './ListItem';
import {ListItemTab} from './ListItemTab';
import {useGlobal, setGlobal} from '../../global/index';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTasksList, changeTaskStatus} from '../../api/index';
import {useTranslation} from 'react-i18next';
import {I18nManager} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SearchBar from 'react-native-dynamic-search-bar';
import 'moment/locale/he';
import 'moment/locale/en-gb';
import {useNavigation} from '@react-navigation/native';
import {getSettings} from '../../api/index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const List = (props: any) => {
  const {t, i18n} = useTranslation();
  const submitted = props?.route?.params?.submitted || false;
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('notDone');

  const [userTasks] = useGlobal('userTasks');
  const [statuses] = useGlobal('statuses');
  const [tableHeaders] = useGlobal('tableHeaders');
  const [globalDetails] = useGlobal('globalDetails');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [timeNow, setTimeNow] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [viewMenu, changeViewMenuStatus] = useState(false);
  const [viewMode, setViewMode] = useState('');
  const [logo, setLogo] = useState('');
  const [getPendingData, setPendingData] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [taskType, setTaskType] = useState<string[]>([]);
  const [taskDetailsIcons, setTaskDetailsIcon] = useState([]);
  const [showingTaskCreation, setShowingTaskCreation] = useState(false);
  const [taskByStatus, setTaskByStatus] = useState({
    done: [],
    pending: [],
    escalate: [],
    undone: [],
  });

  const detailMap = useMemo(
    () =>
      globalDetails.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {}),
    [globalDetails],
  );

  const tableHeaderSlice = tableHeaders.slice(0, 5);
  const tableHeaderLabels = tableHeaderSlice.map(
    item => detailMap[item]?.label ?? item,
  );

  const getViewMode = async () => {
    let mode = await AsyncStorage.getItem('viewMode');
    setViewMode(mode);
  };
  getViewMode();

  const getLogo = async () => {
    let logo = await AsyncStorage.getItem('logo');
    logo = logo ? logo : 'no_logo';
    setLogo(logo);
  };

  const getUserSettings = async () => {
    const IdToken = await AsyncStorage.getItem('IdToken');
    const tenant = await AsyncStorage.getItem('tenant');
    const list = await getTasksList(IdToken);
    setTaskDetailsIcon(list.taskDetailsIcons);
    const settings = await getSettings(IdToken, tenant);
    for (let item in settings) {
      if (settings[item].key == 'enableAgentCreateTask') {
        if (settings[item].value == 'true') {
          setShowingTaskCreation(true);
        }
      }
    }
  };

  useEffect(() => {
    if (submitted) {
      refreshTasks();
    }
  }, [submitted]);

  const tasksList = useMemo(() => {
    let tasksSliced = userTasks.slice();

    tasksSliced.sort(function (a, b) {
      let dateA = new Date(a.executionEndDate);
      let dateB = new Date(b.executionEndDate);
      return !a.executionEndDate ? 1 : !b.executionEndDate ? -1 : dateA - dateB;
    });

    tasksSliced.sort(function (a, b) {
      if (!a.urgentTask && !b.urgentTask) {
        return 0;
      }
      if (!a.urgentTask && b.urgentTask) {
        return 1;
      }
      if (a.urgentTask && !b.urgentTask) {
        return -1;
      }
    });

    return tasksSliced;
  }, [userTasks]);

  const statusLabels = statuses.reduce((res, item) => {
    return {...res, [item.Key]: item.label};
  }, {});

  const isRtl = I18nManager.isRTL;

  let timePretty = moment(timeNow).format('DD/MM/YYYY');

  let todayDate;

  if (isRtl) {
    todayDate = moment().locale('he').format('MMMM Do YYYY, h:mm a');
  } else {
    todayDate = moment().locale('en-gb').format('MMMM Do YYYY, h:mm a');
  }

  const filterBySearch = (data: any[], searchValue: string) => {
    if (!searchValue) {
      return data;
    }

    const loweredSearch = searchValue.toLowerCase();

    return data.filter(item => {
      return item.taskDetails.some(
        detail =>
          detail.value &&
          detail.value.toString().toLowerCase().includes(loweredSearch),
      );
    });
  };

  const filterByType = (data: any[], matchType: string) => {
    if (!matchType) {
      return data;
    }

    const loweredType = matchType.toLowerCase();

    return data.filter(item =>
      item.taskType.toLowerCase().includes(loweredType),
    );
  };

  const filterByDate = (data: any[], matchDate: string | null) => {
    if (matchDate == null) {
      return data;
    }

    return data.filter(item => {
      const itemDateString = moment(item.executionEndDate).format('DD/MM/YYYY');
      const matchDateString = moment(matchDate).format('DD/MM/YYYY');
      return itemDateString === matchDateString;
    });
  };

  useEffect(() => {
    const detectedTypes = new Set<string>();

    for (const item of tasksList) {
      detectedTypes.add(item.taskType);
    }

    setTaskType([...detectedTypes]);

    let tempFilteredTasks = filterByType(tasksList, selectedType);
    tempFilteredTasks = filterByDate(tempFilteredTasks, timeNow);
    tempFilteredTasks = filterBySearch(tempFilteredTasks, searchText);

    if (tempFilteredTasks.length > 0) {
      const res = tempFilteredTasks.reduce(
        (acc, curr) => {
          const colorDefault = 'white';
          if (curr.statusId == 'done' || curr.statusId == 'approved') {
            const getClr = statuses.find(item => item.Key === curr.statusId);
            const newColor = getClr?.color ?? colorDefault;
            const newCurr = {...curr, color: newColor};
            acc.done.push(newCurr);
          } else if (curr.statusId == 'Pending') {
            const getClr = statuses.find(item => item.Key === curr.statusId);
            const newColor = getClr?.color ?? colorDefault;
            const newCurr = {...curr, color: newColor};
            acc.pending.push(newCurr);
          } else if (curr.statusId == 'escalate') {
            const getClr = statuses.find(item => item.Key === curr.statusId);
            const newColor = getClr?.color ?? colorDefault;
            const newCurr = {...curr, color: newColor};
            acc.escalate.push(newCurr);
          } else if (
            curr.statusId.toLowerCase() == 'assigned' ||
            curr.statusId.toLowerCase() == 'inprogress'
          ) {
            const getClr = statuses.find(item => item.Key === curr.statusId);
            const newColor = getClr?.color ?? colorDefault;
            const newCurr = {...curr, color: newColor};
            acc.undone.push(newCurr);
          }
          return acc;
        },
        {done: [], pending: [], escalate: [], undone: []},
      );
      setTaskByStatus(res);
    } else {
      setTaskByStatus(tempFilteredTasks);
    }
  }, [tasksList, selectedType, timeNow, searchText]);

  const refreshTasks = async () => {
    try {
      const IdToken = await AsyncStorage.getItem('IdToken');
      const list = await getTasksList(IdToken);
      const tasks = list.tasks;
      if (tasks) {
        setGlobal({
          userTasks: tasks,
        });
      }
    } catch (error) {
      console.log('getUsersTasks error (BottomMenu.tsx) : ', error);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    setTimeNow(date);
    hideDatePicker();
  };

  const getPending = async () => {
    const tenant = await AsyncStorage.getItem('tenant');
    AsyncStorage.getItem(`pending-${tenant}`).then(async getItems => {
      if (getItems !== null) {
        const setItems = JSON.parse(getItems);
        setPendingData(setItems);
      }
    });
  };

  const sendPendingToServer = async () => {
    const IdToken = await AsyncStorage.getItem('IdToken');
    const tenant = await AsyncStorage.getItem('tenant');
    await AsyncStorage.getItem(`pending-${tenant}`).then(async getPending => {
      if (getPending) {
        const convertData = JSON.parse(getPending);
        await Promise.all(
          convertData.map(async element => {
            element.statusId = 'done';
            const res = await changeTaskStatus(element._id, IdToken, element);
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
          }),
        );
        refreshTasks();
      }
    });
  };

  const init = async () => {
    try {
      await getUserSettings();
      await getLogo();
      await getPending();
    } catch (error) {
      console.log('[init] error :>> ', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      sendPendingToServer();
    }, 180000);

    init();

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.pageHeader,
          {height: timeNow ? scale(400) : scale(390)},
        ]}>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          value={timeNow}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <View style={{flexDirection: 'row'}}>
          {logo != 'no_logo' ? (
            <View style={styles.headerLogoWrapper}>
              <Image
                style={styles.headerLogo}
                source={{uri: logo}}
                resizeMode={'contain'}
              />
            </View>
          ) : null}
          <Text
            style={[
              styles.headerMainText2,
              {alignSelf: logo != 'no_logo' ? 'auto' : 'center'},
            ]}>
            {todayDate}
          </Text>
        </View>
        {showingTaskCreation ? (
          <TouchableOpacity
            style={styles.createTaskBtn}
            onPress={() => {
              navigation.navigate('CreateTask');
            }}>
            <Image
              style={styles.plus}
              source={require('../../assets/plus.png')}
            />
          </TouchableOpacity>
        ) : null}

        <View
          style={[
            styles.viewOfPageWrapper,
            {top: viewMenu ? scale(130) : scale(170)},
          ]}>
          <View style={styles.expandedMenu}>
            <TouchableOpacity
              onPress={async () => {
                changeViewMenuStatus(false);
                await AsyncStorage.setItem('viewMode', 'list').then(() => {
                  setViewMode('list');
                });
              }}>
              <Image
                style={styles.listIco}
                source={require('../../assets/list.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                changeViewMenuStatus(false);
                await AsyncStorage.setItem('viewMode', 'table').then(() => {
                  setViewMode('table');
                });
              }}>
              <Image
                style={styles.cellsIco}
                source={require('../../assets/cells.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.btnsContainer,
            {marginTop: logo == 'no_logo' ? scale(65) : scale(110)},
          ]}>
          <TouchableOpacity
            style={[
              styles.allBtn,
              {backgroundColor: activeTab == 'notDone' ? 'black' : 'white'},
            ]}
            onPress={() => {
              setActiveTab('notDone');
            }}>
            <Text
              style={[
                styles.notDoneText,
                {color: activeTab == 'notDone' ? 'white' : 'black'},
              ]}>
              {t('activeTasks')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.allBtn,
              {backgroundColor: activeTab == 'done' ? 'black' : 'white'},
            ]}
            onPress={() => {
              setActiveTab('done');
            }}>
            <Text
              style={[
                styles.doneText,
                {color: activeTab == 'done' ? 'white' : 'black'},
              ]}>
              {t('done')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.allBtn,
              {backgroundColor: activeTab == 'pending' ? 'black' : 'white'},
            ]}
            onPress={() => {
              setActiveTab('pending');
            }}>
            <Text
              style={[
                styles.doneText,
                {color: activeTab == 'pending' ? 'white' : 'black'},
              ]}>
              {t('pending')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.allBtn,
              {backgroundColor: activeTab == 'escalate' ? 'black' : 'white'},
            ]}
            onPress={() => {
              setActiveTab('escalate');
            }}>
            <Text
              style={[
                styles.doneText,
                {color: activeTab == 'escalate' ? 'white' : 'black'},
              ]}>
              {t('escalate')}
            </Text>
          </TouchableOpacity>
        </View>

        {timeNow ? (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              marginTop: scale(12),
            }}>
            <View>
              <Text style={{color: 'white'}}>{t('selectedDate')}: </Text>
              <Text style={{alignSelf: 'center', color: 'black'}}>
                {timePretty}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setTimeNow(null);
              }}>
              <Image
                style={styles.clearImage}
                source={require('../../assets/date-clear-ico.png')}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <View style={styles.filterPanel}>
        <View style={styles.searchBar}>
          <SearchBar
            placeholder={t('searchHere')}
            onPress={() => () => {}}
            onChangeText={text => {
              setSearchText(text);
            }}
            height={25}
            fontSize={15}
            textInputStyle={{paddingBottom: scale(-5), paddingTop: scale(-5)}}
            clearIconImageStyle={{display: 'none'}}
            style={{height: '100%', backgroundColor: '#f2f0f0'}}
            value={searchText}
          />
        </View>
        <View style={styles.iconPanel}>
          <TouchableOpacity
            style={styles.headerFunnel}
            onPress={() => {
              setExpanded(!expanded);
            }}>
            <View>
              <Icon name="filter" size={27} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerCalendar}
            onPress={showDatePicker}>
            <Image
              style={styles.calendarIcon}
              source={require('../../assets/calendar1.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerRestore}
            onPress={() => {
              setSelectedType('');
              setSearchText('');
              setTimeNow(null);
              setExpanded(false);
            }}>
            <View>
              <Icon name="restore" size={27} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {expanded && (
        <View style={styles.typeScrollingArea}>
          {taskType.map((item, index) => {
            return (
              <TouchableOpacity
                style={styles.typeItem}
                onPress={() => {
                  setSelectedType(item);
                  setExpanded(false);
                }}>
                <Text
                  style={selectedType === item ? styles.selectedType : null}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.offsetContainer}>
        <View style={styles.tableContainer}>
          {viewMode == 'list' || !viewMode ? (
            <>
              {tasksList && (
                <View style={styles.headerWrapper}>
                  <View style={styles.headersPanel}>
                    {tableHeaderLabels.map((item, index) => {
                      return (
                        <View style={styles.headerPanelCell}>
                          <Text style={styles.headerPanelText}>{item}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {tasksList ? (
                <View style={styles.listItemsView}>
                  {activeTab == 'done' ? (
                    <FlatList
                      style={styles.listItems}
                      data={taskByStatus.done}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          <ListItem
                            backgroundColor={
                              item.color != '' ? item.color : 'white'
                            }
                            tableHeaders={tableHeaderSlice}
                            key={index}
                            statusLabels={statusLabels}
                            itemData={item}
                            done={false}
                          />
                        );
                      }}
                    />
                  ) : activeTab == 'notDone' ? (
                    <FlatList
                      style={styles.listItems}
                      data={taskByStatus.undone}
                      contentContainerStyle={{flexGrow: 0}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          <ListItem
                            backgroundColor={
                              item.color != '' ? item.color : 'white'
                            }
                            tableHeaders={tableHeaderSlice}
                            key={index}
                            statusLabels={statusLabels}
                            itemData={item}
                            done={false}
                          />
                        );
                      }}
                    />
                  ) : activeTab == 'pending' ? (
                    <FlatList
                      style={styles.listItems}
                      data={getPendingData}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          item.statusId == 'Pending' && (
                            <ListItem
                              backgroundColor={
                                item.color != '' ? item.color : 'white'
                              }
                              tableHeaders={tableHeaderSlice}
                              key={index}
                              statusLabels={statusLabels}
                              itemData={item}
                              done={false}
                            />
                          )
                        );
                      }}
                    />
                  ) : (
                    <FlatList
                      style={styles.listItems}
                      data={taskByStatus.escalate}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          <ListItem
                            backgroundColor={
                              item.color != '' ? item.color : 'white'
                            }
                            tableHeaders={tableHeaderSlice}
                            key={index}
                            statusLabels={statusLabels}
                            itemData={item}
                            done={false}
                          />
                        );
                      }}
                    />
                  )}
                </View>
              ) : (
                <View style={styles.noTasksWrapper}>
                  {activeTab == 'done' ? (
                    <View style={styles.listItems}>
                      <Text style={styles.noTasksText}>
                        No tasks{'\n'}Great job!
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noTasksText}>
                      You have no available tasks
                    </Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {tasksList ? (
                <View style={styles.listItemsView}>
                  {activeTab == 'done' ? (
                    <FlatList
                      style={styles.listItems}
                      data={taskByStatus.done}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          <ListItemTab
                            backgroundColor={
                              item.color != '' ? item.color : 'white'
                            }
                            tableHeaders={tableHeaderSlice}
                            key={index}
                            statusLabels={statusLabels}
                            itemData={item}
                            done={false}
                            taskDetailsIcons={taskDetailsIcons}
                          />
                        );
                      }}
                    />
                  ) : activeTab == 'notDone' ? (
                    <FlatList
                      style={styles.listItems}
                      data={taskByStatus.undone}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;

                        return (
                          <ListItemTab
                            backgroundColor={
                              item.color != '' ? item.color : 'white'
                            }
                            tableHeaders={tableHeaderSlice}
                            key={index}
                            statusLabels={statusLabels}
                            itemData={item}
                            done={false}
                            taskDetailsIcons={taskDetailsIcons}
                          />
                        );
                      }}
                    />
                  ) : activeTab == 'pending' ? (
                    <FlatList
                      style={styles.listItems}
                      data={getPendingData}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          item.statusId == 'Pending' && (
                            <ListItemTab
                              backgroundColor={
                                item.color != '' ? item.color : 'white'
                              }
                              tableHeaders={tableHeaderSlice}
                              key={index}
                              statusLabels={statusLabels}
                              itemData={item}
                              done={false}
                              taskDetailsIcons={taskDetailsIcons}
                            />
                          )
                        );
                      }}
                    />
                  ) : (
                    <FlatList
                      style={styles.listItems}
                      data={taskByStatus.escalate}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshing={false}
                      onRefresh={refreshTasks}
                      renderItem={(elem, index) => {
                        let {item} = elem;
                        return (
                          <ListItemTab
                            backgroundColor={
                              item.color != '' ? item.color : 'white'
                            }
                            tableHeaders={tableHeaderSlice}
                            key={index}
                            statusLabels={statusLabels}
                            itemData={item}
                            done={false}
                            taskDetailsIcons={taskDetailsIcons}
                          />
                        );
                      }}
                    />
                  )}
                </View>
              ) : (
                <View style={styles.noTasksWrapper}>
                  {activeTab == 'done' ? (
                    <View style={styles.listItems}>
                      <Text style={styles.noTasksText}>
                        No tasks{'\n'}Great job!
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noTasksText}>
                      You have no available tasks
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>
        <SafeAreaView style={styles.offset} />
      </View>
      <BottomMenu fromWhere={'list'} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  offset: {
    height: scale(120),
    width: '100%',
    backgroundColor: 'black',
  },
  offsetContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerLogoWrapper: {
    backgroundColor: 'white',
    borderRadius: scale(30),
    marginLeft: scale(20),
    marginTop: scale(-20),
  },
  headerLogo: {
    width: scale(200),
    height: scale(100),
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewOfPageWrapper: {
    // marginTop: scale(35)
    marginLeft: scale(30),
    position: 'absolute',
    right: scale(620),
    top: scale(130),
  },
  createTaskBtn: {
    position: 'absolute',
    left: scale(30),
    top: scale(175),
  },
  btnText: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  viewOfPageText: {
    fontSize: scale(35),
    marginRight: scale(20),
    color: 'white',
  },
  expandedMenu: {
    flexDirection: 'row',
  },
  dropdownIcon: {
    width: scale(40),
    height: scale(20),
    marginTop: scale(15),
  },
  pageHeader: {
    width: '100%',
    backgroundColor: '#3CBEE0',
    paddingTop: scale(50),
  },
  headerMainText: {
    fontSize: scale(36),
    color: 'white',
    fontWeight: 'bold',
    position: 'absolute',
    right: scale(30),
    top: scale(20),
  },
  headerMainText2: {
    fontSize: scale(40),
    color: 'white',
    marginTop: scale(-20),
    marginLeft: scale(50),
  },
  headerBtn: {
    backgroundColor: 'white',
    borderColor: '#01AAD4',
    borderWidth: scale(2),
    borderRadius: scale(5),
  },
  prevBtn: {
    width: scale(53),
    height: scale(53),
    marginLeft: scale(20),
    paddingTop: scale(10),
  },
  mainBtn: {
    width: scale(150),
    height: scale(53),
    marginLeft: scale(7),
  },
  nextBtn: {
    width: scale(53),
    height: scale(53),
    marginLeft: scale(7),
    paddingTop: scale(10),
  },
  arrowBackBtn: {
    width: scale(18),
    height: scale(28),
    alignSelf: 'center',
  },
  mainBtnText: {
    alignSelf: 'center',
    fontSize: scale(26),
    color: '#01AAD4',
    marginTop: scale(5),
  },
  tasksStatusPanel: {
    height: scale(80),
    width: '100%',
    backgroundColor: 'white',
    borderBottomColor: '#C4D2DF',
    borderBottomWidth: scale(3),
    flexDirection: 'row',
    paddingLeft: scale(30),
  },
  btnsContainer: {
    // alignSelf: 'center',
    flexDirection: 'row',
    marginTop: scale(30),
    marginLeft: scale(50),
  },
  allBtn: {
    width: scale(180),
    height: scale(80),
    marginTop: scale(18),
    backgroundColor: 'white',
    borderRadius: scale(50),
    paddingTop: scale(17),
    marginLeft: scale(15),
  },
  notDoneBtn: {
    width: scale(130),
    height: scale(80),
    marginTop: scale(18),
    backgroundColor: 'black',
    borderRadius: scale(50),
    paddingTop: scale(17),
    marginRight: scale(10),
  },
  doneText: {
    fontSize: scale(28),
    alignSelf: 'center',
  },
  notDoneText: {
    fontSize: scale(28),
    alignSelf: 'center',
  },
  listItemsView: {
    width: '100%',
    flex: 1,
  },
  listItems: {
    marginBottom: scale(0),
    flexGrow: 1,
  },
  noTasksWrapper: {
    marginTop: scale(300),
    alignSelf: 'center',
  },
  noTasksText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: scale(50),
  },
  headersPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerPanelCell: {
    width: '20%',
    height: 'auto',
  },
  headerPanelText: {
    color: 'black',
    width: scale(115),
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: scale(30),
    marginTop: scale(20),
    marginBottom: scale(20),
  },
  headerWrapper: {
    width: '90%',
    height: 'auto',
    backgroundColor: '#DBF7FF',
    borderRadius: scale(40),
    alignSelf: 'center',
    marginBottom: scale(50),
  },
  clearImage: {
    width: scale(60),
    height: scale(60),
    marginLeft: scale(15),
    marginTop: scale(10),
  },
  filterPanel: {
    height: scale(150),
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    borderTopLeftRadius: scale(50),
    borderTopRightRadius: scale(50),
    marginTop: scale(-40),
  },
  iconPanel: {
    flexDirection: 'row',
    flex: 4,
  },
  listIco: {
    width: scale(50),
    height: scale(50),
    // marginLeft: scale(-0),
    marginTop: scale(20),
  },
  cellsIco: {
    width: scale(50),
    height: scale(50),
    marginLeft: scale(40),
    marginTop: scale(20),
  },
  plus: {
    width: scale(80),
    height: scale(80),
  },
  typeScrollingArea: {
    marginLeft: scale(50),
    marginBottom: scale(50),
  },
  dropdownHeader: {
    width: '90%',
    height: scale(120),
    borderColor: 'lightgray',
    borderWidth: scale(3),
    borderRadius: scale(30),
    alignSelf: 'center',
    marginBottom: scale(20),
  },
  dropdownHeaderText: {
    color: 'black',
    paddingTop: scale(40),
    paddingLeft: scale(40),
  },
  typeItem: {
    paddingTop: scale(40),
    paddingLeft: scale(40),
    width: '93%',
    borderColor: 'lightgray',
    borderBottomWidth: scale(3),
  },
  headerFunnel: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  headerRestore: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  headerCalendar: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  calendarIcon: {
    height: scale(63),
    width: scale(63),
  },
  searchBar: {
    paddingTop: scale(30),
    paddingBottom: scale(30),
    flex: 8,
  },
  selectedType: {
    fontWeight: 'bold',
    color: '#5db6e3',
  },
});
