import {
    StyleSheet,
    Text,
    View
} from 'react-native'
import React, { useContext } from 'react'
import { scale } from '../../../common/common'

export const Markup = (props: any) => {

    let {
        label,
        value
    } = props.itemData

    return (
        <View style={styles.container}>
            <Text style={{ color: 'black' }}>{label}</Text>
            <Text>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(30),
        maxWidth: scale(600)
    }
})