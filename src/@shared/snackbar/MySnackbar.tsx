import React, {useState} from "react";

import {Snackbar} from "@material-ui/core";
import {Alert} from "@material-ui/lab";

export function MySnackbar(props: any) {
  const [snackbarMessage, setSnackbarMessage] = useState('')

  if (props.snackbarMessage !== snackbarMessage) {
    console.log('changing state for my snackbar => ', props.snackbarMessage);
    setSnackbarMessage(props.snackbarMessage);
  }

  // TODO handle concurrent messages
  const closeSnackbar = () => {
    console.log('closing snackbar');
    setSnackbarMessage('');
    props.onSnackbarClosed();
  }

  return (
    <Snackbar open={snackbarMessage !== ''} autoHideDuration={3000} onClose={(event) => closeSnackbar()}>
      <Alert onClose={(event) => closeSnackbar()} severity="success">
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
}