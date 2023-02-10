import {
    StyleSheet,
    Text,
    View,
    I18nManager,
    TextInput
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { scale } from '../../../common/common'

export const TextForm = (props: any) => {

    const [changeText, setChangeText] = useState('')
    const { label, key } = props.itemData
    const {
        handleElementField,
        regex,
        requires,
        setRequiredPass,
        requiredPass,
        defaultValue
    } = props

    const isRtl = I18nManager.isRTL
    const [match, setMatch] = useState(true)
    const [requiredError, setRequiredError] = useState(false)
    
    useEffect(() => {
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
                multiline={true}
                style={[styles.input, { borderColor: match && !requiredError ? 'lightgray' : 'red' }]}
                value={changeText}
                onChangeText={setChangeText}
                onBlur={() => {
                    if (!requires && !regex) {
                        setRequiredPass({ ...requiredPass, [key]: true })
                        console.log('111')
                    } else if (requires && !regex) {
                        if (changeText.length == 0) {
                            setRequiredError(true)
                            setRequiredPass({ ...requiredPass, [key]: false })
                            console.log('222')
                        } else {
                            setRequiredError(false)
                            setRequiredPass({ ...requiredPass, [key]: true })
                            console.log('333')
                        }
                    } else if (regex && !requires) {
                        if (changeText.match(regex)) {
                            setRequiredPass({ ...requiredPass, [key]: true })
                            setRequiredError(false)
                            console.log('444')
                        } else {
                            setRequiredError(true)
                            setRequiredPass({ ...requiredPass, [key]: false })
                            console.log('555')
                        }
                    } else {
                        if (changeText.match(regex) && changeText.length != 0) {
                            setRequiredPass({ ...requiredPass, [key]: true })
                            setRequiredError(false)
                            console.log('666')
                        } else {
                            setRequiredError(true)
                            setRequiredPass({ ...requiredPass, [key]: false })
                            console.log('777')
                        }
                    }
                    handleElementField(key, changeText)
                }
                } />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(30)
    },
    input: {
        paddingBottom: scale(10),
        paddingLeft: scale(20),
        width: '90%',
        height: scale(320),
        backgroundColor: 'white',
        textAlignVertical: 'top',
        borderRadius: scale(30),
        borderColor: 'lightgray',
        borderWidth: scale(3)
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