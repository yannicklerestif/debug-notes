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
import {ArgumentInput} from "../argument/ArgumentInput";

export function MyForm() {
  return (
    <div className={styles.MyForm}>
      <NamespaceInput />
      <ClazzInput />
      <MethodInput />
      <ArgumentInput />
      <div className={styles.toolbar}>
        <PersistenceInput />
        <DeletionInput />
        <Tools />
        <Magnifiers />
      </div>
      <TextMeasurer />
    </div>
  );
}
