import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { scale } from '../../common/common'
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from "react-i18next";

export const Splash = () => {

    const navigation = useNavigation()
    const { t, i18n } = useTranslation()

    return (
        <View style={styles.container}>
            <Image style={styles.bgShapes} source={require('../../assets/splash-shapes.png')} />
            <Image style={styles.logo} source={require('../../assets/new-logo.png')} />
            <TouchableOpacity style={styles.btn} onPress={() => {
                navigation.navigate('Login')
            }}>
                <Text style={styles.btnText}>{t('getStarted')}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    bgShapes: {
        width: '100%',
        height: "100%",
        position: 'absolute',
        bottom: 0
    },
    logo: {
        width: scale(460),
        height: scale(190),
        alignSelf: 'center',
        marginTop: scale(320)
    },
    btn: {
        width: scale(450),
        height: scale(130),
        borderRadius: scale(70),
        backgroundColor: '#00A7D3',
        alignSelf: 'center',
        position: 'absolute',
        bottom: scale(60)
    },
    btnText: {
        alignSelf: 'center',
        color: 'white',
        marginTop: scale(35),
        fontWeight: 'bold',
        fontSize: scale(40)
    }
})