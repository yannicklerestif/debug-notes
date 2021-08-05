import React from "react";
import {NamespaceInput} from "../namespace/NamespaceInput";
import {ClazzInput} from "../clazz/ClazzInput";
import {MethodInput} from "../method/MethodInput";
import {PersistenceInput} from "../persistence/PersistenceInput";
import {DeletionInput} from "../deletion/DeletionInput";

export function MyForm() {
  return (
    <div>
      <NamespaceInput />
      <ClazzInput />
      <MethodInput />
      <PersistenceInput />&nbsp;<DeletionInput />
    </div>
  );
}
