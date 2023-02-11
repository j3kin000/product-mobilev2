import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React, {useContext} from 'react';
import {scale} from '../../../common/common';
import {doAction} from '../FormActions';
import {FormContext} from '../FormContext';
import {uploadPhotoFromAmazon} from '../../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

export const AttachImage = React.forwardRef((props: any, ref) => {
  const {label, key} = props.itemData;

  const {handleElementField, availableActions, wholeTask, taskId} = props;

  const {setOpen, actionsQ, setActionsQ} = useContext(FormContext);

  const pickImage = async () => {
    const IdToken = await AsyncStorage.getItem('IdToken');

    ImagePicker.openPicker({
      multiple: true,
      filename: true,
      mediaType: 'photo',
    }).then(images => {
      for (let img in images) {
        let filename = images[img].path.replace(
          'file:///storage/emulated/0/Android/data/com.milgamproduct/cache/temp/',
          '',
        );
        uploadPhotoFromAmazon(IdToken, filename, images[img].path);
      }
      if (wholeTask) {
        for (let actions in availableActions) {
          if (availableActions[actions] == 'reschedualTask') {
            setOpen(true);
            const res = date => {
              const callback = () => {
                return date;
              };
              doAction({type: availableActions[actions], wholeTask, callback});
            };
            setActionsQ([...actionsQ, res]);
          } else {
            doAction({type: availableActions[actions], wholeTask});
          }
        }
      }
      handleElementField(key, images);
      props.focusComponent();
    });
  };

  return (
    <View style={styles.container} ref={ref}>
      <Text style={{color: 'black', marginBottom: scale(10)}}>
        {label ? label : null}
      </Text>
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Image
          style={styles.ico}
          source={require('../../../assets/attach-image.png')}
        />
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(60),
    flexDirection: 'row',
  },
  btn: {
    backgroundColor: 'white',
    borderColor: 'lightgray',
    borderWidth: scale(3),
    width: scale(350),
    height: scale(90),
    borderRadius: scale(15),
    marginTop: scale(10),
    flexDirection: 'row',
  },
  text: {
    color: 'black',
    marginTop: scale(18),
    marginLeft: scale(15),
  },
  ico: {
    width: scale(40),
    height: scale(40),
    marginTop: scale(20),
    marginLeft: scale(28),
  },
});
