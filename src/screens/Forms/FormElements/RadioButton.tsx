import {
  StyleSheet,
  Text,
  View,
  Image,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { scale } from '../../../common/common';
import { doAction } from '../FormActions';
import { FormContext } from '../FormContext';

export const RadioButton = React.forwardRef((props: any, ref) => {
  const { handleElementField, availableActions, wholeTask } = props;

  const { label, key } = props.itemData;

  const { setOpen, actionsQ, setActionsQ } = useContext(FormContext);

  const isRtl = I18nManager.isRTL;

  const [radioState, setRadioState] = useState(null);

  let options = [];

  for (let option in props.itemData.options) {
    let text = props.itemData.options[option];
    options.push({ option, text });
  }

  useEffect(() => {
    setRadioState(props.defaultValue);
  }, [props.defaultValue]);

  const setIndex = () => {
    if (radioState && wholeTask) {
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
      props.focusComponent();
    }
  };

  return (
    <View style={styles.container} ref={ref}>
      <Text style={isRtl ? styles.labelRtl : styles.label}>
        {label ? label : null}
      </Text>
      <View>
        {options?.map((item, index) => {
          return (
            <TouchableOpacity
              style={[styles.radioWrapper, {}]}
              onPress={() => {
                setRadioState(item.option);
                handleElementField(key, item.option, true);
                setIndex();
              }}
            >
              {radioState == item.option ? (
                <Image
                  style={styles.image}
                  source={require('../../../assets/radio-button-checked.png')}
                />
              ) : (
                <Image
                  style={styles.image}
                  source={require('../../../assets/radio-button.png')}
                />
              )}
              <Text style={isRtl ? styles.textRtl : styles.text}>
                {item.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(30),
    width: scale(600),
    justifyContent: 'space-between',
  },
  label: {
    color: 'black',
    marginTop: scale(20),
    marginRight: scale(15),
  },
  labelRtl: {
    color: 'black',
    marginTop: scale(20),
    marginRight: scale(15),
    textAlign: 'left',
  },
  radioWrapper: {
    width: scale(400),
    // height: scale(90),
    marginBottom: scale(30),
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: scale(50),
    height: scale(50),
    alignSelf: 'center',
  },
  text: {
    flex: 1,
    alignSelf: 'center',
    fontWeight: 'bold',
    marginLeft: scale(20),
    width: '100%',
    flexGrow: 1,
  },
  textRtl: {
    flex: 1,
    fontWeight: 'bold',
    marginLeft: scale(50),
    marginTop: scale(20),
    flexGrow: 1,
  },
});
