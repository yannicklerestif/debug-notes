import React, {useState} from "react";

import styles from "./PersistenceInput.module.css";
import {saveThunk} from './persistenceSlice';
import {useAppDispatch} from '../../@app/hooks';
import {IconButton} from "@material-ui/core";
import {Save} from "@material-ui/icons";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";

export function PersistenceInput(props: any) {
  const dispatch = useAppDispatch();

  const [snackbarMessage, setSnackbarMessage] = useState('')

  const handleSave = () => {
    dispatch(saveThunk());
    setSnackbarMessage('Saved!');
  }

  return (
    <div>
      <IconButton className={styles.button} size='small' onClick={() => handleSave()}>
        <Save />
      </IconButton>
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')}/>
    </div>
  );
}
