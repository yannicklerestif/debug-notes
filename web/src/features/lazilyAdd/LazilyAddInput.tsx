import React from "react";

import styles from "./LazilyAddInput.module.css";
import {lazilyAddMethodThunk, lazilyAddCallThunk} from './lazilyAddSlice';
import {useAppDispatch} from '../../@app/hooks';
import Button from "@material-ui/core/Button";
import {LazyMethod} from "./lazyMethod";
import {measureText} from "../diagram/text-measurer/TextMeasurer";
import {LazyCall} from "./lazyCall";

export function LazilyAddInput(props: any) {
  const dispatch = useAppDispatch();

  const addTextDimensions = (lazyMethod: LazyMethod): LazyMethod => {
    // TODO: factorize with MethodInput.handleAddMethod and ClazzInput.handleCreateClazz
    let { width, height }: { width: number, height: number } = measureText(lazyMethod.methodName, ['text-measurer-method']);
    width += 20;
    height += 20;
    let {
      width: clazzNameWidth,
      height: clazzNameHeight
    }: { width: number, height: number } = measureText(lazyMethod.clazzName, ['clazz-text']);
    let {
      width: namespaceWidth,
      height: namespaceHeight
    }: { width: number, height: number } = measureText(lazyMethod.namespace, ['clazz-text']);
    const clazzTextWidth = Math.max(clazzNameWidth, namespaceWidth) + 20;
    const clazzTextHeight = clazzNameHeight + namespaceHeight + 20;
    return { ...lazyMethod, width, height, clazzTextWidth, clazzTextHeight };

  }

  const handleLazilyAddMethod = (lazyMethod_: LazyMethod) => {
    const lazyMethod = addTextDimensions(lazyMethod_);
    dispatch(lazilyAddMethodThunk(lazyMethod));
  }

  const handleLazilyAddCall = (lazyCall_: LazyCall) => {
    const sourceLazyMethod = addTextDimensions(lazyCall_.sourceMethod);
    const targetLazyMethod = addTextDimensions(lazyCall_.targetMethod);
    const lazyCall: LazyCall = {
      sourceMethod: sourceLazyMethod,
      targetMethod: targetLazyMethod
    }
    dispatch(lazilyAddCallThunk(lazyCall));
  }

  (window! as any).lazilyAddMethod = handleLazilyAddMethod;
  (window! as any).lazilyAddCall = handleLazilyAddCall;

  // the button is for testing. will never be used in prod.
  return (
      <div>
      <Button variant="contained" className={styles.button} onClick={() => handleLazilyAddMethod({
        namespace: 'SomeNewNamespace',
        clazzName: 'SomeNewClass',
        methodName: 'SomeNewMethodInTheNewClass'
      })}>+Method</Button>
      <Button variant="contained" className={styles.button} onClick={() => handleLazilyAddCall(
          {
            sourceMethod: {
              namespace: 'SomeNewSourceNamespace',
              clazzName: 'SomeNewSourceClass',
              methodName: 'SomeNewSourceMethodInTheNewClass'
            }, targetMethod: {
              namespace: 'SomeNewTargetNamespace',
              clazzName: 'SomeNewTargetClass',
              methodName: 'SomeNewTargetMethodInTheNewClass'
            }
          })}>+Call</Button>
      </div>
  );
}
