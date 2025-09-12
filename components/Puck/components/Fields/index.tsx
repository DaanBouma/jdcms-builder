import React, { ReactNode, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Loader } from "../../../Loader";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { UiState } from "../../../../types";
import { AutoFieldPrivate } from "../../../AutoField";
import { AppStore, useAppStore, useAppStoreApi } from "../../../../store";

import { getClassNameFactory } from "../../../../lib";
import { ItemSelector } from "../../../../lib/get-item";
import { useRegisterFieldsSlice } from "../../../../store/slices/fields";
import { useShallow } from "zustand/react/shallow";
import { StoreApi } from "zustand";
import { PartNavbar } from "../Components/PartNavbar";
import { PartHeader } from "../Components/PartHeader";

import styles from "./styles.module.css";
const getClassName = getClassNameFactory("PuckFields", styles);

type ReplaceAction = {
  type: "replace";
  destinationIndex: number;
  destinationZone: string;
  data: any;
};

type SetAction = {
  type: "set";
  state: any;
};

const replaceAction = (state: any, action: ReplaceAction) => ({
  ...state,
  [action.destinationZone]: [
    ...(state[action.destinationZone] || []).slice(0, action.destinationIndex),
    action.data,
    ...(state[action.destinationZone] || []).slice(action.destinationIndex + 1),
  ],
});

const setAction = (state: any, action: SetAction) => ({
  ...state,
  ...action.state,
});

const DefaultFields = ({
  children,
}: {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}) => <>{children}</>;

const createOnChange =
  (fieldName: string, appStore: StoreApi<AppStore>) =>
  (value: any, updatedUi?: Partial<UiState>) => {
    const { dispatch, resolveData, config, state, selectedItem } = appStore.getState();
    const { data, ui } = state;
    const rootProps = data.root.props || {};
    const currentProps = selectedItem ? selectedItem.props : rootProps;
    const newProps = { ...currentProps, [fieldName]: value };

    if (selectedItem) {
      const replaceActionData: ReplaceAction = {
        type: "replace",
        destinationIndex: 0,
        destinationZone: rootDroppableId,
        data: { ...selectedItem, props: newProps },
      };
      const replacedData = replaceAction(data, replaceActionData);
      const setActionData: SetAction = {
        type: "set",
        state: { data: { ...data, ...replacedData }, ui: { ...ui, ...updatedUi } },
      };
      if (config.components[selectedItem.type]?.resolveData) {
        resolveData(setAction(state, setActionData));
      } else {
        dispatch({ ...setActionData, recordHistory: true });
      }
    } else {
      const updatedData = { ...data, root: { props: newProps } };
      if (config.root?.resolveData) {
        resolveData({ data: updatedData, ui: { ...ui, ...updatedUi } });
      } else {
        dispatch({ type: "set", state: { data: updatedData, ui: { ...ui, ...updatedUi } }, recordHistory: true });
      }
    }
  };

