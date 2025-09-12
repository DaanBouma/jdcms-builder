import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { ChevronDown } from "lucide-react";
import { FieldPropsInternal } from "../..";
import React, { useState, useRef, useEffect } from "react";
const getClassName = getClassNameFactory("Input", styles);

export const SelectField = ({
  field,
  onChange,
  label,
  labelIcon,
  Label,
  value,
  name,
  readOnly,
  id,
}: FieldPropsInternal) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (field.type !== "select" || !field.options) {
    return null;
  }
  const selectedOption = field.options.find(opt => opt.value === value);

  return (
    <div className={getClassName("input-container")} ref={containerRef}>
      <label>
        {label}
      </label>
      <div
        className={
          getClassName("select") +
          (open ? " " + getClassName("dropdownOpen") : "")
        }
        tabIndex={0}
        onClick={() => !readOnly && setOpen((v) => !v)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            setOpen((v) => !v);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
      >
        <span>
          {selectedOption ? selectedOption.label : <span className={getClassName("placeholder")}>Selecteer...</span>}
        </span>
        <ChevronDown size={16} className={getClassName("chevronIcon")} />
      </div>
      {open && (
        <ul className={getClassName("dropdown")} role="listbox">
          {field.options.map((option) => (
            <li
              key={option.label + JSON.stringify(option.value)}
              className={
                getClassName("dropdownOption") +
                (option.value === value ? " " + getClassName("selected") : "")
              }
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
