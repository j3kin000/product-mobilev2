import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {scale} from '../../../common/common';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {uploadPhotoFromAmazon} from '../../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {getImageFromAmazon} from '../../../api/index';

export const TakePictureButton = React.forwardRef((props: any, ref) => {
  const {t, i18n} = useTranslation();

  const {label, key} = props.itemData;

  const {handleElementField, taskId, defaultValue, wholeTask} = props;

  const [localGallery, setLocalGallery] = useState([]);
  const [localPushGallery, setLocalPushGallery] = useState([]);

  const imgState = async path => {
    let smth2 = localPushGallery.slice();
    if (
      defaultValue !== undefined &&
      defaultValue.length > 0 &&
      path === null
    ) {
      if (localPushGallery.length === 0) {
        let picAmazon = localPushGallery.slice();
        const IdToken = await AsyncStorage.getItem('IdToken');
        if (Array.isArray(defaultValue)) {
          defaultValue.map(async item => {
            await getImageFromAmazon(IdToken, taskId, item).then(res => {
              const getPresignedUrl = JSON.parse(res);
              picAmazon.push(getPresignedUrl.presignedUrl);
            });
          });
        } else {
          await getImageFromAmazon(IdToken, taskId, defaultValue).then(res => {
            const getPresignedUrl = JSON.parse(res);
            picAmazon.push(getPresignedUrl.presignedUrl);
          });
        }
        setLocalPushGallery(picAmazon);
      } else if (localPushGallery.length > 0) {
        let picAmazon2 = localPushGallery.slice();
        defaultValue.map(async item => {
          const IdToken = await AsyncStorage.getItem('IdToken');
          await getImageFromAmazon(IdToken, taskId, item).then(res => {
            const getPresignedUrl = JSON.parse(res);
            picAmazon2.push(getPresignedUrl.presignedUrl);
          });
        });
        setLocalPushGallery(picAmazon2);
        // defaultValue.forEach(element => {
        //     if(localPushGallery.indexOf(element) < 0)
        //     {
        //         smth2.push(element)
        //         setLocalPushGallery(smth2)
        //     }
        // })
      }
    }
    if (path !== null) {
      smth2.push(path);
      setLocalPushGallery(smth2);
    }
  };

  useEffect(() => {
    imgState(null);
  }, [defaultValue]);

  const openCamera = async () => {
    const IdToken = await AsyncStorage.getItem('IdToken');

    const image = launchCamera(
      {
        title: 'Select Image',
        customButtons: [
          {
            name: 'customOptionKey',
            title: 'Choose file from Custom Option',
          },
        ],
        includeBase64: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
          didCancel: true,
        },
      },
      res => {
        if (!res.didCancel) {
          let name = res.assets[0].fileName;
          let path = res.assets[0].uri;
          let base64 = res.assets[0].base64;
          let smth = localGallery.slice();
          let smth2 = localPushGallery.slice();

          smth.push({
            name: name,
            base64: base64,
          });
          console.log('key', key);
          console.log('name', path);
          handleElementField(key, name);
          smth2.push(name);
          imgState(path);

          setLocalGallery(smth);
          uploadPhotoFromAmazon(IdToken, `${taskId}/` + name, path);
        }
      },
    );
  };

  const openGallery = async () => {
    const IdToken = await AsyncStorage.getItem('IdToken');

    const image = launchImageLibrary(
      {
        title: 'Select Image',
        customButtons: [
          {
            name: 'customOptionKey',
            title: 'Choose file from Custom Option',
          },
        ],
        includeBase64: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
          didCancel: true,
        },
      },
      res => {
        if (!res.didCancel) {
          let name = res.assets[0].fileName;
          let path = res.assets[0].uri;
          let base64 = res.assets[0].base64;
          let smth = localGallery.slice();
          let smth2 = localPushGallery.slice();

          smth.push({
            name: name,
            base64: base64,
          });

          handleElementField(key, name);
          smth2.push(name);
          imgState(path);

          setLocalGallery(smth);
          uploadPhotoFromAmazon(IdToken, `${taskId}/` + name, path);
        }
      },
    );
  };

  const showConfirmDialog = img => {
    return Alert.alert(
      t('areYouSure'),
      t('areYouSureYouWantToRemoveThisPhoto'),
      [
        {
          text: 'Yes',
          onPress: () => {
            deleteItem(img);
          },
        },
        {
          text: 'No',
        },
      ],
    );
  };
  const deleteItem = name => {
    if (name != null) {
      let itemToDelete = localGallery.filter(item => {
        return item.name != name;
      });
      setLocalGallery(itemToDelete);
      let itemPushToDelete = localPushGallery.filter(item => {
        return item != name;
      });
      let getDefItem;
      defaultValue.map(item => {
        if (name.includes(item)) {
          getDefItem = item;
        }
      });
      let itemDefaultValToDelete = defaultValue.filter(item => {
        return item != getDefItem;
      });
      setLocalPushGallery(itemPushToDelete);
      handleElementField(key, itemDefaultValToDelete);
      props.focusComponent();
    }
  };
  useEffect(() => {
    deleteItem(null);
  }, [defaultValue]);
  const [opened, setOpened] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          setOpened(!opened);
        }}>
        <Image
          style={styles.ico}
          source={require('../../../assets/camera-ico.png')}
        />
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
      {opened ? (
        <View>
          <TouchableOpacity
            style={styles.takePhotoWrapper}
            onPress={() => {
              openCamera();
              setOpened(false);
            }}>
            <Text style={styles.pickerText}>{t('takePhoto')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.openGalleryWrapper}
            onPress={() => {
              openGallery();
              setOpened(false);
            }}>
            <Text style={styles.pickerText}>{t('openGallery')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {localPushGallery.length > 0 ? (
        <ScrollView
          horizontal={true}
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}>
          {localPushGallery.map(item => {
            //let imageUri = 'data:image/png;base64,' + item.base64
            return (
              <TouchableOpacity
                style={styles.minifyImageCell}
                onPress={() => {
                  showConfirmDialog(item);
                }}>
                <Image
                  style={styles.cross}
                  source={require('../../../assets/remove.png')}
                />
                <Image style={styles.photoMinify} source={{uri: item}} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(20),
  },
  takePhotoWrapper: {
    marginTop: scale(40),
    marginBottom: scale(20),
    width: scale(350),
    height: scale(80),
    backgroundColor: '#E6E6E3',
    borderRadius: scale(20),
    paddingTop: scale(15),
    paddingLeft: scale(20),
  },
  openGalleryWrapper: {
    width: scale(350),
    height: scale(80),
    backgroundColor: '#E6E6E3',
    borderRadius: scale(20),
    paddingTop: scale(15),
    paddingLeft: scale(20),
  },
  pickerText: {
    // textDecorationLine: 'underline',
    color: 'black',
  },
  btn: {
    backgroundColor: '#3ABEE0',
    width: scale(350),
    height: 'auto',
    borderRadius: scale(15),
    marginTop: scale(10),
    flexDirection: 'row',
  },
  text: {
    color: 'white',
    marginTop: scale(15),
    marginLeft: scale(15),
    width: '80%',
    marginBottom: scale(15),
  },
  ico: {
    width: scale(40),
    height: scale(35),
    marginTop: scale(18),
    marginLeft: scale(28),
  },
  scrollView: {
    marginTop: scale(30),
    width: scale(580),
    height: scale(180),
  },
  photoMinify: {
    marginTop: scale(20),
    height: '80%',
    width: scale(130),
    marginRight: scale(30),
  },
  cross: {
    width: scale(50),
    height: scale(50),
    position: 'absolute',
    zIndex: 999,
    right: scale(10),
    // top: scale(-10)
  },
  minifyImageCell: {},
});
