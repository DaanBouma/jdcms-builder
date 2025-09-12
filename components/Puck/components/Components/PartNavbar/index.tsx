import React from "react"
import styles from "../../Fields/styles.module.css";
const getClassName = getClassNameFactory("PuckFields", styles);
import { getClassNameFactory } from "../../../../../lib";

export const PartNavbar = () => {
  return(
    <>
      <div className={getClassName("partsNavbar")}>
        <button className={getClassName("partsNavbar-icon")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <button className={getClassName("partsNavbar-icon")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
        <button className={getClassName("partsNavbar-button")}>
            Publish
        </button>
      </div>
    </>
  )
}
