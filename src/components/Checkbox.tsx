import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useState} from 'react';
import {scale} from '../common/common';

export const Checkbox = (props: any) => {
  const {checkBoxState} = props;
  return (
    <View style={styles.container}>
      {checkBoxState ? (
        <Image
          style={styles.checked}
          source={require('../assets/checkbox-checked.png')}
        />
      ) : (
        <Image
          style={styles.notChecked}
          source={require('../assets/checkbox.png')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  checked: {
    width: scale(50),
    height: scale(50),
  },
  notChecked: {
    width: scale(40),
    height: scale(40),
  },
});
