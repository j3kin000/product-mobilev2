import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import {scale} from '../../../common/common';

export const Checkbox = React.forwardRef((props: any, ref) => {
  const [checkBoxState, setChecBoxState] = useState(false);

  const {label, key, value, options} = props.itemData;

  const {handleElementField} = props;

  const [checkedElements, setCheckedElements] = useState([]);

  let checkboxesList = [];

  for (let opt in options) {
    checkboxesList.push({key: opt, value: options[opt]});
  }

  const handleCheck = item => {
    let newCheck = checkedElements.slice();
    let temp;
    if (newCheck.includes(item.key)) {
      temp = newCheck.filter(check => {
        return check != item.key;
      });
    } else {
      temp = [...newCheck, item.key];
    }
    setCheckedElements(temp);
    handleElementField(key, temp);
  };

  useEffect(() => {
    setCheckedElements(props.defaultValue);
  }, [props.defaultValue]);

  return (
    <View style={styles.container} ref={ref}>
      <Text style={styles.label}>{label}</Text>
      {checkboxesList.map((item, index) => {
        return (
          <TouchableOpacity
            style={styles.checkboxWrapper}
            onPress={() => {
              handleCheck(item);
            }}>
            {checkedElements?.includes(item.key) ? (
              <Image
                style={styles.checkboxChecked}
                source={require('../../../assets/checkbox-checked.png')}
              />
            ) : (
              <Image
                style={styles.checkbox}
                source={require('../../../assets/checkbox.png')}
              />
            )}
            <Text style={styles.checkboxText}>{item.value}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(60),
  },
  label: {
    fontWeight: 'bold',
    marginTop: scale(5),
  },
  checkboxWrapper: {
    width: scale(700),
    // height: scale(70),
    marginLeft: scale(15),
    marginTop: scale(15),
    marginBottom: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: scale(70),
    height: scale(70),
  },
  checkboxChecked: {
    width: scale(60),
    height: scale(60),
    marginLeft: scale(5),
  },
  checkboxText: {
    flex: 1,
    marginLeft: scale(30),
    flexGrow: 1,
  },
});
