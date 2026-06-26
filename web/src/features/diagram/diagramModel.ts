import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "../../@app/store";
import {Method} from "../method/method";
import {Clazz} from "../clazz/clazz";
import {selectSelectedObjects} from "../selection/selectionSlice";
import {selectDiagramPosition} from "./diagramPosition/diagramPositionSlice";

export const selectDiagramModel = createSelector(
  [
    (state: RootState) => state.clazz.byId,
    (state: RootState) => state.method.byClassId,
    (state: RootState) => state.method.byId,
    (state: RootState) => state.call.byId,
    selectSelectedObjects,
    selectDiagramPosition,
  ],
  (clazzesById, methodsByClassId, methodsById, callsById, selectedObjects, diagramPosition) => {
  const diagramMethods: Record<string, Method> = {};
  const diagramClazzes: Record<string, Clazz> = {};
  for (let clazzId in clazzesById) {
    const clazz = clazzesById[clazzId];
    let minX: number | undefined = undefined;
    let minY: number | undefined = undefined;
    let maxX: number | undefined = undefined;
    let maxY: number | undefined = undefined;
    for (let methodId in methodsByClassId[clazzId]) {
      const method = methodsById[methodId];
      diagramMethods[methodId] = method;
      if (minX === undefined || minY === undefined || maxX === undefined || maxY === undefined) {
        minX = method.x!;
        minY = method.y!;
        maxX = method.x! + method.width! + 3 + 40 + 10 + 3; // 40 for link on the left, 10 for padding on the right,
                                                            // 3 * 2 additional padding for calls anchors
        maxY = method.y! + method.height! + 20; // 20 for padding
        continue;
      }
      minX = Math.min(method.x!, minX);
      minY = Math.min(method.y!, minY);
      maxX = Math.max(method.x! + method.width! + 3 + 40 + 10 + 3, maxX)
      maxY = Math.max(method.y! + method.height! + 20, maxY)
    }
    if (minX === undefined || minY === undefined || maxX === undefined || maxY === undefined) {
      // empty class, discarding
      continue;
    }
    const diagramClazz: Clazz = {
      ...clazz,
      x: minX - 10, // -10 for padding around methods
      y: minY - clazz.textHeight - 20, // -20 for padding around clazz text
      // 40 + 10: link + padding on the right. 20: padding around methods
      width: Math.max(clazz.textWidth + 40 + 10, maxX - minX + 20),
      height: maxY - minY + clazz.textHeight + 20 + 10 // 20 + 10: padding around clazz text + bottom padding around methods
    };
    diagramClazzes[clazzId] = diagramClazz;
  }
  return {
    diagramCalls: callsById,
    diagramClazzes,
    diagramMethods,
    selectedObjects,
    diagramPosition
  };
});
