import React from "react";
import {NamespaceInput} from "../namespace/NamespaceInput";
import {ClazzInput} from "../clazz/ClazzInput";
import {MethodInput} from "../method/MethodInput";
import {PersistenceInput} from "../persistence/PersistenceInput";
import {DeletionInput} from "../deletion/DeletionInput";
import styles from "./MyForm.module.css";
import Tools from "../diagram/tools/Tools";
import { Magnifiers } from "../diagram/tools/Magnifiers";
import {TextMeasurer} from "../diagram/text-measurer/TextMeasurer";
import {LazilyAddInput} from "../lazilyAdd/LazilyAddInput";
import {Clazz} from "../clazz/clazz";
import {Method} from "../method/method";
import {useAppSelector} from "../../@app/hooks";
import {selectClazzes} from "../clazz/clazzSlice";

export function MyForm() {
  const [formNamespace, setFormNamespace] = React.useState<string | null>(null);
  const [formClazz, setFormClazz] = React.useState<Clazz | null>(null);
  const [formMethod, setFormMethod] = React.useState<Method | null>(null);

  const clazzesMap: Record<string, Clazz> = useAppSelector(selectClazzes);

  const handleNamespaceChange = (namespace: string) => {
    setFormNamespace(namespace);
  }

  const handleClazzChange = (clazz: Clazz) => {
    setFormNamespace(clazz.namespace);
    setFormClazz(clazz);
  }

  const handleMethodChange = (method: Method) => {
    const clazz: Clazz = clazzesMap[method.classId];
    setFormNamespace(clazz.namespace);
    setFormClazz(clazz);
    setFormMethod(method);
  }

  return (
    <div className={styles.MyForm}>
      <NamespaceInput
        namespaceChangedCallback = {handleNamespaceChange}
        formNamespace = {formNamespace}
      />
      <ClazzInput
        clazzChangedCallback = {handleClazzChange}
        formNamespace = {formNamespace}
        formClazz = {formClazz}
      />
      <MethodInput
        methodChangedCallback = {handleMethodChange}
        formClazz = {formClazz}
        formMethod = {formMethod}
      />
      {/*<ArgumentInput />*/}
      <div className={styles.toolbar}>
        <PersistenceInput />
        <DeletionInput />
        <Tools />
        <Magnifiers />
        {/*Not shown, but useful because it receives inputs from outside
           when the application is embedded */}
        <LazilyAddInput />
      </div>
      <TextMeasurer />
    </div>
  );
}
