import React, {useState} from "react";

import styles from "./PersistenceInput.module.css";
import {saveThunk} from './persistenceSlice';
import {useAppDispatch} from '../../@app/hooks';
import {IconButton} from "@material-ui/core";
import {Save} from "@material-ui/icons";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";
import {updateDiagramPosition} from "../diagram/diagramPosition/diagramPositionSlice";
import {getDiagramPosition} from "../diagram/diagramPosition/diagramPositionHelpers";

export function PersistenceInput(props: any) {
  const dispatch = useAppDispatch();

  const [snackbarMessage, setSnackbarMessage] = useState('')

  const handleSave = () => {
    // TODO: Ideally, diagram position would be updated each time a user action (pan, zoom) modifies it
    //       But since we only use it at load time it's enough for now to update it only when we save the diagram
    dispatch(updateDiagramPosition(getDiagramPosition()));
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
