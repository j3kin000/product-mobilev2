import { View } from 'react-native'
import React, { useState, useContext } from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FormContext } from '../FormContext';

export const DateTimePicker = React.forwardRef((props: any, ref) => {

    const [timeNow, setTimeNow] = useState(null)

    const { open, setOpen, setDateValue, actionsQ, setActionsQ } = useContext(FormContext)

    const showDatePicker = () => {
        setOpen(true);
    };

    const hideDatePicker = () => {
        setOpen(false);
    };

    const handleConfirm = (date) => {
        setTimeNow(date.toLocaleDateString() + ' ' + date.toLocaleTimeString())
        setDateValue(date.toLocaleDateString() + ' ' + date.toLocaleTimeString())
        if(props.onSelect) props.onSelect(date.toLocaleDateString() + ' ' + date.toLocaleTimeString())
        if(actionsQ.length > 0) {
            const dup = actionsQ.slice()
            const action = dup.shift()
            action(date.toLocaleDateString() + ' ' + date.toLocaleTimeString())
            setActionsQ(dup)
        }
        hideDatePicker();
    };

    return (
        <View ref={ref}>
            <DateTimePickerModal
                isVisible={open}
                mode="datetime"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
        </View>
    )
})
