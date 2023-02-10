import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { scale } from '../../../common/common';
import { doAction } from '../FormActions';
import { FormContext } from '../FormContext';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageFromAmazon } from '../../../api/index';

export const Markup = React.forwardRef((props: any, ref) => {
  const [getString, setString] = useState('');

  const { label, key } = props?.itemData;
  let { displayValue } = props?.itemData;
  const { taskId } = props;
  console.log(props.itemData);

  const { t } = useTranslation();

  const { handleElementField, availableActions, wholeTask, getUserGroup, values } = props;

  displayValue = displayValue ? displayValue : '';
  var getFromBetween = {
    results: [],
    string: '',
    getFromBetween: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
      var SP = this.string.indexOf(sub1) + sub1.length;
      var string1 = this.string.substr(0, SP);
      var string2 = this.string.substr(SP);
      var TP = string1.length + string2.indexOf(sub2);
      return this.string.substring(SP, TP);
    },
    removeFromBetween: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
      var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
      this.string = this.string.replace(removal, '');
    },
    getAllResults: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;
      var result = this.getFromBetween(sub1, sub2);
      this.results.push(result);
      this.removeFromBetween(sub1, sub2);
      if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
        this.getAllResults(sub1, sub2);
      } else return;
    },
    get: function (string, sub1, sub2) {
      this.results = [];
      this.string = string;
      this.getAllResults(sub1, sub2);
      return this.results;
    },
  };

  const result = getFromBetween.get(displayValue, '{{', '}}');

  const injectTime = (text: string, time?: string) => {
    const timeToPlace = time ?? moment(new Date()).format('DD/MM/YYYY HH:mm');
    return text.replace(/{{global:time}}/g, timeToPlace);
  };

  const injectGroupAttribute = ({
    text,
    groupData,
    attrKey,
    attrVal,
    taskGroup,
  }: {
    text: string;
    groupData: any[];
    attrKey: string;
    attrVal?: string;
    taskGroup: string;
  }) => {
    const expression = new RegExp(`{{global:group.${attrKey}}}`, 'g');

    if (attrVal != null) {
      return text.replace(expression, attrVal);
    }

    const cleanedText = text.replace(expression, '');

    const matchGroup = groupData.find(group => group.GroupName === taskGroup);

    if (matchGroup == null) return cleanedText;

    const matchAttribute = matchGroup.Attributes.find(attr => attr.key === attrKey);

    if (matchAttribute == null) return cleanedText;

    const valueToPlace = matchAttribute.value;

    const isValueImage = valueToPlace.toLowerCase().includes('data:image');

    if (isValueImage) return text.replace(expression, `<img src='${valueToPlace}'/>`);

    return text.replace(expression, valueToPlace);
  };

  const injectData = ({
    text,
    taskDetails,
    detailKey,
    detailValue,
  }: {
    text: string;
    taskDetails: any[];
    detailKey: string;
    detailValue?: string;
  }) => {
    const expression = new RegExp(`{{data:${detailKey}}}`, 'g');

    if (detailValue != null) return text.replace(expression, detailValue);

    const cleanedText = text.replace(expression, '');

    const matchDetail = taskDetails.find(item => item.key === detailKey);

    if (matchDetail == null) return cleanedText;

    const matchValue = matchDetail.value;

    if (matchValue == null) return cleanedText;

    if (Array.isArray(matchValue)) {
      const joined = matchValue.join(', ');
      return text.replace(expression, joined);
    }

    if (matchValue.value) return text.replace(expression, matchValue.value ?? '');

    return text.replace(expression, matchValue);
  };

  const injectField = async ({
    text,
    currentValues,
    fieldKey,
    fieldValue,
  }: {
    text: string;
    currentValues: Record<string, string | string[] | boolean | number>;
    fieldKey: string;
    fieldValue?: string;
  }) => {
    const expression = new RegExp(`{{field:${fieldKey}}}`, 'g');

    if (fieldValue != null) {
      return text.replace(expression, fieldValue);
    }

    const formValue = currentValues[fieldKey];

    const cleanedText = text.replace(expression, '');

    if (formValue == null) return cleanedText;

    const isValueBoolean = typeof formValue === 'boolean';
    const isValueNum = typeof formValue === 'number' || !Number.isNaN(Number(formValue));
    const isValueArray = Array.isArray(formValue);

    if (isValueBoolean) return text.replace(expression, t(formValue.toString()));

    const isCameraButton = formValue.toString().includes('rn_image_picker_lib_temp');
    if (isCameraButton) {
      const image = await imgState(formValue);
      const res = image.map(e => {
        return `<img src='${e}'style='border: 1px solid black; width: 50px; height: 100px' />`;
      });
      return text.replace(expression, res.join(''));
    }

    if (isValueArray) {
      const joined = formValue.join(', ');

      return text.replace(expression, joined);
    }

    if (isValueNum) {
      return text.replace(expression, formValue.toString());
    }

    const isSignature = formValue.includes('file://');

    if (isSignature) {
      const img = await getDefaultSignature(formValue);
      return text.replace(expression, `<img src='${img}' />`);
    }

    const valueAsDate = moment(
      formValue,
      [
        'DD-MM-YYYY',
        'MM-DD-YYYY',
        'x',
        'X',
        'YYYY-DD-MM',
        'YYYY-MM-DD',
        moment.ISO_8601,
        moment.HTML5_FMT.DATETIME_LOCAL,
        moment.HTML5_FMT.DATETIME_LOCAL_MS,
        moment.HTML5_FMT.DATETIME_LOCAL_SECONDS,
      ],
      true
    );

    if (valueAsDate.isValid()) return text.replace(expression, valueAsDate.format('DD/MM/YYYY'));

    return text.replace(expression, formValue);
  };

  const injectTaskProps = ({
    text,
    taskData,
    key,
    value,
  }: {
    text: string;
    taskData: any;
    key: string;
    value?: string;
  }) => {
    const expression = new RegExp(`{{task:${key}}}`, 'g');

    if (value != null) return text.replace(expression, value);

    console.log('key', key);
    const taskValue = _.get(taskData, key);

    return text.replace(expression, taskValue ?? '');
  };

  const setData = async () => {
    let resultString = displayValue;

    for (const template of result) {
      const [type, fieldKey] = template.split(':');

      const toAddTime = type === 'global' && fieldKey === 'time';
      const toAddData = type === 'data';
      const toAddField = type === 'field';
      const toAddGroup = type === 'global' && fieldKey.startsWith('group.');
      const toAddTaskProps = type === 'task';

      if (toAddTime) {
        resultString = injectTime(resultString);
      } else if (toAddData) {
        resultString = injectData({
          text: resultString,
          taskDetails: wholeTask.taskDetails,
          detailKey: fieldKey,
        });
      } else if (toAddGroup) {
        const cleanedKey = fieldKey.split('group.')[1];

        resultString = injectGroupAttribute({
          text: resultString,
          groupData: getUserGroup,
          attrKey: cleanedKey,
          taskGroup: wholeTask.groupName,
        });
      } else if (toAddField) {
        resultString = await injectField({
          text: resultString,
          currentValues: values,
          fieldKey,
        });
      } else if (toAddTaskProps) {
        resultString = injectTaskProps({ text: resultString, taskData: wholeTask, key: fieldKey });
      } else {
        const expression = new RegExp(`{{${template}}}`, 'g');
        resultString = resultString.replace(expression, '');
      }
    }
    setString(resultString);
  };

  const getBlob = async fileUri => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };

  const imgState = val => {
    return new Promise<any[]>(async (resolve, reject) => {
      let picAmazon: string[] = [];
      const IdToken = await AsyncStorage.getItem('IdToken');
      if (Array.isArray(val)) {
        const test = val.map(async item => {
          const res = await getImageFromAmazon(IdToken, taskId, item);
          const getPresignedUrl = JSON.parse(res);
          picAmazon.push(getPresignedUrl.presignedUrl);
        });
        await Promise.all(test);
        resolve(picAmazon);
        return picAmazon.length > 0 ? picAmazon : 'none';
      } else {
        await getImageFromAmazon(IdToken, taskId, val).then(res => {
          const getPresignedUrl = JSON.parse(res);
          picAmazon.push(getPresignedUrl.presignedUrl);
        });
        resolve(picAmazon);
      }
    });
  };

  const getDefaultSignature = val => {
    return new Promise(async (resolve, reject) => {
      const imageBody = await getBlob(val);
      const fileReaderInstance = new FileReader();
      fileReaderInstance.readAsDataURL(imageBody);

      fileReaderInstance.onload = () => {
        resolve(fileReaderInstance.result);
      };
    });
  };

  useEffect(() => {
    setData();
  }, [values]);

  const source = {
    html: getString,
  };

  return (
    <View style={styles.container} ref={ref}>
      <RenderHtml source={source} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(30),
  },
  btn: {
    backgroundColor: '#3ABEE0',
    width: scale(260),
    height: scale(80),
    borderRadius: scale(15),
    marginTop: scale(10),
    flexDirection: 'row',
  },
  text: {
    color: 'white',
    marginTop: scale(15),
    marginLeft: scale(30),
  },
  ico: {
    width: scale(40),
    height: scale(35),
    marginTop: scale(18),
    marginLeft: scale(40),
  },
});
