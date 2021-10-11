import React from "react";
import styles from "./TextMeasurer.module.css";

export function TextMeasurer(props: any) {
  return (
    <div id="text-measurer" className={styles['text-measurer']} />
  );
}

// http://jsfiddle.net/r491oe7z/2/
export const measureText =
  (text: string, classes: string[] = [], isHtml: boolean = false): { width: number, height: number } => {
    const div = document.getElementById("text-measurer")!
    // TODO add classes
    //  div.setAttribute('class', classes.join(' '));

    if (isHtml) {
      div.textContent = text;
    } else {
      div.innerHTML = text;
    }

    return {
      width: div.offsetWidth,
      height: div.offsetHeight
    };
  };