const FieldsChild = ({ fieldName }: { fieldName: string }) => {
  const field = useAppStore((s) => s.fields.fields[fieldName]);
  const isReadOnly = useAppStore((s) =>
    ((s.selectedItem ? s.selectedItem.readOnly : s.state.data.root.readOnly) || {})[fieldName]
  );
  const value = useAppStore((s) => {
    const rootProps = s.state.data.root.props || {};
    return s.selectedItem ? s.selectedItem.props[fieldName] : rootProps[fieldName];
  });

  const id = useAppStore((s) =>
    s.selectedItem ? `${s.selectedItem.props.id}_${field.type}_${fieldName}` : `root_${field?.type}_${fieldName}`
  );

  const permissions = useAppStore(
    useShallow((s) => {
      const { selectedItem, permissions } = s;
      return selectedItem ? permissions.getPermissions({ item: selectedItem }) : permissions.getPermissions({ root: true });
    })
  );

  const appStore = useAppStoreApi();
  const onChange = useCallback(createOnChange(fieldName, appStore), [fieldName]);

  if (!field || !id) return null;

  return (
    <div key={id} className={getClassName("field")}>
      <AutoFieldPrivate
        field={field}
        name={fieldName}
        id={id}
        readOnly={!permissions.edit || isReadOnly}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

const PartFieldChild = ({ fieldName, partKey }: { fieldName: string; partKey: string }) => {
  const field = useAppStore((s) => {
    const selectedItem = s.selectedItem;
    if (!selectedItem) return null;
    const componentConfig = s.config.components[selectedItem.type];
    return componentConfig?.parts?.[partKey]?.fields?.[fieldName] || null;
  });

  const isReadOnly = useAppStore(
    (s) =>
      ((s.selectedItem ? s.selectedItem.readOnly : s.state.data.root.readOnly) || {})[`${partKey}.${fieldName}`]
  );

  const value = useAppStore((s) => {
    const rootProps = s.state.data.root.props || {};
    const props = s.selectedItem ? s.selectedItem.props : rootProps;
    return props[partKey]?.[fieldName];
  });

  const id = useAppStore((s) =>
    s.selectedItem ? `${s.selectedItem.props.id}_${field?.type}_${partKey}_${fieldName}` : `root_${field?.type}_${partKey}_${fieldName}`
  );

  const permissions = useAppStore(
    useShallow((s) => {
      const { selectedItem, permissions } = s;
      return selectedItem ? permissions.getPermissions({ item: selectedItem }) : permissions.getPermissions({ root: true });
    })
  );

  const appStore = useAppStoreApi();
  const onChange = useCallback(
    (value: any, updatedUi?: Partial<UiState>) => {
      const { dispatch, state, selectedItem } = appStore.getState();
      const { data } = state;
      const rootProps = data.root.props || {};
      const currentProps = selectedItem ? selectedItem.props : rootProps;

      const newPartProps = { ...(currentProps[partKey] || {}), [fieldName]: value };
      const newProps = { ...currentProps, [partKey]: newPartProps };

      if (selectedItem) {
        dispatch({
          type: "replace",
          destinationIndex: 0,
          destinationZone: rootDroppableId,
          data: { ...selectedItem, props: newProps },
        });
      } else {
        dispatch({
          type: "set",
          state: { data: { ...data, root: { props: newProps } } },
          recordHistory: true,
        });
      }
    },
    [partKey, fieldName, appStore]
  );

  if (!field || !id) return null;

  return (
    <div key={id} className={getClassName("field")} onClick={(e) => e.stopPropagation()}>
      <AutoFieldPrivate
        field={field}
        name={`${partKey}.${fieldName}`}
        id={id}
        readOnly={!permissions.edit || isReadOnly}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export const Fields = ({ wrapFields = true }: { wrapFields?: boolean }) => {
  const overrides = useAppStore((s) => s.overrides);
  const componentResolving = useAppStore((s) => {
    const loadingCount = s.selectedItem ? s.componentState[s.selectedItem.props.id]?.loadingCount : s.componentState["puck-root"]?.loadingCount;
    return (loadingCount ?? 0) > 0;
  });

  const itemSelector = useAppStore(useShallow((s) => s.state.ui.itemSelector));
  const id = useAppStore((s) => s.selectedItem?.props.id);
  const appStore = useAppStoreApi();
  useRegisterFieldsSlice(appStore, id);

  const fieldsLoading = useAppStore((s) => s.fields.loading);
  const fieldNames = useAppStore(useShallow((s) => Object.keys(s.fields.fields)));

  const selectedItem = useAppStore((s) => s.selectedItem);
  const componentConfig = useAppStore((s) => (selectedItem ? s.config.components[selectedItem.type] : null));
  const hasParts = componentConfig?.parts;

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const prevSelectedItemIdRef = useRef<string | null>(null);

  const isLoading = fieldsLoading || componentResolving;
  const Wrapper = useMemo(() => overrides.fields || DefaultFields, [overrides]);
  const componentName = selectedItem?.type || "Root";

  useEffect(() => {
    if (
      prevSelectedItemIdRef.current !== null &&
      selectedItem?.props.id !== prevSelectedItemIdRef.current
    ) {
      setSelectedPart(null);
    }
    prevSelectedItemIdRef.current = selectedItem?.props.id || null;
  }, [selectedItem?.props.id]);

  if (hasParts && selectedItem) {
    const parts = componentConfig.parts;
    if (!selectedPart) {
      return (
        <div className={getClassName("partsContainer")}>
          <PartNavbar />
          <PartHeader description={<p>Edit this components in parts <a>Learn more</a></p>} router="Root" name={componentName} onBack={() => setSelectedPart(null)}/>
          <div className={getClassName("partsGrid")}>
            {Object.entries(parts).map(([partKey, partConfig]: [string, any]) => (
              <div key={partKey} className={getClassName("partCard")} onClick={() => setSelectedPart(partKey)}>
                <div className={getClassName("partCard-left")}>
                  <h4>{partConfig.label || partKey}</h4>
                  <p>Edit the {partConfig.label || partKey}</p>
                </div>
                <div className={getClassName("partCard-right")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const selectedPartConfig = parts[selectedPart];
    const partFieldNames = selectedPartConfig.fields ? Object.keys(selectedPartConfig.fields) : [];

    return (
      <div className={getClassName("partsContainer")}>
        <PartNavbar />
        <PartHeader router={componentName} name={selectedPart} onBack={() => setSelectedPart(null)} />
        <div className={getClassName("partsGrid")}>
          <form className={getClassName({ wrapFields })} onSubmit={(e) => e.preventDefault()}>
            <Wrapper isLoading={isLoading} itemSelector={itemSelector}>
              {partFieldNames.map((fieldName) => (
                <PartFieldChild key={fieldName} fieldName={fieldName} partKey={selectedPart} />
              ))}
            </Wrapper>
            {isLoading && (
              <div className={getClassName("loadingOverlay")}>
                <div className={getClassName("loadingOverlayInner")}>
                  <Loader size={16} />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={getClassName("partsContainer")}>
      <PartNavbar />
      <PartHeader router="Root" name={componentName} onBack={() => setSelectedPart(null)}/>
      <div className={getClassName("partsGrid")}>
        <form className={getClassName({ wrapFields })} onSubmit={(e) => e.preventDefault()}>
          <Wrapper isLoading={isLoading} itemSelector={itemSelector}>
            {fieldNames.map((fieldName) => (
              <FieldsChild key={fieldName} fieldName={fieldName} />
            ))}
          </Wrapper>
          {isLoading && (
            <div className={getClassName("loadingOverlay")}>
              <div className={getClassName("loadingOverlayInner")}>
                <Loader size={16} />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
