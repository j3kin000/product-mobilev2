import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  I18nManager,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {BottomMenu} from '../../components/BottomMenu';
import {scale} from '../../common/common';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import RNRestart from 'react-native-restart';
import {useGlobal, setGlobal} from '../../global/index';
import moment from 'moment';

export const Settings = () => {
  const isRtl = I18nManager.isRTL;
  const navigation = useNavigation();
  const {t, i18n} = useTranslation();
  const [logo, setLogo] = useState('');
  const singOut = async () => {
    await AsyncStorage.removeItem('usernameRestore');
    // await AsyncStorage.removeItem("passwordRestore")
    await AsyncStorage.removeItem('IdToken');
    await AsyncStorage.removeItem('tenant');
    await AsyncStorage.removeItem('logo');
    await AsyncStorage.removeItem('viewMode');
    await AsyncStorage.setItem('stayLoggedIn', 'false').then(() => {
      navigation.replace('Login');
    });
    setGlobal({
      tableHeaders: [],
    });
  };

  const getLogo = async () => {
    let logo = await AsyncStorage.getItem('logo');
    logo = logo ? logo : 'no_logo';
    setLogo(logo);
  };

  useEffect(() => {
    getLogo();
  }, []);

  const [userInfo] = useGlobal('userData');
  const [env, setEnv] = useState('');
  const {auth_time, family_name, name, phone_number, email} = userInfo;
  const formatedTime = moment(auth_time).format('HH:MM DD:MM:YYYY');

  const getEnv = async () => {
    const env = await AsyncStorage.getItem('envState');
    setEnv(env);
  };
  getEnv();
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollViewWrapper}>
        <View style={styles.headerBlue} />
        {/* <Text
          style={{
            color: 'white',
            position: 'absolute',
            top: scale(30),
            left: scale(20),
          }}>
          {env}
        </Text> */}
        <View style={styles.whitePanel} />
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
              styles.switchText,
              {alignSelf: logo == 'no_logo' ? 'center' : 'auto'},
            ]}>
            {t('switchLanguageHere')}
          </Text>
        </View>

        <Text style={styles.currLangText}>{t('currentLang')}</Text>

        <View style={styles.languagesWrapper}>
          <TouchableOpacity
            style={[styles.langBtn, {marginRight: scale(10)}]}
            onPress={() => {
              i18n
                .changeLanguage(i18n.language === 'he' ? 'en' : 'he')
                .then(() => {
                  I18nManager.forceRTL(false);
                  RNRestart.Restart();
                });
            }}>
            <Text style={styles.logoutText}>{t('english')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, {marginLeft: scale(10)}]}
            onPress={() => {
              i18n
                .changeLanguage(i18n.language === 'en' ? 'he' : 'en')
                .then(() => {
                  I18nManager.forceRTL(i18n.language === 'he');
                  RNRestart.Restart();
                });
            }}>
            <Text style={styles.logoutText}>{t('hebrew')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.detailsText1}>{t('profileDetails')}</Text>

        <View style={styles.infoWrapper}>
          <View style={styles.blueRow}>
            <Text style={styles.key}>{isRtl ? t('name') : t('name')}</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
          <View style={styles.lightBlueRow}>
            <Text style={styles.key}>
              {isRtl ? t('familyName') : t('familyName')}
            </Text>
            <Text style={styles.value}>{family_name}</Text>
          </View>
          <View style={styles.blueRow}>
            <Text style={styles.key}>{isRtl ? t('email') : t('email')}</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
          <View style={styles.lightBlueRow}>
            <Text style={styles.key}>
              {isRtl ? t('phoneNumber') : t('phoneNumber')}
            </Text>
            <Text style={styles.value}>{phone_number}</Text>
          </View>
          <View style={styles.blueRow}>
            <Text style={styles.key}>
              {isRtl ? t('authenticationTime') : t('authenticationTime')}
            </Text>
            <Text style={styles.value}>{formatedTime}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={singOut}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <SafeAreaView style={styles.offset} />
      <BottomMenu fromWhere={'settings'} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerLogoWrapper: {
    backgroundColor: 'white',
    borderRadius: scale(30),
    marginLeft: scale(20),
    marginTop: scale(80),
  },
  headerLogo: {
    width: scale(200),
    height: scale(100),
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerBlue: {
    width: '100%',
    height: scale(300),
    position: 'absolute',
    backgroundColor: '#37BDE0',
  },
  whitePanel: {
    width: '100%',
    backgroundColor: 'white',
    height: '100%',
    borderRadius: scale(40),
    position: 'absolute',
    top: scale(260),
  },
  logoutBtn: {
    width: scale(200),
    height: scale(80),
    borderRadius: scale(60),
    alignSelf: 'center',
    backgroundColor: '#01AAD4',
    marginTop: scale(350),
  },
  langBtn: {
    width: scale(250),
    height: scale(80),
    borderRadius: scale(70),
    alignSelf: 'center',
    backgroundColor: '#201F1F',
    marginTop: scale(30),
  },
  logoutText: {
    color: 'white',
    fontSize: scale(30),
    alignSelf: 'center',
    marginTop: scale(15),
  },
  switchText: {
    marginTop: scale(100),
    marginLeft: scale(50),
    alignSelf: 'center',
    fontSize: scale(40),
    color: 'white',
  },
  currLangText: {
    alignSelf: 'center',
    marginTop: scale(150),
    fontWeight: 'bold',
    fontSize: scale(40),
  },
  languagesWrapper: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  detailsText1: {
    alignSelf: 'center',
    color: 'black',
    fontSize: scale(40),
    marginTop: scale(200),
  },
  infoWrapper: {
    width: '80%',
    height: scale(300),
    alignSelf: 'center',
    marginTop: scale(50),
  },
  blueRow: {
    width: '100%',
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#F1FCFF',
    marginTop: scale(10),
    flexDirection: 'row',
    paddingTop: scale(25),
    paddingLeft: scale(80),
  },
  lightBlueRow: {
    width: '100%',
    height: scale(100),
    borderRadius: scale(70),
    marginTop: scale(10),
    flexDirection: 'row',
    paddingTop: scale(35),
    paddingLeft: scale(80),
  },
  key: {
    color: 'black',
  },
  value: {
    position: 'absolute',
    right: scale(60),
    top: scale(25),
  },
  scrollViewWrapper: {
    marginBottom: scale(80),
  },
  offset: {
    height: scale(50),
    width: '100%',
    backgroundColor: 'black',
  },
});
