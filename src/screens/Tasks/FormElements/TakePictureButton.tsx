import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native'
import React, { useState } from 'react'
import { scale } from '../../../common/common'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadPhotoFromAmazon } from '../../../api/index'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'

export const TakePictureButton = (props: any) => {

    const { t, i18n } = useTranslation()

    const {
        label,
        key
    } = props.itemData

    const {
        handleElementField,
        taskId,
        setRequiredPass,
        requiredPass,
        requires    
    } = props


    const [localGallery, setLocalGallery] = useState([])
    const [localPushGallery, setLocalPushGallery] = useState([])

    const openCamera = async () => {

        const IdToken = await AsyncStorage.getItem('IdToken')

        const image = launchCamera({
            title: 'Select Image',
            customButtons: [
                {
                    name: 'customOptionKey',
                    title: 'Choose file from Custom Option'
                },
            ],
            includeBase64: true,
            storageOptions: {
                skipBackup: true,
                path: 'images',
                didCancel: true
            },
        }, res => {
            if (!res.didCancel) {

                let name = res.assets[0].fileName
                let path = res.assets[0].uri
                let base64 = res.assets[0].base64
                let smth = localGallery.slice()
                let smth2 = localPushGallery.slice()

                smth.push({
                    name: name,
                    base64: base64
                })

                if(!requires) {
                    setRequiredPass({...requiredPass, [key]:true})
                } else {
                    if (smth.length) {
                        setRequiredPass({...requiredPass, [key]:true})
                    } else {
                        setRequiredPass({...requiredPass, [key]:false})
                    }
                }

                handleElementField(key, [...smth2, name])
                smth2.push(name)

                setLocalGallery(smth)
                setLocalPushGallery(smth2)
                uploadPhotoFromAmazon(IdToken, `${taskId}/` + name, path)
            }
        })

    }

    const openGallery = async () => {

        const IdToken = await AsyncStorage.getItem('IdToken')

        const image = launchImageLibrary({
            title: 'Select Image',
            customButtons: [
                {
                    name: 'customOptionKey',
                    title: 'Choose file from Custom Option'
                },
            ],
            includeBase64: true,
            storageOptions: {
                skipBackup: true,
                path: 'images',
                didCancel: true
            },
        }, res => {
            if (!res.didCancel) {
                let name = res.assets[0].fileName
                let path = res.assets[0].uri
                let base64 = res.assets[0].base64
                let smth = localGallery.slice()
                let smth2 = localPushGallery.slice()

                smth.push({
                    name: name,
                    base64: base64
                })

                if(!requires) {
                    setRequiredPass({...requiredPass, [key]:true})
                } else {
                    if (smth.length) {
                        setRequiredPass({...requiredPass, [key]:true})
                    } else {
                        setRequiredPass({...requiredPass, [key]:false})
                    }
                }

                handleElementField(key, [...smth2, name])
                smth2.push(name)

                setLocalGallery(smth)
                setLocalPushGallery(smth2)
                uploadPhotoFromAmazon(IdToken, `${taskId}/` + name, path)
            }
        })

    }

    const showConfirmDialog = (name) => {
        return Alert.alert(
            t('areYouSure'),
            t("areYouSureYouWantToRemoveThisPhoto"),
            [
                {
                    text: "Yes",
                    onPress: () => {
                        deleteItem(name)
                    },
                },
                {
                    text: "No",
                },
            ]
        );
    }
    const deleteItem = (name) => {
        let itemToDelete = localGallery.filter((item) => {
            return item.name != name
        })
        setLocalGallery(itemToDelete)

        let itemPushToDelete = localPushGallery.filter((item) => {
            return item != name
        })
        setLocalPushGallery(itemPushToDelete)
        handleElementField(key, itemPushToDelete)
        props.focusComponent()
    }

    const [opened, setOpened] = useState(false)

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.btn} onPress={() => {
                setOpened(!opened)
            }}>
                <Image style={styles.ico} source={require('../../../assets/camera-ico.png')} />
                <Text style={styles.text}>{label}</Text>
            </TouchableOpacity>
            {
                opened ?
                    <View>
                        <TouchableOpacity style={styles.takePhotoWrapper} onPress={() => {
                            openCamera()
                            setOpened(false)
                        }}>
                            <Text style={styles.pickerText}>{t('takePhoto')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.openGalleryWrapper} onPress={() => {
                            openGallery()
                            setOpened(false)
                        }}>
                            <Text style={styles.pickerText}>{t('openGallery')}</Text>
                        </TouchableOpacity>
                    </View> : null

            }

            
            {
                localGallery.length ?
                    <ScrollView horizontal={true} style={styles.scrollView} showsHorizontalScrollIndicator={false}>
                        {
                            localGallery.map((item) => {
                                let imageUri = 'data:image/png;base64,' + item.base64
                                return (
                                    <TouchableOpacity style={styles.minifyImageCell} onPress={() => {
                                        showConfirmDialog(item.name)
                                    }}>
                                        <Image style={styles.cross} source={require("../../../assets/remove.png")} />
                                        <Image style={styles.photoMinify} source={{ uri: imageUri }} />
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView> : null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(60)
    },
    takePhotoWrapper: {
        marginTop: scale(40),
        marginBottom: scale(20),
        width: scale(350),
        height: scale(80),
        backgroundColor: '#E6E6E3',
        borderRadius: scale(20),
        paddingTop: scale(15),
        paddingLeft: scale(20)
    },
    openGalleryWrapper: {
        width: scale(350),
        height: scale(80),
        backgroundColor: '#E6E6E3',
        borderRadius: scale(20),
        paddingTop: scale(15),
        paddingLeft: scale(20)
    },
    pickerText: {
        // textDecorationLine: 'underline',
        color: 'black'
    },
    btn: {
        backgroundColor: '#3ABEE0',
        width: scale(350),
        height: scale(80),
        borderRadius: scale(15),
        marginTop: scale(10),
        flexDirection: 'row'
    },
    text: {
        color: 'white',
        marginTop: scale(15),
        marginLeft: scale(15)
    },
    ico: {
        width: scale(40),
        height: scale(35),
        marginTop: scale(18),
        marginLeft: scale(28)
    },
    scrollView: {
        marginTop: scale(30),
        width: scale(580),
        height: scale(180)
    },
    photoMinify: {
        marginTop: scale(20),
        height: '80%',
        width: scale(130),
        marginRight: scale(30)
    },
    cross: {
        width: scale(50),
        height: scale(50),
        position: 'absolute',
        zIndex: 999,
        right: scale(10),
        // top: scale(-10)
    },
    minifyImageCell: {

    }
})