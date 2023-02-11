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
import {doAction} from '../FormActions';
import {FormContext} from '../FormContext';

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

export const Dropdown = React.forwardRef((props: any, ref) => {
  const {setOpen, actionsQ, setActionsQ} = useContext(FormContext);

  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    setSelectedItem(props.defaultValue);
  }, [props.defaultValue]);

  const isRtl = I18nManager.isRTL;

  const {label, options, key} = props.itemData;

  const {handleElementField, availableActions, wholeTask} = props;

  const [items, setItems] = useState(optionsMapper(options));

  const [expand, setExpand] = useState(false);

  const setIndex = () => {
    if (selectedItem != '' && wholeTask) {
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

  return (
    <View style={styles.container} ref={ref}>
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
                  setIndex();
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
});

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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 4,
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
