import React, {useState} from "react";
import TextField from '@material-ui/core/TextField';

import styles from "./NamespaceInput.module.css";
import {addNamespace} from './namespaceSlice';
import {useAppDispatch} from '../../@app/hooks';
import Button from "@material-ui/core/Button";
import {MySnackbar} from "../../@shared/snackbar/MySnackbar";

export function NamespaceInput(props: any) {
  const dispatch = useAppDispatch();

  const [newNamespace, setNewNamespace] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const handleNewNamespaceChange = (event: any) => {
    setNewNamespace(event.target.value);
  }

  const handleCreateNamespace = () => {
    dispatch(addNamespace(newNamespace));
    setSnackbarMessage('Namespace ' + newNamespace + ' successfully created');
    setNewNamespace('');
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateNamespace();
    }
  }

  return (
    <div>
      {/* namespace text field --------------------------------------------------- */}
      <TextField className={styles.textbox} id="namespace-create-text-field" label="Enter namespace name"
        value={newNamespace} onKeyPress={(event) => handleKeyPress(event)}
        onChange={(event) => handleNewNamespaceChange(event)}
      />
      {/* namespace creation button --------------------------------------------------- */}
      <Button variant="contained" onClick={() => handleCreateNamespace()}>Create Namespace</Button>
      <MySnackbar snackbarMessage={snackbarMessage} onSnackbarClosed={() => setSnackbarMessage('')} />
    </div>
  );
}
