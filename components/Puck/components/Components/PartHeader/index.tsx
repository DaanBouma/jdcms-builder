import React from "react";
import styles from "../../Fields/styles.module.css";
import { getClassNameFactory } from "../../../../../lib";

const getClassName = getClassNameFactory("PuckFields", styles);

export const PartHeader = ({
  router,
  name,
  description,
  onBack,
}: {
  router: string;
  name: string;
  description?: any;
  onBack?: () => void;
}) => {
  return (
    <div className={getClassName("partsHeader")}>
      <div
        className={getClassName("partsHeader-title")}
        onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}>
        {onBack && (
          <div
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              marginRight: 8,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
        )}
        <p>{router}</p>
      </div>
      <h3>{name}</h3>
      {description}
    </div>
  );
};
