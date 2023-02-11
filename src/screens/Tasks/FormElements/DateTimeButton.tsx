import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {scale} from '../../../common/common';
import moment from 'moment';

export const DateTimeButton = (props: any) => {
  const {
    handleElementField,
    setRequiredPass,
    requiredPass,
    requires,
    defaultValue,
  } = props;
  const {label, key} = props.itemData;

  const [timeNow, setTimeNow] = useState(new Date());
  const [picked, setPicked] = useState(false);

  const outputTime = moment(timeNow).format('DD/MM/YYYY HH:mm');

  useEffect(() => {
    setTimeNow(defaultValue);
    handleElementField(key, defaultValue);
    setRequiredPass(oldValue => {
      return {
        ...oldValue,
        [key]: true,
      };
    });
  }, [defaultValue]);

  const pickTime = () => {
    const timeNow = moment().format();
    setPicked(true);
    setTimeNow(timeNow);
    handleElementField(key, timeNow);
    if (!requires) {
      setRequiredPass({...requiredPass, [key]: true});
    } else {
      if (timeNow) {
        setRequiredPass({...requiredPass, [key]: true});
      } else {
        setRequiredPass({...requiredPass, [key]: false});
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <View style={{height: '100%', paddingTop: scale(20)}}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.btn} onPress={pickTime}>
            <Text style={styles.text}>{label}</Text>
            <Image
              style={styles.ico}
              source={require('../../../assets/wall-clock.png')}
            />
          </TouchableOpacity>
          {picked ? <Text style={styles.timeText}>{outputTime}</Text> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(70),
  },
  btn: {
    backgroundColor: 'white',
    width: scale(400),
    height: scale(80),
    borderRadius: scale(20),
    marginTop: scale(10),
    flexDirection: 'row',
    borderColor: 'lightgray',
    borderWidth: scale(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  text: {
    color: '#555555',
    alignSelf: 'center',
    marginLeft: scale(25),
  },
  timeText: {
    marginTop: scale(25),
    marginLeft: scale(5),
    color: 'black',
  },
  ico: {
    width: scale(30),
    height: scale(30),
    position: 'absolute',
    right: scale(40),
    top: scale(20),
  },
  label: {
    color: 'black',
    marginRight: scale(15),
    width: scale(150),
    maxWidth: scale(300),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
