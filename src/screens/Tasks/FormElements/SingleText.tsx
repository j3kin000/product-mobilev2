import {
    StyleSheet,
    Text,
    View,
    I18nManager,
    TextInput
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { scale } from '../../../common/common'

export const SingleText = (props: any) => {


    const [changeText, setChangeText] = useState('')
    const { label, key } = props.itemData
    let {
        handleElementField,
        regex,
        requires,
        setRequiredPass,
        requiredPass,
        defaultValue
    } = props
    const [requiredError, setRequiredError] = useState(false)
    const isRtl = I18nManager.isRTL
    
    useEffect(() => {
        console.log('useEFFFFECCTTTTTTT----')
        setChangeText(defaultValue)
        handleElementField(key, defaultValue)
        setRequiredPass((oldValue) => {
            return {
            ...oldValue,
            [key]: true}});
    }, [defaultValue])
    
    return (
        <View style={styles.container}>
            <Text style={isRtl ? styles.labelRtl : styles.label}>{label ? label : null}</Text>

            <TextInput
                style={[styles.input, { borderColor: !requiredError ? 'lightgray' : 'red' }]}
                value={changeText}
                onChangeText={setChangeText}
                onBlur={() => {
                    if(!requires && !regex) {
                        setRequiredPass({...requiredPass, [key]:true})
                        console.log('111')
                    } else if(requires && !regex) {
                        if (changeText.length == 0) {
                            setRequiredError(true)
                            setRequiredPass({...requiredPass, [key]:false})
                            console.log('222')
                        } else {
                            setRequiredError(false)
                            setRequiredPass({...requiredPass, [key]:true})
                            console.log('333')
                        }
                    } else if (regex && !requires) {
                        if (changeText.match(regex)) {
                            setRequiredPass({...requiredPass, [key]:true})
                            setRequiredError(false)
                            console.log('444')
                        } else {
                            setRequiredError(true)
                            setRequiredPass({...requiredPass, [key]:false})
                            console.log('555')
                        }
                    } else {
                        if (changeText.match(regex) && changeText.length != 0) {
                            setRequiredPass({...requiredPass, [key]:true})
                            setRequiredError(false)
                            console.log('666')
                        } else {
                            setRequiredError(true)
                            setRequiredPass({...requiredPass, [key]:false})
                            console.log('777')
                        }
                    }

                    handleElementField(key, changeText)


                    props.focusComponent()
                }} />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(30)
    },
    input: {
        paddingBottom: scale(30),
        paddingLeft: scale(20),
        width: '90%',
        height: scale(100),
        backgroundColor: 'white',
        borderRadius: scale(30),
        borderColor: 'lightgray',
        borderWidth: scale(3),
    },
    label: {
        color: 'black',
        marginBottom: scale(10),
        textAlign: 'left'
    },
    labelRtl: {
        color: 'black',
        marginBottom: scale(10),
        textAlign: 'left'
    }
})