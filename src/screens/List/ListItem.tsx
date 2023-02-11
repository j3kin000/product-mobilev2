import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import React, {useMemo, useContext} from 'react';
import {scale} from '../../common/common';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LibContext} from '../../common/context/lib';

// check what the table headers are
// check how the table headers are displayed one by one in list item

export const ListItem = (props: any) => {
  const isRtl = I18nManager.isRTL;

  const {backgroundColor, statusLabels, tableHeaders} = props;

  const {statusId} = props?.itemData;

  const fromListItemTab = [];

  const navigation = useNavigation();

  const {parseValueForRender} = useContext(LibContext);

  const detailMap = useMemo(() => {
    if (!props.itemData) {
      return {};
    }

    const {taskDetails} = props.itemData;

    if (!taskDetails) {
      return {};
    }

    return taskDetails.reduce((acc, item) => {
      // TODO might need parsing
      acc[item.key] = item.value;
      return acc;
    }, {});
  }, [props?.itemData]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (statusId !== 'Pending') {
          navigation.navigate('ListItemDetails', {
            itemData: props.itemData,
            fromListItemTab: fromListItemTab,
          });
        }
      }}>
      <View
        style={[styles.itemInfoWrapper, {backgroundColor: backgroundColor}]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
          }}>
          {tableHeaders.map(key => {
            let value = detailMap[key];

            if (key == 'statusId' && statusLabels != null) {
              if (value != 'Pending') {
                value = statusLabels[value];
              }
            }

            const parsedValue = parseValueForRender(value);

            return (
              <View style={styles.cell}>
                <Text style={styles.description}>
                  {key === 'urgentTask'
                    ? value == true && (
                        <Icon name="exclamation" size={20} color="red" />
                      )
                    : parsedValue}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    height: 'auto',
    flexDirection: 'row',
  },
  verDots: {
    width: scale(8),
    height: scale(31),
    position: 'absolute',
  },
  verDotsWrapper: {
    width: scale(15),
    height: scale(40),
    right: scale(35),
    top: scale(50),
    position: 'absolute',
  },
  timeText: {
    fontSize: scale(40),
    marginLeft: scale(10),
    marginTop: scale(37),
  },
  itemInfoWrapper: {
    width: '95%',
    flexDirection: 'row',
    marginLeft: '5%',
    borderRadius: scale(25),
  },
  timeWrapper: {
    marginLeft: scale(70),
    flexDirection: 'row',
  },
  itemIco: {
    width: scale(40),
    height: scale(40),
    marginLeft: scale(25),
    marginTop: scale(25),
  },
  name: {
    fontSize: scale(28),
    // marginTop: scale(15),
    marginTop: scale(20),
    marginBottom: scale(20),
    alignSelf: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  description: {
    fontSize: scale(28),
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: scale(20),
    marginBottom: scale(20),
    maxWidth: scale(150),
    color: '#555555',
    flexShrink: 1,
  },
  cell: {
    width: '20%',
    maxWidth: '19%',
    height: 'auto',
    // paddingBottom: scale(15)
  },
});
