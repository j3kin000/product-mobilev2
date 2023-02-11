import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  I18nManager,
} from 'react-native';

import React, {useState, useEffect, useMemo, useRef, useContext} from 'react';
import {scale} from '../../common/common';
import {BottomMenu} from '../../components/BottomMenu';
import {useNavigation} from '@react-navigation/native';
import Lottie from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from './FormElements/Dropdown';
import {DateTime} from './FormElements/DateTime';
import {TextForm} from './FormElements/TextForm';
import {SingleText} from './FormElements/SingleText';
import {DateTimeButton} from './FormElements/DateTimeButton';
import {TakePictureButton} from './FormElements/TakePictureButton';
import {RadioButton} from './FormElements/RadioButton';
import {PrinterButton} from './FormElements/PrinterButton';
import {Sign} from '../Forms/FormElements/Sign';
import {Geo} from '../Forms/FormElements/Geo';
import {Button} from '../Forms/FormElements/Button';
import {AttachImage} from '../Forms/FormElements/AttachImage';
import {DateTimePicker} from './FormElements/DateTimePicker';
import {FormContext, FormProvider} from './FormContext';
import {useTranslation} from 'react-i18next';
import {Checkbox} from './FormElements/Checkbox';
import {useGlobal} from '../../global/index';
import {DatePicker} from './FormElements/DatePicker';
import {cloneDeep} from 'lodash';
import {SurveyButton} from './FormElements/SurveyButton';
import {Markup} from './FormElements/Markup';

