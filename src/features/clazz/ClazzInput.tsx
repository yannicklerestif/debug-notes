import React, {useState} from "react";
import TextField from '@material-ui/core/TextField';

import styles from "./ClazzInput.module.css";
import {addClazz} from '../clazz/clazzSlice';
import {useAppSelector, useAppDispatch} from '../../@app/hooks';
import {FormControl} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from '@material-ui/core/Select';
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import {Clazz} from "./clazz";
import {selectNamespacesList} from "../namespace/namespaceSlice";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";
import {measureText} from "../diagram/text-measurer/TextMeasurer";

export function ClazzInput(props: any) {
  const dispatch = useAppDispatch();

  const [namespace, setNamespace] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const namespaces: string[] = useAppSelector(selectNamespacesList);

  const handleNamespaceChange = (event: any) => {
    const value = event.target.value;
    const selectedNamespace = value.substring('namespace_'.length);
    setNamespace(selectedNamespace);
  }

  const [newClazzName, setNewClazzName] = useState('');

  const handleNewClazzChange = (event: any) => {
    setNewClazzName(event.target.value);
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateClazz();
    }
  }

  const handleCreateClazz = () => {
    let { width: clazzNameWidth, height: clazzNameHeight }: { width: number, height: number } = measureText(newClazzName, ['clazz-text']);
    let { width: namespaceWidth, height: namespaceHeight }: { width: number, height: number } = measureText(namespace, ['clazz-text']);
    const textWidth = Math.max(clazzNameWidth, namespaceWidth) + 20;
    const textHeight = clazzNameHeight + namespaceHeight + 20;
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
    setNewClazzName('');
  }

  return (
    <div>
      {/* namespace selection ----------------------------------------------- */}
      <FormControl className={styles['namespace-select']}>
        <InputLabel id="namespace-select-label">Select Namespace</InputLabel>
        <Select
          labelId="namespace-select-label"
          id="namespace-select"
          value={'namespace_' + namespace}
          onChange={(event) => {
            handleNamespaceChange(event)
          }}>
          {namespaces.map(namespace => (
            <MenuItem
              value={'namespace_' + namespace}
              key={namespace}
            >
              {namespace === '' ? 'NONE' : namespace}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/*
       new class text field ----------------------------------------------- */}
      <TextField id="clazz-create-text-field" label="New Clazz"
                 className={styles.textbox}
                 value={newClazzName} onKeyPress={(event) => handleKeyPress(event)}
                 onChange={(event) => handleNewClazzChange(event)}
      />
      {/*
       class creation button ----------------------------------------------- */}
      <Button variant="contained" onClick={() => handleCreateClazz()}>Create Clazz</Button>
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')} />
    </div>
  );
}
