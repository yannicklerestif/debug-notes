import React, {useState} from "react";
import TextField from '@material-ui/core/TextField';

import styles from "./MethodInput.module.css";
import {selectClazzes} from '../clazz/clazzSlice';
import {addMethod} from './methodSlice';
import {useAppSelector, useAppDispatch} from '../../@app/hooks';
import {FormControl} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from '@material-ui/core/Select';
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import {Clazz} from "../clazz/clazz";
import {Method} from "./method";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";
import {measureText} from "../diagram/text-measurer/TextMeasurer";

export function MethodInput(props: any) {
  const dispatch = useAppDispatch();

  const clazzesMap: Record<string, Clazz> = useAppSelector(selectClazzes);

  const clazzes: Clazz[] = Object.values(clazzesMap).sort((a,b) => {
    const nsCompare: number = a.namespace.localeCompare(b.namespace);
    if (nsCompare !== 0)
      return nsCompare;
    return a.clazzName.localeCompare(b.clazzName);
  })

  const [clazzId, setClazzId] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const handleClazzChange = (event: any) => {
    const value = event.target.value;
    setClazzId(value);
  }

  const handleNewMethodChange = (event: any) => {
    setNewMethod(event.target.value);
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateMethod();
    }
  }

  const handleCreateMethod = () => {
    let { width, height }: { width: number, height: number } = measureText(newMethod, ['text-measurer-method']);
    width += 20;
    height += 20;
    const method: Method = {
      height: height,
      width: width,
      x: undefined,
      y: undefined,
      methodId: undefined,
      methodName: newMethod,
      classId: clazzId
    };
    console.log(`measuring text size for ${newMethod}`, measureText(newMethod, ['text-measurer-method']));
    dispatch(addMethod(method));
    setSnackbarMessage('Method ' + newMethod + ' successfully created');
    setNewMethod('');
  }

  return (
    <div>
      {/* clazz selection ---------------------------------------------*/}
      <FormControl className={styles['clazz-select']}>
        <InputLabel id="clazz-select-label">Select Clazz</InputLabel>
        <Select
          labelId="clazz-select-label"
          id="clazz-select"
          displayEmpty
          value={clazzId}
          onChange={(event) => {
            handleClazzChange(event)
          }}>
          {clazzes.map(clazz => (
            <MenuItem
              value={clazz.clazzId}
              key={clazz.clazzId}
            >
              {clazz.namespace + ' - ' + clazz.clazzName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField id="method-create-text-field" label="New Method"
                 className={styles.textbox}
        value={newMethod} onKeyPress={(event) => handleKeyPress(event)}
        onChange={(event) => handleNewMethodChange(event)}
      />
      <Button variant="contained" onClick={() => handleCreateMethod()}>Create Method</Button>
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')} />
    </div>
  );
}
