import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import {scale} from '../../../common/common';
import {doAction} from '../FormActions';
import {FormContext} from '../FormContext';
import moment from 'moment';

export const MarkupDone = React.forwardRef((props: any, ref) => {
  // const customData = require('./test.json');

  let {label, value, key, displayValue, defaultValue} = props.itemData;

  const {wholeTask, getUserGroup} = props;

  const [getGlobalTime, setGlobalTime] = useState(new Date());
  const [getString, setString] = useState('');
  const [logo, setLogo] = useState(false);

  displayValue = displayValue ? displayValue : '';

  var getFromBetween = {
    results: [],
    string: '',
    getFromBetween: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) {
        return false;
      }
      var SP = this.string.indexOf(sub1) + sub1.length;
      var string1 = this.string.substr(0, SP);
      var string2 = this.string.substr(SP);
      var TP = string1.length + string2.indexOf(sub2);
      return this.string.substring(SP, TP);
    },
    removeFromBetween: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) {
        return false;
      }
      var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
      this.string = this.string.replace(removal, '');
    },
    getAllResults: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) {
        return;
      }
      var result = this.getFromBetween(sub1, sub2);
      this.results.push(result);
      this.removeFromBetween(sub1, sub2);
      if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
        this.getAllResults(sub1, sub2);
      } else {
        return;
      }
    },
    get: function (string, sub1, sub2) {
      this.results = [];
      this.string = string;
      this.getAllResults(sub1, sub2);
      return this.results;
    },
  };
  var result = getFromBetween.get(displayValue, '{{', '}}');
  let newString = displayValue;

  const setData = () => {
    result.forEach(element => {
      if (element.includes('global:time')) {
        const outputTime = moment(getGlobalTime).format('DD/MM/YYYY HH:MM');
        newString = newString.replace('{{' + element + '}}', outputTime);
      } else if (element.includes('task:')) {
        const getKey = element.split(':');
        const setKey = getKey[1];
        if (setKey.includes('.')) {
          const dotKey = setKey.split('.');
          let newWholeTask = wholeTask;
          dotKey.forEach(dot => {
            newWholeTask = newWholeTask[dot];
          });
          newString = newString.replace('{{' + element + '}}', newWholeTask);
        } else {
          if (setKey == 'createdAt') {
            const createdAt = moment(wholeTask[setKey]).format(
              'DD/MM/YYYY HH:MM',
            );
            newString = newString.replace('{{' + element + '}}', createdAt);
          } else if (setKey == 'executionEndDate') {
            const executionEndDate = moment(wholeTask[setKey]).format(
              'DD/MM/YYYY HH:MM',
            );
            newString = newString.replace(
              '{{' + element + '}}',
              executionEndDate,
            );
          } else if (setKey == 'executionStartDate') {
            const executionStartDate = moment(wholeTask[setKey]).format(
              'DD/MM/YYYY HH:MM',
            );
            newString = newString.replace(
              '{{' + element + '}}',
              executionStartDate,
            );
          } else {
            newString = newString.replace(
              '{{' + element + '}}',
              wholeTask[setKey],
            );
          }
        }
      } else if (element.includes('global:group')) {
        const getKey = element.split('.');
        Array.isArray(getUserGroup)
          ? getUserGroup.map(item => {
              if (item.GroupName == wholeTask.groupName) {
                item.Attributes.map(key => {
                  if (key.key == getKey[1]) {
                    if (key.value.toLowerCase().includes('data:image')) {
                      setLogo(true);
                    } else {
                      newString = newString.replace(
                        '{{' + element + '}}',
                        '' + key.value + '',
                      );
                    }
                  }
                });
              }
            })
          : null;
      } else if (element.includes('data:')) {
        const getKey = element.split(':');
        const setKey = getKey[1];
        wholeTask.taskDetails.forEach(ele => {
          if (ele.key == setKey) {
            if (ele.value !== null || ele.value !== undefined) {
              Array.isArray(ele.value)
                ? (newString = newString.replace(
                    '{{' + element + '}}',
                    ele.value[0],
                  ))
                : (newString = newString.replace(
                    '{{' + element + '}}',
                    ele.value,
                  ));
            }
          }
        });
        if (newString.includes('{{' + element + '}}')) {
          newString = newString.replace('{{' + element + '}}', '');
        }
      } else if (element.includes('field:')) {
        const getKey = element.split(':');
        const setKey = getKey[1];

        if (defaultValue !== '' || defaultValue !== undefined) {
          Object.entries(defaultValue).map(([key, val]) => {
            Array.isArray(val)
              ? (newString = newString.replace('{{' + element + '}}', val[0]))
              : key == setKey
              ? (newString = newString.replace('{{' + element + '}}', val))
              : null;
          });
        }
      }
    });
    setString(newString);
  };

  useEffect(() => {
    setData();
  });

  var imageResult = getFromBetween.get(getString, '{{', '}}');
  let newImageString = getString;
  const convertImage = string => {
    let res = '';
    const getKey = string.split('.');
    Array.isArray(getUserGroup)
      ? getUserGroup.map(item => {
          if (item.GroupName == wholeTask.groupName) {
            item.Attributes.map(key => {
              if (key.key == getKey[1]) {
                res = key.value;
              }
            });
          }
        })
      : null;
    return res;
  };

  return (
    <View style={styles.container} ref={ref}>
      <Text style={{color: 'black'}}>{label}</Text>
      <View>
        {displayValue != '' ? (
          logo ? (
            imageResult.map(element => {
              const splitString = newImageString.split('{{' + element + '}}');
              newImageString = splitString[1];
              const getLastString = splitString[1].includes('{{')
                ? ''
                : splitString[1];
              let convertImg = convertImage(element);
              return (
                <View>
                  <Text>{splitString[0]}</Text>
                  <Image
                    style={styles.photoMinify}
                    source={{uri: convertImg}}
                  />
                  <Text>{getLastString}</Text>
                </View>
              );
            })
          ) : (
            <Text>{getString}</Text>
          )
        ) : defaultValue != null || defaultValue != undefined ? (
          <Text>{defaultValue}</Text>
        ) : value != null || value != undefined ? (
          <Text>{value}</Text>
        ) : (
          <Text />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(30),
    maxWidth: scale(600),
  },
  photoMinify: {
    marginTop: scale(20),
    marginBottom: scale(20),
    height: 100,
    width: 100,
    marginRight: scale(30),
    flexWrap: 'wrap',
  },
});
