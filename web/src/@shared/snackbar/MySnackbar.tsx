import React, {useState} from "react";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export function MySnackbar(props: any) {
  const [snackbarMessage, setSnackbarMessage] = useState('')

  if (props.snackbarMessage !== snackbarMessage) {
    setSnackbarMessage(props.snackbarMessage);
  }

  // TODO handle concurrent messages
  const closeSnackbar = () => {
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
