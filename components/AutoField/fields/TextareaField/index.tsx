import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { Type } from "lucide-react";
import { FieldPropsInternal } from "../..";
import React from "react";
const getClassName = getClassNameFactory("Input", styles);

export const TextareaField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  label,
  labelIcon,
  Label,
  id,
}: FieldPropsInternal) => {
  return (
      <textarea
        id={id}
        className={getClassName("textarea")}
        autoComplete="off"
        name={name}
        value={typeof value === "undefined" ? "" : value}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        rows={3}
        placeholder={field.type === "textarea" ? field.placeholder : undefined}
      />
  );
};
