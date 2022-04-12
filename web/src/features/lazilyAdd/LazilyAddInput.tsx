// this is for testing. Will never be used in prod.
import React from "react";

import styles from "./LazilyAddInput.module.css";
import {lazilyAddMethodThunk} from './lazilyAddSlice';
import {useAppDispatch} from '../../@app/hooks';
import Button from "@material-ui/core/Button";
import {LazyMethod} from "./lazyMethod";
import {measureText} from "../diagram/text-measurer/TextMeasurer";
import {Method} from "../method/method";
import {Clazz} from "../clazz/clazz";
import {addClazz} from "../clazz/clazzSlice";

export function LazilyAddInput(props: any) {
  const dispatch = useAppDispatch();

  const handleLazilyAddMethod = (lazyMethod_: LazyMethod) => {
    // TODO: factorize with MethodInput.handleAddMethod and ClazzInput.handleCreateClazz
    let { width, height }: { width: number, height: number } = measureText(lazyMethod_.methodName, ['text-measurer-method']);
    width += 20;
    height += 20;
    let {
      width: clazzNameWidth,
      height: clazzNameHeight
    }: { width: number, height: number } = measureText(lazyMethod_.clazzName, ['clazz-text']);
    let {
      width: namespaceWidth,
      height: namespaceHeight
    }: { width: number, height: number } = measureText(lazyMethod_.namespace, ['clazz-text']);
    const textWidth = Math.max(clazzNameWidth, namespaceWidth) + 20;
    const textHeight = clazzNameHeight + namespaceHeight + 20;
    const lazyMethod: LazyMethod = { ...lazyMethod_, width, height };
    dispatch(lazilyAddMethodThunk(lazyMethod));
  }

  (window! as any).lazilyAddMethod = handleLazilyAddMethod;

  return (
      <Button variant="contained" className={styles.button} onClick={() => handleLazilyAddMethod({namespace: '', clazzName: 'YannicksBeautifulClassName', methodName: 'method22'})}>Lazily Add</Button>
  );
}
