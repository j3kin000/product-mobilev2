import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {scale} from '../../../common/common';
import Signature from 'react-native-signature-canvas';
import RNFS from 'react-native-fs';
import {uploadPhotoFromAmazon} from '../../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PrivateValueStore, useFocusEffect} from '@react-navigation/native';

export const Sign = React.forwardRef((props: any, ref) => {
  const {key} = props?.itemData;
  const {handleElementField, setListScrolling} = props;
  const {taskId} = props.wholeTask;
  const [setFilePath] = useState('');
  const [focus, setFocus] = useState(false);
  const [signBody, setSignBody] = useState();
  useFocusEffect(
    React.useCallback(() => {
      setFocus(true);
      return () => {
        setFocus(false);
      };
    }, []),
  );

  useEffect(() => {
    if (props.values) {
      if (props.values[key]) {
        getDefaultSignature(props.values[key]);
      }
    }
  }, [props.values]);

  const getDefaultSignature = async val => {
    const imageBody = await getBlob(val);
    const fileReaderInstance = new FileReader();
    fileReaderInstance.readAsDataURL(imageBody);
    fileReaderInstance.onload = () => {
      const base64data = fileReaderInstance.result;
      setSignBody(base64data);
    };
  };

  const handleOK = async signature => {
    const IdToken = await AsyncStorage.getItem('IdToken');
    var Base64Code = signature.split('data:image/png;base64,');
    const imagePath = `${RNFS.TemporaryDirectoryPath}/image${taskId}-${key}.png`;
    RNFS.writeFile(imagePath, Base64Code[1], 'base64').then(() => {
      // setFilePath(imagePath);
    });
    uploadPhotoFromAmazon(
      IdToken,
      taskId + '/image.png',
      'file://' + imagePath,
    );
    handleElementField(key, 'file://' + imagePath);
    setListScrolling(true);
  };

  const handleClear = () => {
    console.log('signature cleared');
    //setSign(null)
  };

  const onBegin = () => {
    setListScrolling(false);
  };
  const handleEnd = () => {
    setListScrolling(true);
  };

  const getBlob = async fileUri => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };

  const style = `.m-signature-pad--footer 
    .button {
      background-color: #00A7D3;
      color: #FFF;
      margin-top: 10px;
      opacity: 0.99;
    }
    .m-signature-pad {
        position: absolute;
        font-size: 10px;
        width: 300px;
        height: 150px;
        border-color: red;
        opacity: 0.99;
        border: 1px solid #e8e8e8;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.08) inset;
      }
      body, html {
        width: ${300}px; 
        height: ${210}px;
        padding-top: 5px;
        padding-left: 5px;
        opacity: 0.99;
    }
    `;

  return (
    <>
      <View style={{marginBottom: scale(50), opacity: 0.99}} ref={ref}>
        <Text style={{fontWeight: 'bold', marginBottom: scale(10)}} />
        <View style={{width: 320, height: 210}}>
          <Signature
            androidHardwareAccelerationDisabled={true}
            onOK={handleOK}
            onBegin={onBegin}
            onClear={handleClear}
            onEnd={handleEnd}
            renderToHardwareTextureAndroid={true}
            descriptionText=""
            clearText="Clear"
            confirmText="Save"
            webStyle={style}
            imageType={'image/png'}
          />
        </View>
      </View>
      {signBody ? (
        <>
          <View>
            <Text>Current Signature</Text>
            <Image source={{uri: signBody}} style={{width: 320, height: 150}} />
          </View>
        </>
      ) : (
        <></>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    preview: {
      width: 335,
      height: 114,
      backgroundColor: '#F8F8F8',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
    },
    previewText: {
      color: '#FFF',
      fontSize: 14,
      height: 40,
      lineHeight: 40,
      paddingLeft: 10,
      paddingRight: 10,
      backgroundColor: '#69B2FF',
      width: 120,
      textAlign: 'center',
      marginTop: 10,
    },
  },
  btn: {
    backgroundColor: '#01AAD4',
    width: scale(200),
    height: scale(60),
    borderRadius: scale(8),
    marginTop: scale(10),
  },
  text: {
    color: 'white',
    alignSelf: 'center',
    marginTop: scale(10),
  },
});
