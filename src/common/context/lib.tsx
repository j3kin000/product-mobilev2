import React, { createContext } from 'react';
import { useTranslation } from 'react-i18next';

export const LibContext = createContext({});

export const LibProvider = ({ children }) => {
  const { t } = useTranslation();

  const parseValueForRender = (value): string => {
    const valueIsNull = value == null;
    const valueIsArray = Array.isArray(value);
    const valueIsObject = !valueIsNull && !valueIsArray && typeof value === 'object';
    const valueIsBoolean = typeof value === 'boolean';

    if (valueIsNull) return '';
    if (valueIsArray) return value.join(', ');
    if (valueIsObject) {
      return parseValueForRender(value.value);
    }

    if (valueIsBoolean) return t(value.toString().toLowerCase());

    return value.toString();
  };

  const props = {
    parseValueForRender,
  };

  return <LibContext.Provider value={props}>{children}</LibContext.Provider>;
};

