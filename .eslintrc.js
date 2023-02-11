module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    quotes: [2, 'single', {avoidEscape: true, allowTemplateLiterals: true}],
    'prettier/prettier': ['error', {endOfLine: 'auto'}],
  },
};
