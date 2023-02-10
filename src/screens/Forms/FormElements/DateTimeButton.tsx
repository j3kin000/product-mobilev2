import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { scale } from '../../../common/common';
import moment from 'moment';
import { doAction, getGeo } from '../FormActions';
import { FormContext } from '../FormContext';

export const DateTimeButton = React.forwardRef((props: any, ref) => {
  const { handleElementField, availableActions, wholeTask } = props;

  const { label, key, inputType } = props.itemData;

  const [timeNow, setTimeNow] = useState('');
  const [picked, setPicked] = useState(false);

  const { setOpen, actionsQ, setActionsQ } = useContext(FormContext);

  useEffect(() => {
    if (props.defaultValue) {
      var momt = require('moment-timezone');
      const format = moment(props.defaultValue, [
        'YYYY/MM/DD HH:mm',
        'DD/MM/YYYY HH:mm',
        'MM/DD/YYYY HH:mm',
      ]);
      const res = moment(format).format('YYYY/MM/DD HH:mm');
      const setDefTime = momt.tz(res, 'Asia/Jerusalem').format('DD/MM/YYYY HH:mm');
      setTimeNow(setDefTime);
    }
  }, [props.defaultValue]);

  const supplyGeoToTask = async taskObject => {
    if (taskObject == null) return;

    const geo = await getGeo();

    const geoFields = taskObject.form.filter(item => item.inputType === 'geo');

    if (geoFields.length === 0) return;

    for (const field of geoFields) {
      const isStart = availableActions.includes('startTask');
      const isEnd = availableActions.includes('transmitDone');

      if (isStart) {
        field.value = [geo];
      } else if (isEnd) {
        const arrayHasValue = Array.isArray(field.value) && field.value.length;

        if (arrayHasValue) {
          field.value = [field.value[0], geo];
        } else {
          field.value = [null, geo];
        }
      }
    }
  };

  const pickTime = async () => {
    setPicked(true);

    if (wholeTask) {
      for (let actions in availableActions) {
        if (availableActions[actions] == 'reschedualTask') {
          setOpen(true);
          const res = date => {
            const callback = () => {
              return date;
            };
            doAction({ type: availableActions[actions], wholeTask, callback });
          };
          setActionsQ([...actionsQ, res]);
        } else doAction({ type: availableActions[actions], wholeTask });
      }
    }

    var momt = require('moment-timezone');
    const currentDate = moment();

    const geoActions = ['startTask', 'transmitDone'];
    const mustGetGeo = availableActions.some(action => geoActions.includes(action));

    if (mustGetGeo) {
      await supplyGeoToTask(wholeTask);
    }

    const setDefTime = momt.tz(currentDate, 'Asia/Jerusalem').format('DD/MM/YYYY HH:mm');
    setTimeNow(setDefTime);

    handleElementField(key, currentDate.toISOString());
    props.focusComponent();
  };

  return (
    <View style={styles.container} ref={ref}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ height: '100%', paddingTop: scale(20) }}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.btn} onPress={pickTime}>
            <Text style={styles.text}>{label}</Text>
            <Image style={styles.ico} source={require('../../../assets/wall-clock.png')} />
          </TouchableOpacity>
          {timeNow !== '' ? (
            <Text style={styles.timeText}>{timeNow}</Text>
          ) : picked ? (
            <Text style={styles.timeText}>{timeNow}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
});

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
