import { useAppStore } from "../store";

export const SidebarController = () => {
  const setUi = useAppStore((s) => s.setUi);

  // Back to the appsidebar outside the puck component
  const to_main = () => {
    setUi({ leftSideBarVisible: false });
    const sidebar = document.getElementById("sidebar-root");
    if (sidebar) sidebar.style.display = "flex";
  };

  // Going to the components part
  const to_components = () => {
    setUi({ leftSideBarVisible: true });
    const sidebar = document.getElementById("sidebar-root");
    if (sidebar) sidebar.style.display = "none";
  };

  return { to_main, to_components };
};
