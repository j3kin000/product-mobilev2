import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {scale} from '../../../common/common';
import React, {useState, useContext, useEffect} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export const DatePicker = (props: any) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateNow, setDateNow] = useState(null);
  const [picked, setPicked] = useState(false);

  const {
    handleElementField,
    requires,
    setRequiredPass,
    requiredPass,
    defaultValue,
  } = props;

  const {label, key} = props.itemData;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  useEffect(() => {
    setDateNow(defaultValue);
    handleElementField(key, defaultValue);
    setRequiredPass(oldValue => {
      return {
        ...oldValue,
        [key]: true,
      };
    });
  }, [defaultValue]);

  const handleConfirm = date => {
    handleElementField(key, date);
    props.focusComponent();
    setDateNow(date.toLocaleDateString());
    if (!requires) {
      setRequiredPass({...requiredPass, [key]: true});
    } else {
      if (date) {
        setRequiredPass({...requiredPass, [key]: true});
      } else {
        setRequiredPass({...requiredPass, [key]: false});
      }
    }
    setPicked(true);
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <View style={{height: '100%', paddingTop: scale(20)}}>
          <Text style={styles.label}>{props?.itemData.label || ''}</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.btn} onPress={showDatePicker}>
            <Text style={styles.text}>{label}</Text>
            <Image
              style={styles.ico}
              source={require('../../../assets/calendar-forms.png')}
            />
          </TouchableOpacity>
          {picked ? (
            <Text style={styles.timeText}>
              <Text style={{color: 'black'}}>Picked </Text> {dateNow}
            </Text>
          ) : null}
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(30),
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
    // marginTop: scale(20),
    marginRight: scale(15),
    width: scale(250),
    maxWidth: scale(300),
  },
});
