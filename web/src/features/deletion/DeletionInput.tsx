import React from "react";

import styles from "./DeletionInput.module.css";
import {deleteThunk} from './deletionSlice';
import {useAppDispatch} from '../../@app/hooks';
import {IconButton} from "@material-ui/core";
import {Delete} from "@material-ui/icons";

export function DeletionInput(props: any) {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    dispatch(deleteThunk());
  }

  return (
    <IconButton className={styles.button} size='small' onClick={() => handleDelete()}>
      <Delete />
    </IconButton>
  );
}
