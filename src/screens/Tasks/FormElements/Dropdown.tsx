import {
  StyleSheet,
  Text,
  View,
  Image,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {scale} from '../../../common/common';

const optionsMapper = options => {
  const dropDownItems = [];
  for (let key in options) {
    dropDownItems.push({
      value: options[key],
      key,
    });
  }
  return dropDownItems;
};

export const Dropdown = (props: any) => {
  const [selectedItem, setSelectedItem] = useState('');

  const {defaultValue} = props;

  useEffect(() => {
    setSelectedItem(defaultValue);
    handleElementField(key, defaultValue);
    setRequiredPass(oldValue => {
      return {
        ...oldValue,
        [key]: true,
      };
    });
  }, [defaultValue]);

  const isRtl = I18nManager.isRTL;

  const {label, options, key} = props.itemData;

  const {handleElementField, setRequiredPass, requiredPass, requires} = props;

  const [items, setItems] = useState(optionsMapper(options));

  useEffect(() => {
    if (!requires) {
      setRequiredPass({...requiredPass, [key]: true});
    } else {
      if (selectedItem != '') {
        setRequiredPass({...requiredPass, [key]: true});
      } else {
        setRequiredPass({...requiredPass, [key]: false});
      }
    }
  }, [selectedItem]);

  const [expand, setExpand] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={isRtl ? styles.labelRtl : styles.label}>
        {label ? label : null}
      </Text>
      {expand ? (
        <View>
          {items.map((item, index) => {
            return (
              <TouchableOpacity
                style={styles.singleItem}
                onPress={() => {
                  setSelectedItem(item.key);
                  handleElementField(key, item.key, true);
                  setExpand(false);
                }}>
                <Text style={isRtl ? styles.textOptionRtl : styles.textOption}>
                  {item.value}
                </Text>
              </TouchableOpacity>
            );
          })}
          <Image
            style={isRtl ? styles.arrowRtl : styles.arrow}
            source={require('../../../assets/up-arrow.png')}
          />
        </View>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.notExpanded}
            onPress={() => {
              setExpand(true);
            }}>
            <Text style={isRtl ? styles.textOptionRtl : styles.textOption}>
              {
                items.find(option => {
                  return option.key == selectedItem;
                })?.value
              }
            </Text>
          </TouchableOpacity>
          <Image
            style={isRtl ? styles.arrowRtl : styles.arrow}
            source={require('../../../assets/down-arrow.png')}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(80),
    zIndex: 999,
  },
  label: {
    color: 'black',
    marginBottom: scale(10),
  },
  labelRtl: {
    color: 'black',
    marginBottom: scale(10),
    textAlign: 'left',
  },
  expanded: {
    backgroundColor: 'white',
    borderRadius: scale(8),
    borderWidth: scale(1),
    borderColor: 'black',
    width: '100%',
  },
  notExpanded: {
    backgroundColor: 'white',
    borderRadius: scale(8),
    width: scale(730),
    height: scale(100),
    borderColor: 'lightgray',
    borderWidth: scale(3),
  },
  arrow: {
    position: 'absolute',
    right: scale(150),
    top: scale(35),
    width: scale(40),
    height: scale(20),
  },
  arrowRtl: {
    position: 'absolute',
    right: scale(150),
    top: scale(35),
    width: scale(40),
    height: scale(20),
  },
  textOption: {
    marginTop: scale(25),
    marginLeft: scale(35),
  },
  textOptionRtl: {
    marginTop: scale(25),
    marginLeft: scale(35),
    textAlign: 'left',
  },
  singleItem: {
    height: scale(100),
    width: scale(730),
    backgroundColor: 'white',
    borderColor: 'lightgray',
    borderWidth: scale(3),
    borderRadius: scale(10),
  },
});
