import { 
    StyleSheet,
     Text, 
     View, 
     Image, 
     I18nManager,
     TouchableOpacity
     } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { scale } from '../../../common/common'

export const RadioButton = (props: any) => {

    const {
        handleElementField,
        setRequiredPass,
        requiredPass,
        requires,
        defaultValue
    } = props

    const {
        label,
        key
    } = props.itemData

    const isRtl = I18nManager.isRTL

    const [radioState, setRadioState] = useState(null)

    let options = []

    for (let option in props.itemData.options) {
        let text = props.itemData.options[option]
        options.push({ option, text })
    }
    
    useEffect(()=>{
        setRadioState(defaultValue)
        handleElementField(key, defaultValue)
        setRequiredPass((oldValue) => {
            return {
            ...oldValue,
            [key]: true}});
    }, [defaultValue])

    useEffect(()=>{
        if(!requires) {
            setRequiredPass({...requiredPass, [key]:true})
        } else {
            if (radioState) {
                setRequiredPass({...requiredPass, [key]:true})
            } else {
                setRequiredPass({...requiredPass, [key]:false})
            }
        }
    }, [radioState])
    
    return (
        <View style={styles.container}>
            <Text style={isRtl ? styles.labelRtl : styles.label}>{label ? label : null}</Text>
            <View>
                {
                    options?.map((item, index) => {
                        return (
                            <TouchableOpacity style={[styles.radioWrapper, {}]} onPress={() => {
                                setRadioState(item.option)
                                handleElementField(key, item.option, true)
                            }}>
                                {radioState == item.option ?
                                    <Image style={styles.image} source={require('../../../assets/radio-button-checked.png')} />
                                    :
                                    <Image style={styles.image} source={require('../../../assets/radio-button.png')}
                                    />}
                                <Text style={ isRtl ? styles.textRtl : styles.text}>{item.text}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(30),
        width: scale(600),
        justifyContent: 'space-between',
    },
    label: {
        color: 'black',
        marginTop: scale(20),
        marginRight: scale(15)
    },
    labelRtl: {
        color: 'black',
        marginTop: scale(20),
        marginRight: scale(15),
        textAlign: 'left'
    },
    radioWrapper: {
        width: scale(400),
        height: scale(90),
        marginBottom: scale(30),
        flexDirection: 'row'
    },
    image: {
        width: scale(50),
        height: scale(50),
        alignSelf: 'center'
    },
    text: {
        alignSelf: 'center',
        fontWeight: 'bold',
        marginLeft: scale(20),
        width: '100%'
    },
    textRtl: {
        fontWeight: 'bold',
        marginLeft: scale(50),
        marginTop: scale(20)
    }
})