import React from "react";

import {useAppSelector, useAppDispatch} from '../../@app/hooks';
import {selectSelectedCallsMethods} from "../selection/selectionSlice";
import {Call} from "../call/call";
import {Method} from "../method/method";

function computeSelectedCallsString(selectedCallsMethods: [Method,Method][]) {
  switch(selectedCallsMethods.length) {
    case 0:
      return "<NO CALL SELECTED>";
    case 1:
      const selectedCallMethods: [Method,Method] = selectedCallsMethods[0];
      return `${selectedCallMethods[0].methodName} -> ${selectedCallMethods[1].methodName}`;
    default:
      return "<MULTIPLE CALLS SELECTED>";
  }
}

export function ArgumentInput(props: any) {

  const dispatch = useAppDispatch();

  const selectedCallsMethods: [Method,Method][] = useAppSelector(selectSelectedCallsMethods);
  const selectedCallsString = computeSelectedCallsString(selectedCallsMethods);
  return (
    <div>
      <span>{selectedCallsString}</span>
    </div>
  );
}
