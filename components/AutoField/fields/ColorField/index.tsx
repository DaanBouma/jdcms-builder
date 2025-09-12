import React, { useState, useRef, useEffect, useCallback } from "react";
import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { FieldPropsInternal } from "../..";
import { Palette } from "lucide-react";

const getClassName = getClassNameFactory("Input", styles);

// Helper functions for color conversion
const hexToHsv = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return { h, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number) => {
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const ColorField = ({
  field,
  onChange,
  readOnly,
  value: _value,
  name,
  label,
  Label,
  id,
}: FieldPropsInternal) => {
  const value = _value as string | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'saturation' | 'hue' | null>(null);

  const currentColor = value || "#171717";
  const currentHsv = hexToHsv(currentColor);
  const [hue, setHue] = useState(currentHsv.h);
  const [saturation, setSaturation] = useState(currentHsv.s);
  const [brightness, setBrightness] = useState(currentHsv.v);

  useEffect(() => {
    const newHsv = hexToHsv(currentColor);
    setHue(newHsv.h);
    setSaturation(newHsv.s);
    setBrightness(newHsv.v);
  }, [currentColor]);

  useEffect(() => {
    const newHex = hsvToHex(hue, saturation, brightness);
    if (newHex !== currentColor) {
      onChange(newHex);
    }
  }, [hue, saturation, brightness]);

  const handleSaturationMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    setIsDragging('saturation');
    updateSaturation(e);
  }, [readOnly]);

  const handleHueMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    setIsDragging('hue');
    updateHue(e);
  }, [readOnly]);

  const updateSaturation = useCallback((e: React.MouseEvent) => {
    if (!saturationRef.current) return;

    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const newSaturation = (x / rect.width) * 100;
    const newBrightness = ((rect.height - y) / rect.height) * 100;

    setSaturation(newSaturation);
    setBrightness(newBrightness);
  }, []);

  const updateHue = useCallback((e: React.MouseEvent) => {
    if (!hueRef.current) return;

    const rect = hueRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const newHue = (y / rect.height) * 360;

    setHue(newHue);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === 'saturation') {
        updateSaturation(e as any);
      } else if (isDragging === 'hue') {
        updateHue(e as any);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateSaturation, updateHue]);

  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalClick = (event: Event) => {
      const target = event.target as Element;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const events = ['mousedown', 'click', 'touchstart'];

    events.forEach(eventType => {
      document.addEventListener(eventType, handleGlobalClick, { capture: true, passive: true });
      document.body.addEventListener(eventType, handleGlobalClick, { capture: true, passive: true });
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleGlobalClick, { capture: true } as any);
        document.body.removeEventListener(eventType, handleGlobalClick, { capture: true } as any);
      });
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => document.removeEventListener("keydown", handleEscapeKey);
    }
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onChange(color);
  };

  return (
    <div className={getClassName("input-container")}>
      <label>{label}</label>
      <div className={getClassName("input-container")} ref={containerRef} style={{ position: "relative" }}>
        <button
          type="button"
          id={id}
          title={label || name}
          disabled={readOnly}
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          className={getClassName("color")}
        >
          <div className={getClassName("input-container") + " " + getClassName("colorTriggerInner")}>
            <div
              className={getClassName("colorPreview")}
              style={{ backgroundColor: currentColor }}
            />
          </div>
        </button>

        {isOpen && (
          <div className={getClassName("colorPickerDropdown")}>
            <div className={getClassName("colorPickerSection")}>
              <label className={getClassName("colorPickerLabel")}>
                Color Picker
              </label>
              <div className={getClassName("colorPickerRow")}>
                <div
                  ref={saturationRef}
                  onMouseDown={handleSaturationMouseDown}
                  className={getClassName("saturationArea")}
                  style={{
                    background: `linear-gradient(to right, #ffffff, hsl(${hue}, 100%, 50%)), linear-gradient(to top, #000000, transparent)`,
                    backgroundBlendMode: "multiply, normal",
                  }}
                >
                  <div
                    className={getClassName("saturationIndicator")}
                    style={{
                      left: `${saturation}%`,
                      top: `${100 - brightness}%`,
                    }}
                  />
                </div>

                <div
                  ref={hueRef}
                  onMouseDown={handleHueMouseDown}
                  className={getClassName("hueSlider")}
                >
                  <div
                    className={getClassName("hueIndicator")}
                    style={{
                      top: `${(hue / 360) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={getClassName("colorPickerSection")}>
              <label className={getClassName("colorPickerLabel")}>
                Hex Color
              </label>
              <input
                type="text"
                value={currentColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.match(/^#[0-9A-F]{0,6}$/i)) {
                    onChange(val);
                  }
                }}
                placeholder="#000000"
                className={getClassName("hexInput")}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 1px #3b82f6";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#333";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
