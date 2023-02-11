import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import React, {useState, useMemo, useRef} from 'react';
import {scale} from '../../common/common';
import {BottomMenu} from '../../components/BottomMenu';
import {useNavigation} from '@react-navigation/native';
import Lottie from 'lottie-react-native';
import {DateTimePicker} from './FormElements/DateTimePicker';
import {FormProvider} from './FormContext';
import {useTranslation} from 'react-i18next';
import {Info} from './FormElements/Info';

const FormsPageBasic = (props: any) => {
  const {taskType, taskId, statusId, _id} = props.route.params.itemData;

  const {t, i18n} = useTranslation();
  const data = props.route.params.getFormData;
  const wholeTask = props.route.params.itemData;
  const id = data._id;
  const getUserGroup = props.route.params.getUserGroup;
  const [showAlert, setShowAlert] = useState(false);
  const [changeStatusResponse, setChangeStatusResponse] = useState(null);
  const formReference = useRef();
  const navigation = useNavigation();

  const shownFields = useMemo(() => {
    if (data) {
      return data;
    }
  }, [data]);

  const [listScrolling, setListScrolling] = useState(true);
  let checker = false;
  const createComponent = (item, index) => {
    const {inputType, key} = item;
    switch (inputType) {
      case 'dateTimeRegister':
        checker = true;
        return <Info itemData={item} />;
      case 'radios':
        checker = key !== 'continueExecution' ? true : false;
        return <Info itemData={item} />;
      case 'dropdown':
        checker = true;
        return <Info itemData={item} />;
      case 'text':
        checker = true;
        return <Info itemData={item} />;
      case 'cameraButton':
        checker = true;
        return <Info itemData={item} />;
      case 'signature':
        checker = true;
        return <Info itemData={item} />;
      case 'markup':
        checker = true;
        return (
          <Info
            itemData={item}
            wholeTask={wholeTask}
            getUserGroup={getUserGroup}
          />
        );
    }
  };

  const components = shownFields?.map(createComponent);

  return (
    <SafeAreaView style={styles.container}>
      {showAlert ? (
        <View style={styles.lottieWrapper}>
          {changeStatusResponse == 200 ? (
            <Lottie
              source={require('../../assets/lottie/lottie-checked.json')}
              autoPlay
              loop
            />
          ) : (
            <Lottie
              source={require('../../assets/lottie/cross.json')}
              autoPlay
              loop
            />
          )}
        </View>
      ) : null}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.arrowBackWrapper}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image
            style={styles.arrowBack}
            source={require('../../assets/arrow-back-white.png')}
          />
        </TouchableOpacity>

        <View style={styles.headerSigns}>
          <Text style={styles.itemName}>{taskType}</Text>
          <Text style={styles.itemDesc}>{statusId}</Text>
        </View>
        <View style={styles.taskIdWrapper}>
          <Text style={styles.taskId}>{t('taskId')}</Text>
          <Text style={styles.id}>{taskId}</Text>
        </View>
      </View>
      <View style={{flex: 1}}>
        <ScrollView
          style={styles.scrollingArea}
          scrollEnabled={listScrolling}
          ref={formReference}>
          {checker ? (
            components
          ) : (
            <Text style={styles.noForm}>{t('noFormElements')}</Text>
          )}
        </ScrollView>
        <DateTimePicker onSelect={e => console.log(e)} />
      </View>

      <BottomMenu fromWhere={'list'} />
    </SafeAreaView>
  );
};

export const InfoPage = props => (
  <FormProvider>
    <FormsPageBasic {...props} />
  </FormProvider>
);

const styles = StyleSheet.create({
  lottieWrapper: {
    position: 'absolute',
    width: scale(600),
    height: scale(600),
    borderRadius: scale(20),
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: scale(400),
    zIndex: 999,
  },
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
    marginLeft: scale(40),
  },
  itemName: {
    color: 'white',
    fontSize: scale(42),
  },
  itemDesc: {
    color: 'white',
    fontSize: scale(26),
  },
  scrollingArea: {
    marginBottom: scale(130),
    backgroundColor: 'white',
    marginTop: scale(-35),
    borderTopRightRadius: scale(50),
    borderTopLeftRadius: scale(50),
    paddingTop: scale(50),
    paddingLeft: scale(70),
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
  noForm: {
    marginLeft: scale(80),
    fontSize: scale(40),
    marginTop: scale(100),
    color: 'gray',
  },
});
