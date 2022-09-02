import React, {useState} from "react";
import TextField from '@material-ui/core/TextField';

import {selectClazzes} from '../clazz/clazzSlice';
import {addMethod, selectMethods} from './methodSlice';
import {useAppSelector, useAppDispatch} from '../../@app/hooks';
import {Clazz} from "../clazz/clazz";
import {Method} from "./method";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";
import {measureText} from "../diagram/text-measurer/TextMeasurer";
import {Autocomplete, createFilterOptions} from "@material-ui/lab";

import styles from "./MethodInput.module.css";

const filter = createFilterOptions<MethodOptionType>();

interface MethodOptionType {
  inputValue?: string;
  method: Method
}

export function MethodInput(props: any) {
  const dispatch = useAppDispatch();

  const clazzesMap: Record<string, Clazz> = useAppSelector(selectClazzes);
  const methodsMap: Record<string, Method> = useAppSelector(selectMethods);

  const [snackbarMessage, setSnackbarMessage] = useState('')

  // TODO big hack.
  // formClazz in MyForm.tsx might be a fake class that doesn't contain a clazzId.
  // to make sure the class we get does have one, we find the actual class in the classes list we get from the store.
  const formClazz: Clazz | null = Object.values(clazzesMap)
    .find(clazz => clazz.namespace === props.formClazz?.namespace
      && clazz.clazzName === props.formClazz?.clazzName)
    || null;

  const methodsList: Method[] = Object.values(methodsMap).sort((a,b) => {
    const clazzA: Clazz = clazzesMap[a.classId];
    const clazzB: Clazz = clazzesMap[b.classId];
    const nsCompare: number = clazzA.namespace.localeCompare(clazzB.namespace);
    if (nsCompare !== 0)
      return nsCompare;
    const clazzCompare: number = clazzA.clazzName.localeCompare(clazzB.clazzName);
    if (clazzCompare !== 0)
      return clazzCompare;
    return a.methodName.localeCompare(b.methodName);
  });

  const methodsOptions: MethodOptionType[] = methodsList.map((method) => ({ method }));

  const handleCreateMethod = (clazzId: string, methodName: string) => {
    let {width, height}: { width: number, height: number } = measureText(methodName, ['text-measurer-method']);
    const method: Method = {
      height: height,
      width: width,
      x: undefined,
      y: undefined,
      methodId: undefined,
      methodName: methodName,
      classId: clazzId
    };
    dispatch(addMethod(method));
    setSnackbarMessage('Method ' + methodName + ' successfully created');
  }

  const formMethodOption = methodsOptions.find((option) =>
      option.method.classId === props.formMethod?.classId
      && option.method.methodName === props.formMethod?.methodName)
    || null;

  // TODO: see how to not pass all of this
  const createFakeMethod = (clazzId: string, methodName: string): Method => {
    return {
      classId: clazzId,
      methodName,
      methodId: undefined,
      x: undefined,
      y: undefined,
      width: 0,
      height: 0,
    }
  }

  const clazzLabel = (clazzId: string): string => {
    const clazz: Clazz = clazzesMap[clazzId];
    return `${clazz.namespace.charAt(0)}.${clazz.clazzName}`;
  }

  const createAndSelectMethod = (methodName: string) => {
    // don't do anything if no class is selected
    if (props.formClazz == null)
      return;
    // don't create the method if it already exists
    if (!methodsOptions.some(option => option.method.classId === formClazz?.clazzId! && option.method.methodName === methodName))
      handleCreateMethod(formClazz?.clazzId!, methodName);
    // TODO: replace by listening to new namespaces creation
    props.methodChangedCallback(createFakeMethod(formClazz?.clazzId!, methodName));
  }

  return (
    <div className={styles.MethodInput}>
      <Autocomplete
        autoHighlight
        classes={{ option: styles.AutoCompleteText, input: styles.AutoCompleteText }}
        value={formMethodOption}
        onChange={(event, newMethodOption, reason) => {
          if (newMethodOption == null)
            return;
          if (typeof newMethodOption === 'string') {
            // text was entered, then user pressed enter
            createAndSelectMethod(newMethodOption);
          } else if (newMethodOption && newMethodOption.inputValue) {
            // text was entered, then user clicked 'Add ...' from the dropdown
            createAndSelectMethod(newMethodOption.inputValue);
          } else {
            // one of the options was selected
            props.methodChangedCallback(newMethodOption.method);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          // Suggest the creation of a new value if it doesn't exist
          if (params.inputValue !== '' && !methodsOptions.some(
            option => option.method.classId === formClazz?.clazzId!
              && option.method.methodName === params.inputValue)) {
            console.log('will push a new "Add" item in the options. props: ', props);
            filtered.push({
              inputValue: params.inputValue,
              method: createFakeMethod(formClazz?.clazzId!, `Add "${params.inputValue}"`)
            });
          }
          return filtered;
        }}
        blurOnSelect
        clearOnBlur
        selectOnFocus
        handleHomeEndKeys
        id="free-solo-with-text-demo"
        options={methodsOptions}
        // label (inside the text input)
        getOptionLabel={(option) => {
          let label = '';
          if (option == null) {
            label = '';
          } else if (typeof option === 'string') {
            // Value selected with enter, right from the input
            label = option;
          } else if (option.inputValue) {
            // Add "xxx" option created dynamically
            label = option.inputValue;
          } else {
            // Regular option
            label = option.method.methodName;
          }
          return label;
        }}
        // render (in the dropdown)
        renderOption={(option) => {
          // Add "xxx" option created automatically
          if (option.inputValue != null && option.inputValue !== '') {
            if (props.formClazz == null)
              return `Please select a class to add method ${option.inputValue}`
            return `Add ${option.inputValue} to ${clazzLabel(formClazz?.clazzId!)}`
          }
          return `${clazzLabel(option.method.classId)}.${option.method.methodName}`
        }
        }
        style={{width: 300}}
        freeSolo
        renderInput={
          (params) => {
            return <TextField {...params} label="Method" variant="outlined"/>
          }
        }
        size="small"
      />
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')}/>
    </div>
  );
}