const FormsPageBasic = (props: any) => {
  const {taskType, taskId, statusId, _id} = props.route.params.itemData;

  const data = props.route.params.itemData;
  const id = data._id;
  const getGroupData = props.route.params.getUserGroup;

  const [statuses] = useGlobal<{statuses: any[]}>('statuses');

  const [showAlert, setShowAlert] = useState(false);
  const [changeStatusResponse, setChangeStatusResponse] = useState(null);
  const [values, setValues] = useState({});
  const [defaultValues, setDefaultValues] = useState({});
  const [showRequiredError, setShowRequiredError] = useState(false);
  const formReference = useRef();
  const reference = useRef([]);

  const {t} = useTranslation();

  const navigation = useNavigation();

  const {requiredButEmptyFields, setRequiredButEmptyFields} =
    useContext(FormContext);

  const restoreProgress = async () => {
    const test = await AsyncStorage.getItem(id);
    if (test) {
      setDefaultValues(JSON.parse(test));
      setValues(JSON.parse(test));
    } else {
      console.log('no progress yet');
    }
  };

  useEffect(() => {
    restoreProgress();
  }, []);

  useEffect(() => {
    const res = data.form?.reduce((acc, item) => {
      const {key, inputType} = item;

      const arrayTypes = ['checkboxes', 'cameraButton'];
      const isArrayType = arrayTypes.includes(inputType);

      if (isArrayType) {
        acc[key] = [];
      } else {
        acc[key] = '';
      }

      return acc;
    }, {});

    setValues(res);
  }, [data]);

  const checkConditions = (currentValues, field) => {
    const {conditions} = field;

    if (!conditions || Object.keys(conditions).length < 1) {
      return true;
    }

    return Object.entries<string[]>(conditions).every(
      ([key, value]: [string, string[]]) => {
        const formValue: string | string[] = currentValues[key];

        return value.some(item => {
          if (item === '!null') {
            return Array.isArray(formValue) ? formValue.length : formValue;
          } else {
            if (Array.isArray(formValue)) {
              return formValue.includes(item);
            }
            return formValue == item;
          }
        });
      },
    );
  };

  // recursively setting up default values for the next fields to show
  const recursiveDisplay = (fields: any[], valueContainer) => {
    const allShownFields = fields.filter(item =>
      checkConditions(valueContainer, item),
    );

    const newFieldsToShow = allShownFields.filter(
      item => !(item.key in valueContainer),
    );

    if (newFieldsToShow.length == 0) {
      return valueContainer;
    }

    for (const newField of newFieldsToShow) {
      const {defaultValue, key, inputType} = newField;

      let fallbackValue = inputType === 'checkboxes' ? [] : '';

      if (defaultValue == null || defaultValue == '') {
        valueContainer[key] = fallbackValue;
      } else {
        let resetValue = defaultValue;

        if (inputType === 'checkboxes') {
          if (!Array.isArray(defaultValue)) {
            resetValue = [defaultValue];
          }
        }

        valueContainer[key] = resetValue;
      }
    }

    return recursiveDisplay(fields, valueContainer);
  };

  // recursively resets one value, its children, and so on and forth
  const recursiveReset = (fields: any[], valueContainer) => {
    const invalidFields = fields.filter(
      item => !checkConditions(valueContainer, item),
    );
    const invalidFieldKeys = invalidFields.map(item => item.key);

    const valuesToReset = Object.keys(valueContainer).filter(item =>
      invalidFieldKeys.includes(item),
    );

    const noInvalid = valuesToReset.length < 1;

    if (noInvalid) {
      return valueContainer;
    }

    for (const toRemove of invalidFields) {
      delete valueContainer[toRemove.key];
    }

    return recursiveReset(fields, valueContainer);
  };

  const handleElementField = async (key, value, isFromGeo = false) => {
    setShowRequiredError(false);

    const res = cloneDeep(values);

    if (Array.isArray(values[key])) {
      if (Array.isArray(value)) {
        res[key] = value;
      } else {
        res[key].push(value);
      }
    } else {
      res[key] = value;
    }

    const cleanedValues = recursiveReset(data.form, cloneDeep(res));
    const currentAndFutureValues = recursiveDisplay(
      data.form,
      cloneDeep(cleanedValues),
    );

    // if value is truthy, remove required error
    if (value) {
      const removedKeys = Object.keys(res).filter(
        item => !Object.keys(currentAndFutureValues).includes(item),
      );

      const resetRemovedKeys = requiredButEmptyFields.filter(
        item => item !== key && !removedKeys.includes(item),
      );

      setRequiredButEmptyFields(resetRemovedKeys);
    }

    setValues(currentAndFutureValues);

    await saveProgress(currentAndFutureValues);
  };

  const saveProgress = async (newValues: object) => {
    const getItems = await AsyncStorage.getItem(id);

    if (getItems === null) {
      await AsyncStorage.setItem(id, JSON.stringify(newValues));
    } else {
      await AsyncStorage.removeItem(id);
      await AsyncStorage.setItem(id, JSON.stringify(newValues));
    }
  };

  const [listScrolling, setListScrolling] = useState(true);

  const [focusIndex, setFocusIndex] = useState(-1);

  const [dataSourceCords, setDataSourceCords] = useState([]);

  const focusComponent = (index: any) => {
    setFocusIndex(index);
    reference.current[focusIndex]?.current?.focus();
  };

  const currentStatusLabel = useMemo(() => {
    if (!statuses) {
      return statusId;
    }

    const statusObject = statuses.find(item => item.Key === statusId);
    return statusObject?.label ?? statusId;
  }, [statusId, statuses]);

  const scrollTo = ({
    index,
    top,
    key,
  }: {
    index?: number;
    top?: boolean;
    key?: string;
  }) => {
    if (top) {
      formReference.current?.scrollTo({
        x: 0,
        y: 1,
        animated: true,
      });
    } else if (index != null) {
      const hasNextElement = dataSourceCords[index] != null;
      const hasCoordsList = dataSourceCords.length > 0;

      const isAllowedToScroll = hasNextElement && hasCoordsList;

      if (isAllowedToScroll) {
        formReference.current?.scrollTo({
          x: 0,
          y: dataSourceCords[index].y,
          animated: true,
        });
      }
    } else if (key) {
      const elementIndex = dataSourceCords.findIndex(item => item.key === key);

      if (elementIndex != null && elementIndex > -1) {
        scrollTo({index: elementIndex});
      }
    }
  };

  const shownFields = useMemo(() => {
    if (data.form) {
      const fields = data.form?.filter(item => checkConditions(values, item));
      return fields;
    }
  }, [values, data]);

  useEffect(() => {
    if (shownFields?.length < 1) {
      return;
    }

    reference.current = [];

    for (let i = 0; i < shownFields?.length; i++) {
      reference.current[i] = React.createRef();
    }
  }, []);

  const createComponent = (item, index) => {
    const {inputType} = item;
    let actions = [];
    if (item?.rules?.actions) {
      for (let action in item.rules.actions) {
        actions.push(item.rules.actions[action]);
      }
    }
    switch (inputType) {
      case 'dropdown':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <Dropdown
              focusComponent={() => {
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              answersMap={values}
              availableActions={actions}
              wholeTask={data}
              value={item.value}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : values[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'dateTimePicker':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <DateTime
              focusComponent={() => {
                focusComponent(index + 1);
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : defaultValues[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'checkboxes':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <Checkbox
              focusComponent={() => {
                focusComponent(index + 1);
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : values[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'text':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <SingleText
              focusComponent={() => {
                focusComponent(index + 1);
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : defaultValues[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'textarea':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <TextForm
              focusComponent={() => {
                scrollTo({index: index + 1});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : defaultValues[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'markup':
        return (
          <Markup
            focusComponent={() => {
              focusComponent(index + 1);
            }}
            ref={reference.current[index]}
            itemData={item}
            itemIndex={index}
            handleElementField={handleElementField}
            values={values}
            allForm={data}
            taskId={taskId}
            availableActions={actions}
            wholeTask={data}
            getUserGroup={getGroupData}
            defaultValue={defaultValues}
          />
        );
      case 'dateTimeRegister':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <DateTimeButton
              focusComponent={() => {
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value != null
                    ? item.value
                    : ''
                  : defaultValues[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'cameraButton':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}
            style={styles.rowGap}>
            <TakePictureButton
              focusComponent={() => {
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              taskId={taskId}
              values={values}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : defaultValues[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'radios':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <RadioButton
              focusComponent={() => {
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : values[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'survey':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <SurveyButton
              focusComponent={() => {
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : values[item.key] ?? ''
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'printButton':
        return (
          <>
            <View
              key={index}
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                dataSourceCords[index] = {
                  y: layout.y,
                  key: item.key,
                };
                setDataSourceCords(dataSourceCords);
              }}>
              <PrinterButton
                focusComponent={() => {
                  scrollTo({index});
                }}
                ref={reference.current[index]}
                itemData={item}
                itemIndex={index}
                handleElementField={handleElementField}
                values={values}
                allForm={data}
                taskId={taskId}
                availableActions={actions}
                wholeTask={data}
                getUserGroup={getGroupData}
                defaultValue={defaultValues}
              />
            </View>
            <View
              key={index + 1}
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                dataSourceCords[index + 1] = {
                  y: layout.y,
                  key: item.key,
                };
                setDataSourceCords(dataSourceCords);
              }}
            />
          </>
        );
      case 'signature':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <Sign
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              wholeTask={data}
              values={values}
              setListScrolling={setListScrolling}
              listScrolling={listScrolling}
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'button':
        return (
          <Button
            focusComponent={() => {
              scrollTo({index});
            }}
            ref={reference.current[index]}
            _id={_id}
            itemData={item}
            taskData={data}
            itemIndex={index}
            requiredButEmptyFields={requiredButEmptyFields}
            handleElementField={handleElementField}
            setShowAlert={setShowAlert}
            showAlert={showAlert}
            scrollTo={scrollTo}
            setShowRequiredError={setShowRequiredError}
            setChangeStatusResponse={setChangeStatusResponse}
            changeStatusResponse={changeStatusResponse}
            answersData={values}
            availableActions={actions}
            wholeTask={data}
            defaultValue={
              defaultValues[item.key] === undefined
                ? ''
                : defaultValues[item.key]
            }
          />
        );
      case 'attachButton':
        return (
          <View
            key={index}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <AttachImage
              focusComponent={() => {
                focusComponent(index + 1);
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              taskId={taskId}
              defaultValue={
                defaultValues[item.key] === undefined
                  ? ''
                  : defaultValues[item.key]
              }
            />
            {requiredButEmptyFields.includes(item.key) ? (
              <Text style={styles.errorText}>{t('required')}</Text>
            ) : null}
          </View>
        );
      case 'datePicker':
        return (
          <View
            key={index}
            style={styles.item}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              dataSourceCords[index] = {
                y: layout.y,
                key: item.key,
              };
              setDataSourceCords(dataSourceCords);
            }}>
            <DatePicker
              focusComponent={() => {
                focusComponent(index + 1);
                scrollTo({index});
              }}
              ref={reference.current[index]}
              itemData={item}
              itemIndex={index}
              handleElementField={handleElementField}
              availableActions={actions}
              wholeTask={data}
              defaultValue={
                statusId === 'escalate'
                  ? item.value ?? ''
                  : defaultValues[item.key] ?? ''
              }
            />
          </View>
        );
    }
  };

  const components = shownFields?.map(createComponent);

  return (
    <SafeAreaView style={styles.container}>
      {showAlert && (
        <View style={styles.lottieWrapper}>
          {changeStatusResponse == 200 ? (
            <Lottie
              source={require('../../assets/lottie/lottie-checked.json')}
              autoPlay
              loop
            />
          ) : (
            <Lottie
              source={require('../../assets/lottie/cross.json')}
              autoPlay
              loop
            />
          )}
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.arrowBackWrapper}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image
            style={styles.arrowBack}
            source={require('../../assets/arrow-back-white.png')}
          />
        </TouchableOpacity>

        <View style={styles.headerSigns}>
          <Text style={styles.itemName}>{taskType}</Text>
          <Text style={styles.itemDesc}>{currentStatusLabel}</Text>
        </View>
        <View style={styles.resetWrapper}>
          <View style={styles.taskIdWrapper}>
            <Text style={styles.taskId}>{t('taskId')}</Text>
            <Text style={styles.id}>{taskId}</Text>
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={async () => {
              setDefaultValues({});
              setValues({});
              setRequiredButEmptyFields([]);
              setShowRequiredError(false);
              await AsyncStorage.removeItem(id);
            }}>
            <Image
              style={styles.undoIcon}
              source={require('../../assets/undo.png')}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        overScrollMode="never"
        style={styles.scrollingArea}
        scrollEnabled={listScrolling}
        ref={formReference}>
        <SafeAreaView style={styles.offsetTop} />
        {showRequiredError ? (
          <Text style={styles.errorSubmitText}>{t('submitRequiredError')}</Text>
        ) : null}
        {data.form ? (
          components
        ) : (
          <Text style={styles.noForm}>{t('noFormElements')}</Text>
        )}
      </ScrollView>
      <SafeAreaView style={styles.offset} />
      <DateTimePicker onSelect={e => console.log(e)} />

      <BottomMenu fromWhere={'list'} />
    </SafeAreaView>
  );
};

export const FormsPage = props => (
  <FormProvider>
    <FormsPageBasic {...props} />
  </FormProvider>
);

const styles = StyleSheet.create({
  rowGap: {
    marginBottom: scale(40),
  },
  offsetTop: {
    height: scale(50),
    width: '100%',
  },
  errorText: {
    fontSize: scale(25),
    color: 'red',
    textAlign: 'left',
    marginBottom: scale(10),
  },
  errorSubmitText: {
    fontSize: scale(30),
    alignSelf: 'center',
    marginTop: scale(20),
    color: 'red',
    marginBottom: scale(30),
  },
  offset: {
    height: scale(120),
    width: '100%',
    backgroundColor: 'black',
  },
  lottieWrapper: {
    position: 'absolute',
    width: scale(600),
    height: scale(600),
    borderRadius: scale(20),
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: scale(400),
    zIndex: 999,
  },
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: scale(280),
    backgroundColor: '#3ABEE0',
    flexDirection: 'row',
  },
  arrowBack: {
    width: scale(73),
    height: scale(73),
    alignSelf: 'center',
    marginTop: scale(100),
  },
  arrowBackWrapper: {
    width: scale(121),
    height: '100%',
    marginLeft: scale(40),
  },
  headerSigns: {
    alignSelf: 'center',
    marginLeft: scale(40),
  },
  calendarSmall: {
    width: scale(36),
    height: scale(39),
    marginTop: scale(8),
  },
  itemName: {
    color: 'white',
    fontSize: scale(42),
  },
  itemDesc: {
    color: 'white',
    fontSize: scale(26),
  },
  timeWrapper: {
    marginLeft: scale(40),
    flexDirection: 'row',
  },
  timeText: {
    fontSize: scale(30),
    marginLeft: scale(10),
    marginTop: scale(37),
    color: 'white',
  },
  infoLine: {
    backgroundColor: '#879BB4',
    width: '100%',
    height: scale(50),
  },
  infoLineTimer: {
    backgroundColor: '#33465D',
    width: '100%',
    height: scale(50),
    flexDirection: 'row',
  },
  infoText: {
    color: 'white',
    fontSize: scale(24),
    marginLeft: scale(50),
    marginTop: scale(7),
  },
  timerValue: {
    color: 'white',
    fontSize: scale(30),
    marginTop: scale(4),
    marginLeft: scale(500),
  },
  editingWrapper: {
    width: '80%',
    alignSelf: 'center',
    marginTop: scale(92),
  },
  col1: {
    width: '50%',
    backgroundColor: 'black',
  },
  orangeRect: {
    width: scale(25),
    height: scale(25),
    backgroundColor: '#F08032',
    marginTop: scale(20),
  },
  tasksHeader: {
    fontSize: scale(48),
    marginLeft: scale(15),
    color: '#33465D',
  },
  taskName: {
    fontSize: scale(30),
    color: '#33465D',
  },
  tasksWrapper: {
    marginTop: scale(50),
    marginLeft: scale(50),
    flexDirection: 'row',
  },
  switcherImage: {
    width: scale(135),
    height: scale(40),
    marginLeft: scale(450),
  },
  switcherImageOff: {
    width: scale(120),
    height: scale(40),
    marginLeft: scale(450),
  },
  switcher: {
    marginTop: scale(5),
  },
  galleryWrapper: {
    alignSelf: 'center',
    width: scale(550),
    height: scale(100),
    marginTop: scale(80),
    flexDirection: 'row',
  },
  cameraIcon: {
    width: scale(80),
    height: scale(72),
  },
  image: {
    marginLeft: scale(25),
    width: scale(110),
    height: scale(75),
    borderRadius: scale(8),
  },
  warningText: {
    alignSelf: 'center',
    fontSize: scale(30),
    color: '#33465D',
  },
  textInput: {
    backgroundColor: 'white',
    borderColor: '#33465D',
    borderWidth: scale(2),
    borderRadius: scale(8),
    width: scale(624),
    height: scale(246),
    alignSelf: 'center',
    marginTop: scale(30),
    fontSize: scale(25),
    textAlignVertical: 'top',
  },
  scrollingArea: {
    marginTop: scale(-35),
    borderTopRightRadius: scale(50),
    borderTopLeftRadius: scale(50),
    paddingLeft: scale(50),
    backgroundColor: 'white',
  },
  bottomButtonsArea: {
    flexDirection: 'row',
    width: '100%',
    height: scale(130),
    marginTop: scale(30),
  },
  backBtn: {
    width: scale(195),
    height: scale(60),
    borderColor: '#01AAD4',
    borderWidth: scale(2),
    borderRadius: scale(8),
    backgroundColor: 'white',
    marginLeft: scale(40),
  },
  btnText: {
    color: '#01AAD4',
    fontSize: scale(28),
    alignSelf: 'center',
    marginTop: scale(7),
  },
  rectanglesWrapper: {
    flexDirection: 'row',
    marginLeft: scale(100),
    marginRight: scale(100),
  },
  shape: {
    width: scale(24),
    height: scale(51),
    backgroundColor: '#54D5F5',
    marginLeft: scale(20),
  },
  taskId: {
    color: 'white',
    fontSize: scale(42),
    fontWeight: 'bold',
  },
  id: {
    color: 'white',
    fontSize: scale(40),
    alignSelf: 'center',
  },
  taskIdWrapper: {
    position: 'absolute',
    right: scale(100),
    top: scale(90),
  },
  noForm: {
    marginLeft: scale(80),
    fontSize: scale(40),
    marginTop: scale(100),
    color: 'gray',
  },
  undoIcon: {
    width: scale(60),
    height: scale(60),
  },
  resetWrapper: {
    flexDirection: 'row',
    position: 'absolute',
    right: scale(50),
  },
  resetButton: {
    top: scale(120),
  },
});
