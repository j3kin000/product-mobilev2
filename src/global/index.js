export {
  getDispatch,
  getGlobal, // const token = getGlobal().auth.token
  resetGlobal, // resetGlobal()
  setGlobal, // setGlobal({ value: 3 })
  useGlobal, // const [count, setCount] = useGlobal('count')
  withInit, // withInit(INITIAL_STATE, INITIAL_REDUCERS)(AppComponent)
  withGlobal,
} from 'reactn';
