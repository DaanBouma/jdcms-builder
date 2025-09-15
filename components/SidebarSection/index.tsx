import React, { ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Heading } from "../Heading";
import { ChevronRight } from "lucide-react";
import { useBreadcrumbs } from "../../lib/use-breadcrumbs";
import { useAppStore } from "../../store";
import { Loader } from "../Loader";
import { SidebarController } from "../../lib/sidebar-controller";

const getClassName = getClassNameFactory("SidebarSection", styles);

export const SidebarSection = ({
  children,
  title,
  background,
  showBreadcrumbs,
  noBorderTop,
  noPadding,
  isLoading,
}: {
  children: ReactNode;
  title: ReactNode;
  background?: string;
  showBreadcrumbs?: boolean;
  noBorderTop?: boolean;
  noPadding?: boolean;
  isLoading?: boolean | null;
}) => {
  const setUi = useAppStore((s) => s.setUi);
  const { to_main, to_components } = SidebarController();
  return (
    <div
      className={getClassName({ noBorderTop, noPadding })}
      style={{ background }}
    >
      <div className={getClassName("title")}>
        <div
          className={getClassName("heading")}
          onClick={() => to_main()}
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
            className="lucide lucide-chevron-left-icon lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <p>Main</p>
        </div>
        <div>
          <h3 className={getClassName("name")}>{title}</h3>
        </div>
      </div>
      <div className={getClassName("content")}>{children}</div>
      {isLoading && (
        <div className={getClassName("loadingOverlay")}>
          <Loader size={32} />
        </div>
      )}
    </div>
  );
};
