import React from "react";
import styles from "./TextMeasurer.module.css";

export function TextMeasurer(props: any) {
  return (
    <span id="text-measurer" className={styles.TextMeasurer} />
  );
}

// http://jsfiddle.net/r491oe7z/2/
export const measureText =
  (text: string, classes: string[] = [], isHtml: boolean = false): { width: number, height: number } => {
    const div = document.getElementById("text-measurer")!
    // React changes class names so we find it again (hacky, admittedly)
    const textMeasurerClass = div.getAttribute('class')!.split(' ').find(clazz => clazz.startsWith('TextMeasurer'));
    div.setAttribute('class', [textMeasurerClass, ...classes].join(' '));

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
