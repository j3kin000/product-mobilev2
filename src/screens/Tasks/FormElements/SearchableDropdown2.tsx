import {
  StyleSheet,
  Text,
  View,
  Image,
  I18nManager,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {scale} from '../../../common/common';
import SearchableDropdown from 'react-native-searchable-dropdown';

export const SearchDropdown2 = (props: any) => {
  const [open, setOpened] = useState(false);
  const [value, setValue] = useState(null);
  const dropDownItems = [];
  const optionsMapper = options => {
    let counter = 0;
    for (let key in options) {
      counter++;
      dropDownItems.push({
        key: key,
        name: options[key],
      });
    }
    return dropDownItems;
  };
  const {
    handleElementField,
    setRequiredPass,
    requiredPass,
    requires,
    defaultValue,
  } = props;

  const {label, key, options} = props.itemData;

  const [items, setItems] = useState(optionsMapper(options)); // all items
  const [selectedItem, setSelectedItem] = useState('');
  const [changeText, setChangeText] = useState('');
  const [itemsToShow, setItemsToShow] = useState([]);

  const setVal = getVal => {
    handleElementField(key, getVal.key);
    setValue(getVal);
    if (!requires) {
      setRequiredPass({...requiredPass, [key]: true});
    } else {
      if (getVal != '') {
        setRequiredPass({...requiredPass, [key]: true});
      } else {
        setRequiredPass({...requiredPass, [key]: false});
      }
    }
  };
  const isRtl = I18nManager.isRTL;
  console.log('changeText', changeText);

  useEffect(() => {
    let lowerText = changeText.toString().toLowerCase();

    if (changeText == '') {
      setItemsToShow(items);
      return;
    }

    let temp = items;

    if (lowerText) {
      temp = items.filter(item => {
        if (item.name.toString().toLowerCase().includes(lowerText)) {
          return true;
        }
        // return false
      });
    }
    setItemsToShow(temp);
  }, [changeText, items]);

  return (
    <View style={styles.container} zIndex={2000}>
      <Text style={isRtl ? styles.labelRtl : styles.label}>
        {label ? label : null}
      </Text>
      <TouchableOpacity
        style={styles.dropdownContainer}
        onPress={() => {
          setOpened(!open);
        }}>
        <Text>{selectedItem.length > 0 ? selectedItem : 'Choose element'}</Text>
      </TouchableOpacity>

      {open ? (
        <View style={styles.expandedPanel}>
          <ScrollView>
            <TextInput
              style={styles.textInput}
              placeholder="Search here..."
              onChangeText={setChangeText}
              value={changeText}
            />

            {itemsToShow.map((item, index) => {
              return (
                <TouchableOpacity
                  style={styles.singleItem}
                  onPress={() => {
                    setVal(item);
                    setSelectedItem(item.name);
                    setOpened(false);
                  }}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(60),
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
  dropdownContainer: {
    width: '90%',
    height: scale(100),
    backgroundColor: 'white',
    borderRadius: scale(30),
    borderColor: 'lightgray',
    borderWidth: scale(3),
    paddingTop: scale(20),
    paddingLeft: scale(20),
  },
  expandedPanel: {
    backgroundColor: 'white',
    width: '90%',
    height: 'auto',
    borderRadius: scale(30),
    borderColor: 'gray',
    borderWidth: scale(3),
    marginTop: scale(30),
  },
  textInput: {
    width: '95%',
    height: scale(80),
    borderWidth: scale(3),
    borderColor: 'lightgray',
    borderRadius: scale(30),
    alignSelf: 'center',
    marginTop: scale(30),
    marginBottom: scale(30),
    paddingLeft: scale(20),
    paddingTop: scale(15),
    // paddingBottom: scale(-5)
  },
  singleItem: {
    width: '95%',
    alignSelf: 'center',
    borderBottomColor: 'lightgray',
    borderBottomWidth: scale(3),
    marginBottom: scale(15),
    paddingBottom: scale(15),
    paddingLeft: scale(30),
  },
});
