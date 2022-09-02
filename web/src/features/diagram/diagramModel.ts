import {RootState} from "../../@app/store";
import {Method} from "../method/method";
import {Clazz} from "../clazz/clazz";
import {selectSelectedObjects} from "../selection/selectionSlice";

export const selectDiagramModel = (state: RootState) => {
  const diagramMethods: Record<string, Method> = {};
  const diagramClazzes: Record<string, Clazz> = {};
  for (let clazzId in state.clazz.byId) {
    const clazz = state.clazz.byId[clazzId];
    let minX = undefined, minY = undefined, maxX = undefined, maxY = undefined;
    for (let methodId in state.method.byClassId[clazzId]) {
      const method = state.method.byId[methodId];
      diagramMethods[methodId] = method;
      if (minX == null || minY == null || maxX == null || maxY == null) {
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
    if (minX == null || minY == null || maxX == null || maxY == null) {
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
    diagramCalls: state.call.byId,
    diagramClazzes,
    diagramMethods,
    selectedObjects: selectSelectedObjects(state),
  };
}
