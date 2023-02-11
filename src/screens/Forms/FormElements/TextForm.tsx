import {StyleSheet, Text, View, I18nManager, TextInput} from 'react-native';
import React, {useState, useEffect} from 'react';
import {scale} from '../../../common/common';

export const TextForm = React.forwardRef((props: any, ref) => {
  const [changeText, setChangeText] = useState('');
  const {label, defaultValue, key} = props.itemData;
  const {handleElementField, regex} = props;
  const [match, setMatch] = useState(true);
  const [requiredError, setRequiredError] = useState(false);
  const isRtl = I18nManager.isRTL;

  useEffect(() => {
    setChangeText(props.defaultValue);
  }, [props.defaultValue]);

  return (
    <View style={styles.container}>
      <Text style={isRtl ? styles.labelRtl : styles.label}>
        {label ? label : null}
      </Text>

      <TextInput
        ref={ref}
        multiline={true}
        style={[
          styles.input,
          {borderColor: match && !requiredError ? 'lightgray' : 'red'},
        ]}
        value={changeText}
        onChangeText={setChangeText}
        onBlur={() => {
          if (changeText.length == 0) {
            setRequiredError(true);
          } else {
            setRequiredError(false);
          }
          if (regex) {
            if (changeText.match(regex)) {
              handleElementField(key, changeText);
              setMatch(true);
            } else {
              setMatch(false);
            }
          } else {
            handleElementField(key, changeText);
          }

          props.focusComponent();
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(30),
  },
  input: {
    paddingBottom: scale(10),
    paddingLeft: scale(20),
    width: '90%',
    height: scale(320),
    backgroundColor: 'white',
    textAlignVertical: 'top',
    borderRadius: scale(8),
    borderColor: 'lightgray',
    borderWidth: scale(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 3,
  },
  label: {
    color: 'black',
    marginBottom: scale(10),
    textAlign: 'left',
  },
  labelRtl: {
    color: 'black',
    marginBottom: scale(10),
    textAlign: 'left',
  },
});
