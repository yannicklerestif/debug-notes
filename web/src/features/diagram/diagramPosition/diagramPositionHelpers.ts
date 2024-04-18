import {graphContainer} from "../Diagram";
import {DiagramPosition} from "./diagramPosition";

export function getDiagramPosition(): DiagramPosition {
  return {
    x: graphContainer.graph!.scroller.widget?.getVisibleArea().x!,
    y: graphContainer.graph!.scroller.widget?.getVisibleArea().y!,
    zoom: 0
  };
}

export function setDiagramPosition(diagramPosition: DiagramPosition): void {
  // scrollToPoint sets the center of the viewport but diagram position sets the left / top position
  // (this is because we know this starts at (0,0), while the center will depend on the viewport size)
  // so we need to compute the center of the viewport to know what to scroll to
  const visibleArea = graphContainer.graph!.scroller.widget?.getVisibleArea();
  const centerX = diagramPosition.x + visibleArea!.width / 2;
  const centerY = diagramPosition.y + visibleArea!.height / 2;
  graphContainer.graph!.scrollToPoint(centerX, centerY);
}
