import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground
} from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { scale } from '../../../common/common'
import moment from "moment";
import { MarkupDone } from './MarkupDone';

export const Info = (props: any) => {
    
    const {
        label,
        inputType,
        key,
        value,
        imgFromAmazon
    } = props.itemData
    const data = props.wholeTask
    const getUserGroup = props.getUserGroup
    const outputTime = moment(value).format('DD/MM/YYYY HH:MM')
    
    switch(inputType){
        case "dateTimeRegister":
            return (
                value !== null ?
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        <View>
                            <Text style={styles.timeText}>{outputTime}</Text>
                        </View>
                    </View>
                </View>
                : null
            )
        case "cameraButton":
            return(
            Array.isArray(imgFromAmazon) ? 
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        {imgFromAmazon.map((img, i) => {
                            // console.log("III",img)
                            return (
                                <View>
                                    <ImageBackground style={styles.photoMinify} source={require("../../../assets/defImage.png")}>
                                        <Image style={styles.photoMinify} source={{uri : img}} key="{img}"/>
                                    </ImageBackground>
                                    {/* <Image style={styles.photoMinify} source={{uri : img}} key="{img}"/> */}
                                </View>
                            )
                        })}
                    </View>
                </View> :
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        <View>
                            <ImageBackground style={styles.photoMinify} source={require("../../../assets/defImage.png")}>
                                <Image style={styles.photoMinify} source={{uri : imgFromAmazon}}/>
                            </ImageBackground>
                        {/* <Image style={styles.photoMinify} source={{uri : imgFromAmazon}}/> */}
                        </View>
                    </View>
                </View>
            )
        case "radios":
            return(
                key !== 'continueExecution' ? value !== null ?
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        <View>
                            <Text style={styles.timeText}>{value}</Text>
                        </View>
                    </View>
                </View> : null : null
            ) 
        case "dropdown":
            return (
                value !== null ?
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        <View>
                            <Text style={styles.timeText}>{value}</Text>
                        </View>
                    </View>
                </View> : null
            )
        case "text":
            return (
                value !== null ? 
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        <View>
                            <Text style={styles.timeText}>{value}</Text>
                        </View>
                    </View>
                </View> : null
            )
        case "signature":
            return (
                value !== null ?
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <View style={styles.content}>
                            <Text style={styles.label}>{label}:</Text>
                        </View>
                        <View>
                            <Image style={styles.photoMinify} source={{uri : value}}/>
                        </View>
                    </View>
                </View> : null
            )
        case "markup":
            return (
                <View style={styles.container}>
                    <View style={styles.itemInfoWrapper}>
                        <MarkupDone
                            itemData={props.itemData}
                            wholeTask={data}
                            getUserGroup={getUserGroup}
                        />
                    </View>
                </View>
            )
        default:
            return null
    }
} 

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(70),
        width: '100%',
        flexDirection: 'row',
        borderTopLeftRadius: scale(25),
        borderBottomLeftRadius: scale(25),
        backgroundColor: '#F1FCFF'
    },
    itemInfoWrapper: {
        flexDirection: 'row',
        marginLeft: scale(20)
    },
    timeText: {
        marginTop: scale(25),
        marginLeft: scale(5),
        marginBottom: scale(25),
        color: 'black'
    },
    label: {
        color: 'black',
        marginRight: scale(15),
        width: scale(200),
        maxWidth: scale(300),
        justifyContent: 'center',
        alignItems: 'center'
    },
    photoMinify: {
        marginTop: scale(20),
        marginBottom: scale(20),
        height: 100,
        width: 100,
        marginRight: scale(30),
        flexWrap: 'wrap'
    },
    content:{
        height: '100%', 
        paddingTop: scale(20), 
        paddingBottom: scale(20)
    },
})