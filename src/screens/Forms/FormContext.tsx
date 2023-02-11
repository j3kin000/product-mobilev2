import React, {useState, createContext} from 'react';

export const FormContext = createContext({});

export const FormProvider = ({children}) => {
  const [open, setOpen] = useState();
  const [dateValue, setDateValue] = useState();
  const [actionsQ, setActionsQ] = useState([]);

  const [requiredButEmptyFields, setRequiredButEmptyFields] = useState([]);

  const checkRequiredFields = (
    fields: any[],
    currentValues: Record<string, any>,
  ): string[] => {
    const notRequired = [
      'markup',
      'printButton',
      'button',
      'geo',
      'autocomplete',
    ];

    const requiredFields = fields.filter(
      item =>
        !notRequired.includes(item.inputType) &&
        item.rules?.required &&
        Object.keys(currentValues).includes(item.key),
    );

    const res = requiredFields.reduce((acc, curr) => {
      const {key} = curr;

      const currentValue = currentValues[key];

      const isEmptyArray =
        Array.isArray(currentValue) && currentValue.length < 1;

      const isFalsy = currentValue === '' || currentValue == null;

      if (isEmptyArray || isFalsy) {
        acc = [...acc, key];
      }

      return acc;
    }, []);

    return res;
  };

  const props = {
    checkRequiredFields,
    requiredButEmptyFields,
    setRequiredButEmptyFields,
    open,
    setOpen,
    dateValue,
    setDateValue,
    actionsQ,
    setActionsQ,
  };

  return <FormContext.Provider value={props}>{children}</FormContext.Provider>;
};
