import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

import { X } from "lucide-react";

const CustomProperties = ({
  control,
  errors,
  c1,
  c2,
  c6,
  c7,
  c8,
  c9,
  c10,
  c11,
  c12,
  c13,
  c14,
  c15,
}: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div>
      <div className={c2}>
        <Controller
          name="customProperties"
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel("");
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue("");
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className={c1}>Custom Properties</label>
                <div className={c2}>
                  {/* Existing properties */}
                  {properties.map((property, index) => (
                    <div key={index} className={c6}>
                      <div className={c7}>
                        <span className={c8}>{property.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            console.log("here");
                            removeProperty(index);
                          }}
                        >
                          <X size={18} className={c9} />
                        </button>
                      </div>
                      {/* Add values to property */}
                      <div className={c10}>
                        <input
                          type="text"
                          className={c11}
                          placeholder="Enter value ..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                        />
                        <button
                          type="button"
                          className={c12}
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>
                      {/* Show values */}
                      <div className={c13}>
                        {property.values.map((value, i) => (
                          <span key={i} className={c14}>
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add new Property */}
                  <div className={c10}>
                    <input
                      className={c11}
                      placeholder="Enter property label (e.g., Material, Warranty)"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                    />

                    <button type="button" className={c12} onClick={addProperty}>
                      Add
                    </button>
                  </div>
                </div>
                {errors.customProperties && (
                  <p className={c15}>
                    {errors.customProperties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
