import React from "react";
import {NamespaceInput} from "../namespace/NamespaceInput";
import {ClazzInput} from "../clazz/ClazzInput";
import {MethodInput} from "../method/MethodInput";
import {PersistenceInput} from "../persistence/PersistenceInput";
import {DeletionInput} from "../deletion/DeletionInput";
import styles from "./MyForm.module.css";
import Tools from "../diagram/tools/Tools";
import { Magnifiers } from "../diagram/tools/Magnifiers";

export function MyForm() {
  return (
    <div className={styles.MyForm}>
      <NamespaceInput />
      <ClazzInput />
      <MethodInput />
      <div className={styles.toolbar}>
        <PersistenceInput />
        <DeletionInput />
        <Tools />
        <Magnifiers />
      </div>
    </div>
  );
}
