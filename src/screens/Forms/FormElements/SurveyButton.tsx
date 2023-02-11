import {
  StyleSheet,
  Text,
  View,
  Image,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useContext, useEffect, useMemo} from 'react';
import {scale} from '../../../common/common';
import {doAction} from '../FormActions';
import {FormContext} from '../FormContext';

export const SurveyButton = React.forwardRef((props: any, ref) => {
  const {handleElementField, availableActions, wholeTask} = props;

  const {label, key} = props.itemData;

  const {setOpen, actionsQ, setActionsQ} = useContext(FormContext);

  const isRtl = I18nManager.isRTL;

  const [radioState, setRadioState] = useState(null);

  let options = [];

  for (let option in props.itemData.options) {
    let text = props.itemData.options[option];
    options.push({option, text});
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
            doAction({type: availableActions[actions], wholeTask, callback});
          };
          setActionsQ([...actionsQ, res]);
        } else {
          doAction({type: availableActions[actions], wholeTask});
        }
      }
      props.focusComponent();
    }
  };

  const shownSurvey = useMemo(() => {
    let survey: any = [];
    const steps = props.itemData.options.stepsNumber || 10;
    for (let i = 1; i <= steps; i++) {
      const res = (
        <>
          {i == 1 && (
            <Text style={styles.preWord}>
              {props.itemData.options.preWord
                ? props.itemData.options.preWord
                : 'very bad'}
            </Text>
          )}
          <View style={styles.column} key={i}>
            <Text style={isRtl ? styles.textRtl : styles.text}>{i}</Text>

            <TouchableOpacity
              style={[styles.radioWrapper, {}]}
              onPress={() => {
                setRadioState(i.toString());
                handleElementField(key, i.toString(), true);
                setIndex();
              }}>
              {radioState == i.toString() ? (
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
            </TouchableOpacity>
          </View>
          {i == steps && (
            <Text style={styles.postWord}>
              {props.itemData.options.postWord
                ? props.itemData.options.postWord
                : 'excellent'}
            </Text>
          )}
        </>
      );
      survey.push(res);
    }

    return survey;
  }, [props.itemData, radioState, handleElementField]);

  return (
    <View style={styles.container} ref={ref}>
      <Text style={isRtl ? styles.labelRtl : styles.label}>
        {label ? label : null}
      </Text>
      <View style={styles.row}>{shownSurvey}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
    marginBottom: scale(20),
  },
  label: {
    color: 'black',
    marginTop: scale(20),
    marginBottom: scale(20),
    marginRight: scale(15),
    textAlign: 'left',
  },
  labelRtl: {
    color: 'black',
    marginTop: scale(20),
    marginBottom: scale(20),
    marginRight: scale(15),
    textAlign: 'left',
  },
  radioWrapper: {
    width: '100%',

    // height: scale(90),
    marginBottom: scale(30),
    marginTop: scale(10),
  },
  image: {
    width: scale(50),
    height: scale(50),
    alignSelf: 'center',
  },
  text: {
    fontWeight: 'bold',
    marginBottom: scale(15),
    marginTop: scale(20),
    textAlign: 'center',
    width: '100%',
  },
  textRtl: {
    fontWeight: 'bold',
    marginTop: scale(20),
    marginBottom: scale(15),
    alignSelf: 'center',
    textAlign: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  column: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    width: scale(65),
    alignItems: 'center',
    justifyItems: 'center',
  },
  preWord: {
    fontWeight: 'bold',
    marginTop: scale(95),
    marginRight: scale(20),
  },
  postWord: {
    fontWeight: 'bold',
    marginTop: scale(95),
    marginLeft: scale(20),
  },
});
