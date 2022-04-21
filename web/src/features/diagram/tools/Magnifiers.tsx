import React from "react";

import {Button, IconButton} from "@material-ui/core";
import { ZoomIn, ZoomOut } from "@material-ui/icons";
import { graphContainer } from "../Diagram";

export function Magnifiers(props: any) {
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
        <IconButton onClick={() => handleZoomIn()}>
          <ZoomIn />
        </IconButton>
        <IconButton onClick={() => handleZoomOut()}>
          <ZoomOut />
        </IconButton>
        <Button onClick={() => handleResetZoom()}>RESET</Button>
      </div>
  );
}
