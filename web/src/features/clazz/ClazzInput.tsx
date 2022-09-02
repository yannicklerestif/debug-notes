import React, {useState} from "react";
import TextField from '@material-ui/core/TextField';

import {addClazz, selectClazzes} from '../clazz/clazzSlice';
import {useAppSelector, useAppDispatch} from '../../@app/hooks';
import {Clazz} from "./clazz";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";
import {measureText} from "../diagram/text-measurer/TextMeasurer";
import {Autocomplete, createFilterOptions} from "@material-ui/lab";

import styles from "./ClazzInput.module.css";

const filter = createFilterOptions<ClazzOptionType>();

interface ClazzOptionType {
  inputValue?: string;
  clazz: Clazz
}

export function ClazzInput(props: any) {
  const dispatch = useAppDispatch();

  const [snackbarMessage, setSnackbarMessage] = useState('')

  const clazzesMap: Record<string, Clazz> = useAppSelector(selectClazzes);

  const clazzesList: Clazz[] = Object.values(clazzesMap).sort((a,b) => {
    const nsCompare: number = a.namespace.localeCompare(b.namespace);
    if (nsCompare !== 0)
      return nsCompare;
    return a.clazzName.localeCompare(b.clazzName);
  });

  const clazzesOptions: ClazzOptionType[] = clazzesList.map((clazz) => ({ clazz }));

  const handleCreateClazz = (namespace: string, newClazzName: string) => {
    let { width: clazzNameWidth, height: clazzNameHeight }: { width: number, height: number } = measureText(newClazzName, ['clazz-text']);
    let { width: namespaceWidth, height: namespaceHeight }: { width: number, height: number } = measureText(namespace, ['clazz-text']);
    const textWidth = Math.max(clazzNameWidth, namespaceWidth);
    const textHeight = clazzNameHeight + namespaceHeight;
    const newClazz: Clazz = {
      clazzId: undefined,
      clazzName: newClazzName,
      namespace: namespace,
      x: undefined,
      y: undefined,
      textWidth,
      textHeight,
      width: undefined,
      height: undefined,
    }
    dispatch(addClazz(newClazz));
    setSnackbarMessage('Class ' + newClazzName + ' successfully created');
  }

  const formClazzOption = clazzesOptions.find((option) =>
      option.clazz.namespace === props.formClazz?.namespace
      && option.clazz.clazzName === props.formClazz?.clazzName)
    || null;

  // TODO: see how to not pass all of this
  const createFakeClazz = (namespace: string, clazzName: string): Clazz => {
    return {
      namespace,
      clazzName,
      clazzId: undefined,
      x: undefined,
      y: undefined,
      textWidth: 0,
      textHeight: 0,
      width: undefined,
      height: undefined,
    }
  }

  const createAndSelectClazz = (clazzName: string) => {
    // don't do anything if no namespace is selected
    if (props.formNamespace == null)
      return;
    // don't create the clazz if it already exists
    if (!clazzesOptions.some(option => option.clazz.namespace === props.formNamespace && option.clazz.clazzName === clazzName))
      handleCreateClazz(props.formNamespace, clazzName);
    // TODO: replace by listening to new namespaces creation
    props.clazzChangedCallback(createFakeClazz(props.formNamespace, clazzName));
  }

  return (
    <div className={styles.ClazzInput}>
      <Autocomplete
        autoHighlight
        value={formClazzOption}
        classes={{ option: styles.AutoCompleteText, input: styles.AutoCompleteText }}
        onChange={(event, newClazzOption, reason) => {
          if (newClazzOption == null)
            return;
          if (typeof newClazzOption === 'string') {
            // text was entered, then user pressed enter
            createAndSelectClazz(newClazzOption);
          } else if (newClazzOption && newClazzOption.inputValue) {
            // text was entered, then user clicked 'Add ...' from the dropdown
            createAndSelectClazz(newClazzOption.inputValue);
          } else {
            // one of the options was selected
            props.clazzChangedCallback(newClazzOption.clazz);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          // Suggest the creation of a new value if it doesn't exist
          if (params.inputValue !== '' && !clazzesOptions.some(
            option => option.clazz.namespace === props.formNamespace
              && option.clazz.clazzName === params.inputValue)) {
            filtered.push({
              inputValue: params.inputValue,
              // TODO: use createFakeClazz
              clazz: {
                // TODO: see how to not pass all of this
                namespace: props.formNamespace,
                clazzName: `Add "${params.inputValue}"`,
                clazzId: undefined,
                x: undefined,
                y: undefined,
                textWidth: 0,
                textHeight: 0,
                width: undefined,
                height: undefined,
              }
            });
          }
          return filtered;
        }}
        blurOnSelect
        clearOnBlur
        selectOnFocus
        handleHomeEndKeys
        id="free-solo-with-text-demo"
        options={clazzesOptions}
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
            label = option.clazz.clazzName;
          }
          return label;
        }}
        // render (in the dropdown)
        renderOption={(option) => {
          // Add "xxx" option created automatically
          if (option.inputValue != null && option.inputValue !== '') {
            if (props.formNamespace == null)
              return `Please select a namespace to add class ${option.inputValue}`
            return `Add ${option.inputValue} to ${option.clazz.namespace}`
          }
          return `${option.clazz.namespace}.${option.clazz.clazzName}`}
        }
        style={{width: 300}}
        freeSolo
        renderInput={
          (params) => {
            return <TextField {...params} label="Class" variant="outlined"/>
          }
        }
        size="small"
      />
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')} />
    </div>
  );
}
