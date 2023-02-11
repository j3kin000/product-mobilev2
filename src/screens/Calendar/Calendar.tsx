import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {BottomMenu} from '../../components/BottomMenu';
// import {Sign} from '../Forms/FormElements/Sign'
export const Calendar = () => {
  return (
    <View style={styles.container}>
      <Text style={{alignSelf: 'center'}}>Calendar page. Will be updated.</Text>
      <BottomMenu fromWhere={'calendar'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
