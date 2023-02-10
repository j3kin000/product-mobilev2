import { StyleSheet, Text, View, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import React, { useMemo, useContext } from 'react';
import { scale } from '../../common/common';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import { LibContext } from '../../common/context/lib';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';

export const ListItemTab = (props: any) => {
  const { t, i18n } = useTranslation();

  const { backgroundColor, statusLabels, taskDetailsIcons } = props;

  const { statusId } = props?.itemData;

  const navigation = useNavigation();

  const { parseValueForRender } = useContext(LibContext);

  const sortedDetails = useMemo(() => {
    const { taskDetails } = props?.itemData;

    if (!taskDetails) return [];

    const clone = cloneDeep(taskDetails);

    clone.sort((a, b) => {
      if (a.orderMobile === b.orderMobile) return a.label.localeCompare(b.label);
      if (a.orderMobile == null && b.orderMobile == null) return 0;

      if (a.orderMobile == null) return 1;
      if (b.orderMobile == null) return -1;

      return a.orderMobile < b.orderMobile ? -1 : 1;
    });

    return clone;
  }, [props?.itemData]);

  const contactNumber: string = useMemo(() => {
    const { taskDetails } = props?.itemData;

    if (!taskDetails) return '';

    const phoneNumberDetail = taskDetails.find(item => item.key === taskDetailsIcons?.phoneIcon);

    return phoneNumberDetail?.value ?? '';
  }, [props?.itemData, taskDetailsIcons]);

  const addressDetails = useMemo(() => {
    let mapIconKeys = taskDetailsIcons?.mapIcon;
    if (!mapIconKeys) return '';

    const { taskDetails } = props?.itemData;
    if (!taskDetails) return '';

    const detailsMap = taskDetails.reduce((acc, item) => {
      acc[item.key] = item;
      return acc;
    }, {});

    if (typeof mapIconKeys === 'string') {
      mapIconKeys = mapIconKeys.split(',');
    }

    if (Array.isArray(mapIconKeys)) {
      return mapIconKeys
        .map(item => detailsMap[item]?.value)
        .filter(Boolean)
        .join(', ');
    }

    return '';
  }, [props?.itemData, taskDetailsIcons]);

  const openContacts = phoneNumber => {
    if (phoneNumber != null && phoneNumber.trim()) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert(
        null,
        `${t('noContactNo')}`,
        [{ text: t('ok'), onPress: () => console.log('OK Pressed') }],
        { cancelable: true }
      );
    }
  };

  const openMap = (address: string) => {
    if (address.trim() != '') {
      const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'geo:0,0?q=',
      });

      const label = address;

      const url = Platform.select({
        ios: `${scheme}${label}`,
        android: `${scheme}${label}`,
      });

      Linking.openURL(url);
    } else {
      Alert.alert(
        null,
        `${t('noMap')}`,
        [{ text: t('ok'), onPress: () => console.log('OK Pressed') }],
        { cancelable: true }
      );
    }
  };

  const toDisplay = sortedDetails.slice(0, 7);
  const toListItemDetails = sortedDetails.slice(7, sortedDetails.length);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (statusId !== 'Pending') {
          navigation.navigate('ListItemDetails', {
            itemData: props.itemData,
            fromListItemTab: toListItemDetails,
          });
        }
      }}
    >
      <View style={[styles.itemInfoWrapper, { backgroundColor: backgroundColor }]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.textWrapper}>
            {toDisplay.map((item, index) => {
              let value = item.value;

              if (item.key == 'statusId' && statusLabels != null) {
                if (statusId == 'Pending') {
                  value = statusId;
                } else {
                  value = statusLabels[item.value];
                }
              }

              const parsedValue = parseValueForRender(value);

              return (
                <View style={styles.cell}>
                  <Text style={styles.label}>{item.label} </Text>
                  <Text style={styles.description}>
                    {item.key === 'urgentTask'
                      ? value == true && <Icon1 name="exclamation" size={20} color="red" />
                      : parsedValue}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.iconWrapper}>
            {contactNumber != '' && (
              <TouchableOpacity
                style={[styles.iconStyle, styles.phoneIconContainer]}
                onPress={() => openContacts(contactNumber)}
              >
                <View>
                  <Icon style={styles.phoneIcon} name="call" size={20} />
                </View>
              </TouchableOpacity>
            )}
            {addressDetails != '' && (
              <TouchableOpacity
                style={[styles.iconStyle, styles.mapIconContainer]}
                onPress={() => openMap(addressDetails)}
              >
                <View>
                  <Icon1 style={styles.mapIcon} name="map-marker" size={20} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    flexDirection: 'row',
    paddingBottom: scale(30),
  },
  itemInfoWrapper: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: scale(40),
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
  description: {
    fontSize: scale(28),
    textAlign: 'left',
    width: scale(250),
    color: '#555555',
    flexShrink: 1,
  },
  label: {
    fontSize: scale(28),
    alignSelf: 'center',
    textAlign: 'left',
    width: scale(300),
    color: 'black',
    marginRight: scale(30),
    flexShrink: 1,
  },
  cell: {
    marginLeft: scale(40),
    flexDirection: 'row',
    height: 'auto',
    marginBottom: scale(10),
  },
  textWrapper: {
    marginTop: scale(30),
    paddingBottom: scale(30),
    flex: 10,
  },
  iconWrapper: {
    flex: 2,
    flexDirection: 'column',
  },
  iconStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  phoneIconContainer: {
    backgroundColor: '#bae8ba',
  },
  phoneIcon: {
    color: 'green',
  },
  mapIconContainer: {
    backgroundColor: '#fcc1b3',
  },
  mapIcon: {
    color: '#d14a3b',
  },
  ok: {
    textAlign: 'left',
    alignSelf: 'left',
    alignItems: 'left',
  },
});
