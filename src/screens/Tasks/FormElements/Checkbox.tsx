import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { scale } from '../../../common/common'

export const Checkbox = (props: any) => {

    const {
        label,
        key,
      
        options
    } = props.itemData
    
    const {
        handleElementField,
        value,
        setRequiredPass,
        requiredPass,
        defaultValue,
        requires
    } = props
    const [checkedElements, setCheckedElements] = useState([])

    let checkboxesList = []

    for (let opt in options) {
        checkboxesList.push({  key: opt, value: options[opt] })
    }

    const handleCheck = (item) =>{
        
        let newCheck = checkedElements.slice()
        
        let temp
        if(newCheck.includes(item.key)) { 
            temp = newCheck.filter((check)=>{
                return check != item.key
            })
        

        } else {
            temp = [...newCheck, item.key]
        }
        
        if(!requires) {
            setRequiredPass({...requiredPass, [key]:true})
        } else {
            if (temp.length) {
                setRequiredPass({...requiredPass, [key]:true})
            } else {
                setRequiredPass({...requiredPass, [key]:false})
            }
        }
        setCheckedElements(temp)
        handleElementField(key, temp)
    }

    useEffect(()=>{
        console.log('checkedElements initial: ', checkedElements)
        console.log('defaultValue checkbox: ', defaultValue)
        setCheckedElements(defaultValue)
        handleElementField(key, defaultValue)
        setRequiredPass((oldValue) => {
            return {
            ...oldValue,
            [key]: true}});
    }, [defaultValue])

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            {
                checkboxesList.map((item, index) => {
                    return (
                        <TouchableOpacity style={styles.checkboxWrapper} onPress={() => {
                            handleCheck(item)
                        }}>{
                            checkedElements?.includes(item.key) ?
                                    <Image style={styles.checkboxChecked} source={require('../../../assets/checkbox-checked.png')} />
                                    :
                                    <Image style={styles.checkbox} source={require('../../../assets/checkbox.png')}
                                    />
                            }
                            <Text style={styles.checkboxText}>{item.value}</Text>
                        </TouchableOpacity>
                    )
                })
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(60),
    },
    label: {
        fontWeight: 'bold',
        marginTop: scale(5)
    },
    checkboxWrapper: {
        width: scale(700),
        height: scale(70),
        marginLeft: scale(15),
        marginTop: scale(15),
        marginBottom: scale(15),
        flexDirection: 'row'
    },
    checkbox: {
        width: scale(70),
        height: scale(70)
    },
    checkboxChecked: {
        width: scale(60),
        height: scale(60),
        marginLeft: scale(5)
    },
    checkboxText: {
        marginTop: scale(12),
        marginLeft: scale(30)
    }
})