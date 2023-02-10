import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image
} from 'react-native'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { BottomMenu } from '../../components/BottomMenu'
import { scale } from '../../common/common'
import moment from 'moment';
import {
    getSettings,
    getTaskTypes,
    getForms,
    getTaskDetails,
    createNewTask
} from '../../api/index'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";
import { Dropdown } from "./FormElements/Dropdown";
import { DateTime } from "./FormElements/DateTime";
import { Markup } from "./FormElements/Markup";
import { TextForm } from "./FormElements/TextForm";
import { SingleText } from './FormElements/SingleText';
import { DateTimeButton } from "./FormElements/DateTimeButton";
import { TakePictureButton } from "./FormElements/TakePictureButton";
import { RadioButton } from "./FormElements/RadioButton"
import { Checkbox } from './FormElements/Checkbox'
import { useNavigation } from '@react-navigation/native';
import { SearchDropdown } from './FormElements/SearchableDropdown';
import { SearchDropdown2 } from './FormElements/SearchableDropdown2';
import { useGlobal } from "../../global/index"
import { DatePicker } from './FormElements/DatePicker';

export const CreateTask = () => {
    const {
        t,
        i18n
    } = useTranslation()

    const timeNow = moment().format('hh:mm')
    const [selectedItem, setSelectedItem] = useState(t('selectType'))
    const [id, setId] = useState(0)
    const [expanded, setExpanded] = useState(false)
    const [taskTypes, setTaskTypes] = useState([])
    const [taskDetails, setTaskDetails] = useState([])
    const [typeSelectedKey, setTypeSelectedKey] = useState('')
    const [forms, setForms] = useState([])
    const [formToShow, setFormToShow] = useState([])
    const [values, setValues] = useState({})
    const [groups, setGroups] = useGlobal([])
    const [selectedGroupItem, setGroupSelectedItem] = useState(t('selectedGroup'))
    const [groupExpanded, setGroupExpanded] = useState(false)

    const navigation = useNavigation()

    const getAllForms = async () => {
        const IdToken = await AsyncStorage.getItem('IdToken')
        const tenant = await AsyncStorage.getItem('tenant')
        const forms = await getForms(IdToken, tenant)
        setForms(forms)
    }

    const getTypes = async () => {
        const IdToken = await AsyncStorage.getItem('IdToken')
        const tenant = await AsyncStorage.getItem('tenant')
        const taskTypes = await getTaskTypes(IdToken, tenant)
        setTaskTypes(taskTypes)
    }

    const getNewId = async () => {
        const IdToken = await AsyncStorage.getItem('IdToken')
        const tenant = await AsyncStorage.getItem('tenant')
        const settings = await getSettings(IdToken, tenant)
        for (let item in settings) {
            if (settings[item].key == "taskNumber") {
                setId(settings[item].value)
            }
        }
    }

    const getAllTaskDetails = async () => {
        const IdToken = await AsyncStorage.getItem('IdToken')
        const tenant = await AsyncStorage.getItem('tenant')
        const taskDetails = await getTaskDetails(IdToken, tenant)
        setTaskDetails(taskDetails)
    }

    const formsFiltering = async (formId) => {

        if (typeof formId == 'string') {
            const disabled = ['statusId', 'taskId', 'taskType', 'assignedTo', 'createdAt']

            const res = taskDetails.filter(item => !disabled.includes(item.key))
            setFormToShow(res)
        } else if (typeof formId == 'object') {
            const filteredForms = forms.filter((form) => { return form._id == formId.create })[0]
            setFormToShow(filteredForms.formFields)
        }
    }

    useEffect(() => {
        getTypes()
        getAllForms()
        getAllTaskDetails()
    }, [])

    const checkConditions = (currentValues, field) => {

        const { conditions } = field;
        if (!conditions) return true

        return Object.entries(conditions).every(
            ([key, value]: [string, any]) => {

                const formValue: string | string[] = currentValues[key];

                return value.some((item) => {
                    if (item === "!null") {
                        return Array.isArray(formValue) ? formValue.length : formValue;
                    } else {
                        if (Array.isArray(formValue)) return formValue.includes(item);
                        return formValue == item;
                    }
                });
            }
        );
    };

    const shownFields = useMemo(() => {
        if (formToShow) {
            return formToShow?.filter((item) => checkConditions(values, item));
        }
        return []
    }, [values, formToShow]);

    const reference = useRef([])

    useEffect(() => {
        reference.current = []
        for (let i = 0; i < shownFields.length; i++) {
            reference.current[i] = React.createRef()
        }
    }, [])

    useEffect(() => {
        const map = {
            date: null,
            datetime: null,
            time: null,
            file: null,
            image: null,
            number: 0,
            boolean: false,
            any: null,
            text: "",
            string: "",
            textarea: "",
            enum: "",
            dropdown: "",
            dateTimePicker: "",
            checkboxes: [],
            button: "",
            dateTimeRegister: "",
            cameraButton: "",
            geo: "",
            attachButton: ""
        };

        const res = formToShow.reduce((acc, x) => {
            if (['statusId', 'taskId', 'taskType', 'assignedTo', 'createdAt'].includes(x.key)) {
                return acc
            }

            const initialValue = x.defaultValue ?? map[x?.inputType]

            // const initialValue = map[x?.inputType] || "";

            return {
                ...acc,
                [x.key]: initialValue,
            };
        }, {});

        setValues(res);

    }, [formToShow]);

    const handleElementField = async (key, value) => {
        const res = {
            ...values
        }
        if (Array.isArray(values[key])) {
            if (Array.isArray(value)) res[key] = value
            else res[key].push(value)
        }

        else res[key] = value

        for (const field of formToShow) {
            const valid = checkConditions(res, field)
            if (field.key == 'appliancesList') console.log('valid', valid)
            if (!valid) res[field.key] = Array.isArray(res[field.key]) ? [] : ""
        }
        setValues(res)
    }
    const [requirePassError, setRequirePassError] = useState(false)
    const [requiredPass, setRequiredPass] = useState({})
    const [groupRequirePassError, groupSetRequirePassError] = useState(true)

    useEffect(() => {
        const initialValues = formToShow.reduce((acc, item) => {
            const skip = ['geo', 'markup', 'printButton', 'signature', 'markup', 'button'];

            if (skip.includes(item.inputType)) return acc;

            const isRequired = item.rules?.required && (item.defaultValue == '' || item.defaultValue == null)

            return {
                ...acc,
                [item.key]: !isRequired,
            };
        }, {});
        
        setRequiredPass(initialValues);
    }, [formToShow]);

    useEffect(() => {
        let temp = 0
        for (let item in requiredPass) {
            if (!requiredPass[item]) {
                temp = temp + 1
            }
        }
        if (temp > 0) {
            setRequirePassError(true)
        } else {
            setRequirePassError(false)
        }

    }, [requiredPass])
    const createComponent = (item, index) => {

        const { inputType } = item
        let actions = []
        let regex = item.validation
        let required = item.rules?.required
        console.log('inputType', inputType)
        switch (inputType) {
            case 'string':
                return (<SingleText
                    focusComponent={() => {

                    }}
                    regex={regex}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case 'dropdown':
                return (<Dropdown
                    focusComponent={() => {

                    }}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    requires={required}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    answersMap={values}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case 'autocomplete':
                return (<SearchDropdown2
                    focusComponent={() => {

                    }}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    requires={required}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    answersMap={values}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case 'dateTimePicker':
                return (<DateTime
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case "checkboxes":
                return (<Checkbox
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case "text":
                return (<SingleText
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    regex={regex}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case "textarea":
                return (<TextForm
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    regex={regex}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case "markup":
                return (<Markup
                    itemData={item}
                />)
            case "dateTimeRegister":
                return (<DateTimeButton
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case "cameraButton":
                return (<TakePictureButton
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case "radios":
                return (<RadioButton
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case 'printButton':
                return null
            case 'attachButton':
                return (<TakePictureButton
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case 'signature':
                return null
            case "geo":
                return null
            case 'autocomplete':
                return (<SearchDropdown2
                    focusComponent={() => {

                    }}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    requires={required}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    answersMap={values}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
            case 'datePicker':
                return (<DatePicker
                    focusComponent={() => {

                    }}
                    requires={required}
                    setRequiredPass={setRequiredPass}
                    requiredPass={requiredPass}
                    ref={reference.current[index]}
                    itemData={item}
                    itemIndex={index}
                    handleElementField={handleElementField}
                    availableActions={actions}
                    wholeTask={undefined}
                    defaultValue={item.defaultValue}
                />)
        }
    }

    const components = shownFields?.map(createComponent)

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.arrowBackWrapper} onPress={() => { navigation.goBack() }}>
                        <Image style={styles.arrowBack} source={require('../../assets/arrow-back-white.png')} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>{t('createTask')}</Text>
                    <Text style={[styles.headerText, { marginLeft: scale(250) }]}>{timeNow}</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollWrapper}>
                {/* <Text style={styles.label}>Task id</Text> */}
                <View style={styles.scrollingHeader}>
                    {/* <View style={{ flexDirection: 'row' }}>
                        <TextInput
                            style={styles.inputTaskId}
                            defaultValue={`${id}`}
                        />

                        <TouchableOpacity style={styles.getNewIdBtn} onPress={() => {
                            getNewId()
                        }}>
                            <Text style={styles.btnText}>Get new id</Text>
                        </TouchableOpacity>
                    </View> */}

                    <View style={styles.dropdownWrapper}>
                        <Text style={styles.labelType}>{t('type')}</Text>
                        <TouchableOpacity style={styles.dropdownHeader} onPress={() => {
                            setExpanded(!expanded)
                        }}>
                            <Text style={styles.dropdownHeaderText}>{selectedItem}</Text>
                        </TouchableOpacity>

                    </View>
                    {
                        expanded ?
                            <ScrollView style={styles.typeScrollingArea}>
                                {
                                    taskTypes.map((item, index) => {
                                        return (
                                            <TouchableOpacity style={styles.typeItem} onPress={() => {
                                                setSelectedItem(item.label)
                                                setTypeSelectedKey(item.key)
                                                setExpanded(false)
                                                formsFiltering(item.form)
                                                setGroupSelectedItem(t('selectedGroup'))
                                                // groupSetRequirePassError(true)
                                            }}>
                                                <Text style={styles.typeText}>{item.label}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </ScrollView> : null
                    }
                </View>
                <View style={styles.scrollingHeader}>
                    {/* <View style={{ flexDirection: 'row' }}>
                        <TextInput
                            style={styles.inputTaskId}
                            defaultValue={`${id}`}
                        />

                        <TouchableOpacity style={styles.getNewIdBtn} onPress={() => {
                            getNewId()
                        }}>
                            <Text style={styles.btnText}>Get new id</Text>
                        </TouchableOpacity>
                    </View> */}

                    <View style={styles.dropdownWrapper}>
                        <Text style={styles.labelType}>{t('group')}</Text>
                        <TouchableOpacity style={styles.dropdownHeader} onPress={() => {
                            setGroupExpanded(!groupExpanded)
                        }}>
                            <Text style={styles.dropdownHeaderText}>{selectedGroupItem}</Text>
                        </TouchableOpacity>

                    </View>
                    {
                        groupExpanded ?
                            <ScrollView style={styles.typeScrollingArea}>
                                {
                                    groups.map((item) => {
                                        console.log("itemsss",item)
                                        return (
                                            <TouchableOpacity style={styles.typeItem} onPress={() => {
                                                setGroupSelectedItem(item)
                                                setGroupExpanded(false)
                                                handleElementField("groupName",item)
                                                // groupSetRequirePassError(false)
                                            }}>
                                                <Text style={styles.typeText}>{item}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </ScrollView> : null
                    }
                </View>
                <View style={styles.componentsScrollingWrapper}>
                    {
                        components.length ? components : <Text style={styles.noDataText}>{t('noDataAvailable')}</Text>
                    }
                </View>
                {/* {
                    requirePassError ? <Text style={{ alignSelf: 'center', color: 'red', marginTop: scale(30), marginBottom: scale(30) }}>{t('youMustFillRequiredFields')}</Text> : null
                } */}
                {
                    components.length ? <TouchableOpacity
                        disabled={requirePassError}
                        style={styles.saveBtn}
                        onPress={async () => {
                            const IdToken = await AsyncStorage.getItem('IdToken')
                            const tenant = await AsyncStorage.getItem('tenant')
                            console.log('values', values)
                            console.log('typeSelectedKey', typeSelectedKey)
                            const createNewTaskResult = await createNewTask(values, typeSelectedKey, IdToken, tenant).then(() => {
                                navigation.goBack()
                            })

                            console.log('createNewTaskResult', createNewTaskResult)
                        }}>
                        <Text style={styles.doneBtnText}>{t('saveValues')}</Text>
                    </TouchableOpacity> : null
                }


            </ScrollView>

            <BottomMenu fromWhere={'list'} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'blue'
    },
    arrowBackWrapper: {
        width: scale(121),
        height: '100%',
        marginLeft: scale(40)
    },
    arrowBack: {
        width: scale(73),
        height: scale(73),
        alignSelf: 'center',
        marginTop: scale(60)
    },
    header: {
        backgroundColor: '#3CBEE0',
        width: '100%',
        height: scale(230)
    },
    headerText: {
        color: 'white',
        fontSize: scale(50),
        marginTop: scale(55)
    },
    scrollWrapper: {
        marginBottom: scale(120),
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: scale(30),
        borderTopRightRadius: scale(30),
        marginTop: scale(-40)
    },
    inputTaskId: {
        borderColor: "lightgray",
        borderWidth: scale(3),
        width: scale(500),
        height: scale(120),
        borderRadius: scale(30),
        marginLeft: scale(50),
        marginTop: scale(10),
        fontSize: scale(35),
        paddingLeft: scale(25)
    },
    getNewIdBtn: {
        borderColor: '#3CBEE0',
        borderWidth: scale(5),
        width: scale(260),
        height: scale(120),
        borderRadius: scale(30),
        marginLeft: scale(50),
        marginTop: scale(10),
    },
    btnText: {
        fontSize: scale(35),
        alignSelf: 'center',
        marginTop: scale(28),
        color: '#3CBEE0'
    },
    label: {
        color: 'black',
        marginLeft: scale(70),
        marginTop: scale(50),
    },
    labelType: {
        color: 'gray',
        marginLeft: scale(20),
        marginBottom: scale(10)
    },
    dropdownWrapper: {
        width: '89%',
        height: 'auto',
        alignSelf: 'center',
        marginTop: scale(30),
        marginBottom: scale(30)
    },
    dropdownHeader: {
        width: '100%',
        height: scale(130),
        borderColor: "lightgray",
        borderWidth: scale(3),
        borderRadius: scale(30),
    },
    dropdownHeaderText: {
        color: 'black',
        paddingTop: scale(40),
        paddingLeft: scale(40),
    },
    typeItem: {
        paddingTop: scale(40),
        paddingLeft: scale(40),
        width: '93%',
        borderColor: 'lightgray',
        borderBottomWidth: scale(3)
    },
    typeScrollingArea: {
        marginLeft: scale(50),
    },
    typeText: {

    },
    componentsScrollingWrapper: {
        marginLeft: scale(50)
    },
    saveBtn: {
        width: scale(250),
        height: scale(100),
        borderRadius: scale(30),
        alignSelf: 'center',
        marginTop: scale(20),
        marginBottom: scale(40),
        backgroundColor: '#3CBEE0'
    },
    noDataText: {
        alignSelf: 'center',
        marginTop: scale(150),
        fontSize: scale(50),
        color: 'gray'
    },
    doneBtnText: {
        color: 'white',
        alignSelf: 'center',
        marginTop: scale(25)
    }
})