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
        maxX = method.x! + method.width!;
        maxY = method.y! + method.height!;
        continue;
      }
      minX = Math.min(method.x!, minX);
      minY = Math.min(method.y!, minY);
      maxX = Math.max(method.x! + method.width!, maxX)
      maxY = Math.max(method.y! + method.height!, maxY)
    }
    if (minX == null || minY == null || maxX == null || maxY == null) {
      // empty class, discarding
      continue;
    }
    const diagramClazz = { ...clazz, x: minX - 10, y: minY - 40, width: maxX - minX + 20, height: maxY - minY + 50 };
    diagramClazzes[clazzId] = diagramClazz;
  }
  return {
    diagramCalls: state.call.byId,
    diagramClazzes,
    diagramMethods,
    selectedObjects: selectSelectedObjects(state),
  };
}
