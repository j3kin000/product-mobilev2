import React, { useEffect } from 'react'
import {
  View,
  PermissionsAndroid
} from 'react-native'
import Geolocation from 'react-native-geolocation-service';

export const Geo = React.forwardRef((props: any, ref) => {

  const { key } = props.itemData
  const { handleElementField } = props

  useEffect(() => {
    Geolocation.getCurrentPosition(async(info) =>  {
        try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                'title': 'Milgam App',
                'message': 'Allow access to your location.'
              }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                handleElementField(key, info)
            } else {
              alert("Location permission denied");
            }
          } catch (err) {
            console.warn(err)
          }
    })
  }, [])



  return (<View ref={ref} style={{ display: 'none' }}></View>)
})

