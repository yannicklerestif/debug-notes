import React from "react";

import styles from "./PersistenceInput.module.css";
import {saveThunk} from './persistenceSlice';
import {useAppDispatch} from '../../@app/hooks';
import {IconButton} from "@material-ui/core";
import {Save} from "@material-ui/icons";

export function PersistenceInput(props: any) {
  const dispatch = useAppDispatch();

  const handleSave = () => {
    dispatch(saveThunk());
  }

  return (
    <IconButton className={styles.button} size='small' onClick={() => handleSave()}>
      <Save />
    </IconButton>
  );
}
