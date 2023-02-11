import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {scale} from '../../../common/common';
import React, {useState, useContext, useEffect} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {doAction} from '../FormActions';
import {FormContext} from '../FormContext';
import moment from 'moment';

export const DateTime = React.forwardRef((props: any, ref) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [timeNow, setTimeNow] = useState(null);
  const [picked, setPicked] = useState(false);

  const {handleElementField, availableActions, wholeTask} = props;

  const {label, key} = props.itemData;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const {setOpen, actionsQ, setActionsQ} = useContext(FormContext);

  useEffect(() => {
    if (props.defaultValue) {
      var momt = require('moment-timezone');
      const format = moment(props.defaultValue, [
        'YYYY/MM/DD HH:mm',
        'DD/MM/YYYY HH:mm',
        'MM/DD/YYYY HH:mm',
      ]);
      const res = moment(format).format('YYYY/MM/DD HH:mm');
      const setDefTime = momt
        .tz(res, 'Asia/Jerusalem')
        .format('DD/MM/YYYY HH:mm');
      setTimeNow(setDefTime);
    }
  }, [props.defaultValue]);

  const handleConfirm = date => {
    props.focusComponent();
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
    var momt = require('moment-timezone');
    const currentDate = moment(date);

    const setDefTime = momt
      .tz(currentDate, 'Asia/Jerusalem')
      .format('DD/MM/YYYY HH:mm');
    setTimeNow(setDefTime);

    handleElementField(key, currentDate.toISOString());
    setPicked(true);
    hideDatePicker();
  };

  return (
    <View style={styles.container} ref={ref}>
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
          {timeNow !== '' ? (
            <Text style={styles.timeText}>
              <Text style={{color: 'black'}}>Picked </Text> {timeNow}
            </Text>
          ) : picked ? (
            <Text style={styles.timeText}>
              <Text style={{color: 'black'}}>Picked </Text> {timeNow}
            </Text>
          ) : null}
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
});

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
