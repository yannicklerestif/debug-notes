import React from "react";
import {NamespaceInput} from "../namespace/NamespaceInput";
import {ClazzInput} from "../clazz/ClazzInput";
import {MethodInput} from "../method/MethodInput";

export function MyForm() {
  return (
    <div>
      <NamespaceInput />
      <ClazzInput />
      <MethodInput />
    </div>
  );
}