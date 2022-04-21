import React from "react";

import styles from "./DeletionInput.module.css";
import {deleteThunk} from './deletionSlice';
import {useAppDispatch} from '../../@app/hooks';
import Button from "@material-ui/core/Button";

export function DeletionInput(props: any) {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    dispatch(deleteThunk());
  }

  return (
      <Button variant="contained" className={styles.button} onClick={() => handleDelete()}>Delete</Button>
  );
}
