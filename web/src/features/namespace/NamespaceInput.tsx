import React, {useState} from "react";
import TextField from '@material-ui/core/TextField';

import {addNamespace, selectNamespacesList} from './namespaceSlice';
import {useAppDispatch, useAppSelector} from '../../@app/hooks';
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";
import {Autocomplete, createFilterOptions} from "@material-ui/lab";

import styles from "./NamespaceInput.module.css";

const filter = createFilterOptions<NamespaceOptionType>();

interface NamespaceOptionType {
  inputValue?: string;
  name: string;
}

export function NamespaceInput(props: any) {
  const dispatch = useAppDispatch();

  const [snackbarMessage, setSnackbarMessage] = useState('')

  const namespacesList = useAppSelector(selectNamespacesList);
  const namespacesOptions: NamespaceOptionType[] = namespacesList.map(ns => ({ name: ns }));

  const handleCreateNamespace = (ns: string) => {
    dispatch(addNamespace(ns));
    setSnackbarMessage('Namespace ' + ns + ' successfully created');
  }

  // may be null
  const formNamespaceOption = namespacesOptions.find((option) => option.name === props.formNamespace) || null;

  return (
    <div className={styles.NamespaceInput}>
      <Autocomplete
        autoHighlight
        blurOnSelect
        classes={{ option: styles.AutoCompleteText, input: styles.AutoCompleteText }}
        clearOnBlur
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          // Suggest the creation of a new value if it doesn't exist
          // console.log('value', value, 'params.inputValue', params.inputValue, 'params', params);
          if (params.inputValue !== '' && !namespacesOptions.some(nsOption => nsOption.name === params.inputValue)) {
            filtered.push({
              inputValue: params.inputValue,
              name: `Add "${params.inputValue}"`,
            });
          }
          return filtered;
        }}
        freeSolo
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
            label = option.name;
          }
          if (label === '')
            return 'NONE';
          return label;
        }}
        handleHomeEndKeys
        id="free-solo-with-text-demo"
        onChange={(event, newNamespaceOption, reason) => {
          if (newNamespaceOption == null)
            return;
          if (typeof newNamespaceOption === 'string') {
            // text was entered, then user pressed enter
            // if the namespace already exists, just select it
            // TODO: replace by listening to new namespaces creation
            props.namespaceChangedCallback(newNamespaceOption);
            if (namespacesOptions.some(nsOption => nsOption.name === newNamespaceOption))
              return;
            handleCreateNamespace(newNamespaceOption);
          } else if (newNamespaceOption && newNamespaceOption.inputValue) {
            // text was entered, then user clicked 'Add ...' from the dropdown
            // we know it is new
            handleCreateNamespace(newNamespaceOption.inputValue);
            // TODO: replace by listening to new namespaces creation
            props.namespaceChangedCallback(newNamespaceOption.inputValue);
          } else {
            // one of the options was selected
            props.namespaceChangedCallback(newNamespaceOption.name);
          }
        }}
        options={namespacesOptions}
        renderOption={(option) => option.name === '' ? 'NONE' : option.name}
        style={{width: 300}}
        renderInput={
          (params) => {
            // console.log('rendering input', params);
            return <TextField {...params} label="Namespace" variant="outlined"/>
          }
        }
        selectOnFocus
        size="small"
        value={formNamespaceOption}
      />
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')}/>
    </div>
  );
}
