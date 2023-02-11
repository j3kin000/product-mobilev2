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
import DropDownPicker from 'react-native-dropdown-picker';

export const SearchDropdown = (props: any) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  const dropDownItems = [];
  const optionsMapper = options => {
    for (let key in options) {
      dropDownItems.push({
        label: options[key],
        value: key,
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

  const [items, setItems] = useState(optionsMapper(options));

  const setVal = getVal => {
    let getLabel = '';
    items.map(item => {
      if (item.value === getVal) {
        getLabel = item.label;
      }
    });

    handleElementField(key, getVal);
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

  return (
    <View style={styles.container} zIndex={2000}>
      <Text style={isRtl ? styles.labelRtl : styles.label}>
        {label ? label : null}
      </Text>
      <View>
        <TouchableOpacity style={styles.notExpanded} onPress={() => {}}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            searchable={true}
            searchPlaceholder="Search Here..."
            onChangeValue={() => setVal(value)}
            listMode="MODAL"
          />
        </TouchableOpacity>
      </View>
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
  expanded: {
    backgroundColor: 'white',
    borderRadius: scale(8),
    borderWidth: scale(3),
    borderColor: 'black',
    width: '100%',
  },
  notExpanded: {
    backgroundColor: 'white',
    width: scale(730),
    height: scale(100),
    borderColor: 'white',
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
  itemStyle: {
    padding: 10,
    marginTop: 2,
    backgroundColor: '#FAF9F8',
    borderColor: '#bbb',
    borderWidth: 1,
  },
  textInputStyle: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FAF7F6',
  },
});
