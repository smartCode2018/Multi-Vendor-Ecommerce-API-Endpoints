import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

// Basic color palette
const defaultColors = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#000000", // Black
  "#FFFFFF", // White
];

const ColorSelector = ({
  control,
  errors,
  c1,
  c2,
  c3,
  c4,
  c5,
  c6,
  c7,
  c8,
  c9,
  c10,
  c11,
}: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");

  return (
    <div className={c11}>
      <label className={c9}>Choose Colors</label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className={c10}>
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ["#ffffff", "#ffff00"].includes(color);
              return (
                <button
                  type="button"
                  key={color}
                  onClick={() => {
                    console.log("clicked");
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    );
                  }}
                  className={`${c1}${isSelected ? c4 : c5} ${
                    isLightColor ? c6 : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Add new color */}
            <button
              type="button"
              className={c2}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Plus size={16} color="white" />
            </button>

            {/* Color Picker */}
            {showColorPicker && (
              <div className={c8}>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className={c7}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  className={c3}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
