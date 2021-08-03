import React from "react";

import styles from "./PersistenceInput.module.css";
import {saveThunk} from './persistenceSlice';
import {useAppDispatch} from '../../@app/hooks';
import Button from "@material-ui/core/Button";

export function PersistenceInput(props: any) {
  const dispatch = useAppDispatch();

  const handleSave = () => {
    dispatch(saveThunk());
  }

  return (
    <div>
      <Button variant="contained" className={styles.button} onClick={() => handleSave()}>Save</Button>
    </div>
  );
}
