import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  I18nManager,
  KeyboardAvoidingView,
  Dimensions,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {scale} from '../../common/common';
import {userSignIn, getProfileInfo} from '../../api/index';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Checkbox} from '../../components/Checkbox';
import {useTranslation} from 'react-i18next';
import {MessagingService} from '../../common/messaging';

export const Login = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const isRtl = I18nManager.isRTL;

  const [checkBoxState, setCheckBoxState] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginDetailsError, setLoginDetailsError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [envState, setEnvState] = useState('DEV');
  const [envUiExpand, setEnvUiExpand] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeUsername = (query: any) => {
    setUsername(query);
  };
  const onChangePassword = (query: any) => {
    setPassword(query);
  };
  const passwordInputRef = useRef<HTMLDivElement>();
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const restoreUsername = await AsyncStorage.getItem('usernameRestore');
    // const restorePassword = await AsyncStorage.getItem("passwordRestore")
    console.log('restoreUsername', restoreUsername);
    if (restoreUsername) {
      setUsername(restoreUsername);
    }

    await AsyncStorage.setItem('envState', 'DEV');
    const IdToken = await AsyncStorage.getItem('IdToken');
    const stayLoggedIn = await AsyncStorage.getItem('stayLoggedIn');
    const userData = await getProfileInfo(IdToken);

    if (IdToken && stayLoggedIn == 'true' && userData.name) {
      await MessagingService.registerDeviceForNotification(IdToken);
      navigation.replace('Home');
    }
  };

  const _loginAction = async () => {
    setLoginDetailsError(false);
    setNetworkError(false);
    setLoading(true);
    try {
      const loginResponse = await userSignIn(username, password);
      if (loginResponse?.data?.AuthenticationResult) {
        const IdToken = loginResponse.data.AuthenticationResult.IdToken;

        await MessagingService.registerDeviceForNotification(IdToken);
        await AsyncStorage.setItem('usernameRestore', username);
        // await AsyncStorage.setItem("passwordRestore", password)
        await AsyncStorage.setItem('IdToken', IdToken);

        if (checkBoxState) {
          await AsyncStorage.setItem('stayLoggedIn', 'true');
        }
        navigation.replace('Home');
      } else {
        setLoginDetailsError(true);
      }
    } catch (e) {
      if (e.message.toLowerCase() === 'network error') {
        setNetworkError(true);
      } else {
        setLoginDetailsError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={styles.container}>
          <SafeAreaView>
            <TouchableOpacity
              onPress={() => {
                setEnvUiExpand(!envUiExpand);
              }}
              style={styles.envWrapper}>
              <Image
                style={styles.carretDown}
                source={require('../../assets/caret-down.png')}
              />
              <Text
                style={{
                  marginTop: scale(5),
                  color: 'black',
                  marginLeft: scale(20),
                }}>
                {envState}
              </Text>
            </TouchableOpacity>
            {envUiExpand ? (
              <View style={styles.expandItems}>
                <TouchableOpacity
                  style={styles.expandButtons}
                  onPress={async () => {
                    setEnvState('DEV');
                    await AsyncStorage.setItem('envState', 'DEV');
                  }}>
                  <Text style={{color: 'black'}}>DEV</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.expandButtons}
                  onPress={async () => {
                    setEnvState('QA');
                    await AsyncStorage.setItem('envState', 'QA');
                  }}>
                  <Text style={{color: 'black'}}>QA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.expandButtons}
                  onPress={async () => {
                    setEnvState('PROD');
                    await AsyncStorage.setItem('envState', 'PROD');
                  }}>
                  <Text style={{color: 'black'}}>PROD</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.headerContainer}>
                <Text style={styles.welcomeText}>{t('welcome')}</Text>
                <Text style={styles.additionalText}>
                  {t('pleaseEnterYourAccountHere')}
                </Text>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputHeader}>{t('email')}</Text>
                <TextInput
                  onChangeText={onChangeUsername}
                  value={username}
                  placeholder={t('enterYourEmailAddress')}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  style={[
                    styles.textInput,
                    {
                      borderColor: loginDetailsError ? 'red' : '#9A9A9A',
                      marginBottom: scale(60),
                      textAlign: isRtl ? 'right' : 'left',
                    },
                  ]}
                />

                <Text style={styles.inputHeader}>{t('password')}</Text>
                <TextInput
                  onChangeText={onChangePassword}
                  value={password}
                  ref={passwordInputRef}
                  style={[
                    styles.textInput,
                    {
                      borderColor: loginDetailsError ? 'red' : '#9A9A9A',
                      textAlign: isRtl ? 'right' : 'left',
                    },
                  ]}
                  secureTextEntry={true}
                />

                <TouchableOpacity
                  onPress={() => {
                    setCheckBoxState(!checkBoxState);
                  }}
                  style={{flexDirection: 'row'}}>
                  <Checkbox checkBoxState={checkBoxState} />
                  <Text style={styles.checkboxText}>{t('rememberMe')}</Text>
                </TouchableOpacity>

                {loginDetailsError || networkError ? (
                  <Text style={styles.errorText}>
                    {loginDetailsError
                      ? t('wrongUserNameAndPassword')
                      : t('networkError')}
                  </Text>
                ) : null}
                <View>
                  <TouchableOpacity
                    disabled={loading}
                    style={styles.btn}
                    onPress={_loginAction}>
                    {loading && (
                      <ActivityIndicator size="large" color="skyblue" />
                    )}
                    <Text style={styles.btnText}>{t('logIn')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.versionText}>Version 1.5.20</Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  versionText: {
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  inputWrapper: {
    marginTop: scale(100),
    alignSelf: 'center',
    width: scale(603),
    height: scale(Dimensions.get('screen').height),
  },
  inputsHeader: {
    color: '#01AAD4',
    fontSize: scale(40),
    fontWeight: 'bold',
    marginBottom: scale(30),
  },
  headerContainer: {
    alignSelf: 'center',
    marginTop: scale(150),
  },
  welcomeText: {
    color: '#00A7D3',
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: scale(70),
    marginTop: scale(50),
  },
  additionalText: {
    alignSelf: 'center',
    fontSize: scale(30),
    marginTop: scale(10),
  },
  inputHeader: {
    fontSize: scale(35),
    marginBottom: scale(10),
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: scale(2),
    height: scale(100),
    fontSize: scale(25),
    paddingLeft: scale(30),
    marginBottom: scale(20),
    borderRadius: scale(10),
  },
  checkboxText: {
    fontSize: scale(35),
    marginTop: scale(-5),
    marginLeft: scale(20),
  },
  checkbox: {
    marginTop: scale(10),
    width: scale(20),
    height: scale(20),
  },
  btn: {
    width: '100%',
    height: scale(100),
    backgroundColor: '#00A7D3',
    borderRadius: scale(8),
    marginTop: scale(100),
  },
  btnText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: scale(35),
    fontWeight: 'bold',
    marginTop: scale(22),
  },
  errorText: {
    fontSize: scale(25),
    alignSelf: 'center',
    marginTop: scale(20),
    color: 'red',
  },
  envWrapper: {
    width: '100%',
    height: scale(80),
    flexDirection: 'row',
  },
  carretDown: {
    width: scale(30),
    height: scale(20),
    marginTop: scale(20),
    marginLeft: scale(35),
  },
  expandItems: {
    flexDirection: 'row',
  },
  expandButtons: {
    marginTop: scale(10),
    marginLeft: scale(20),
  },
});
