import React from "react";

import IconButton from "@mui/material/IconButton";
import {CenterFocusStrongOutlined, ZoomIn, ZoomOut} from "@mui/icons-material";
import { graphContainer } from "../Diagram";

import styles from './DiagramPosition.module.css';

export function DiagramPositionInput(props: any) {
  const handleZoomIn = () => {
    graphContainer.graph!.zoom(0.2);
  }

  const handleZoomOut = () => {
    graphContainer.graph!.zoom(-0.2);
  }

  function handleResetZoom() {
    graphContainer.graph!.zoomTo(1.0);
  }

  return (
      <div>
        <IconButton  size='small' className={styles.button} onClick={() => handleZoomIn()}>
          <ZoomIn />
        </IconButton>
        <IconButton  size='small' className={styles.button} onClick={() => handleZoomOut()}>
          <ZoomOut />
        </IconButton>
        <IconButton  size='small' className={styles.button} onClick={() => handleResetZoom()}>
          <CenterFocusStrongOutlined />
        </IconButton>
      </div>
  );
}
