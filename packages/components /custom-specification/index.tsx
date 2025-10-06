import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

const CustomSpecifications = ({ control, errors, c1, c2, c3, c4, c5 }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <div>
      <label className={c1}>Custom Specifications</label>
      <div className={c2}>
        {fields?.map((item, index) => (
          <div key={index} className={c3}>
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: "Secification name is required" }}
              render={({ field }) => (
                <Input
                  label="Specification Name "
                  placeholder="e.g., battery Life, Weight, Material"
                  className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                  {...field}
                />
              )}
            />
            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <Input
                  label="Value"
                  placeholder="e.g., 4000mAh, 1.5kg, Plastic"
                  className="w-full border !outline-none border-gray-700 bg-transparent p-2 !rounded-md text-white"
                  {...field}
                />
              )}
            />
            <button type="button" className={c4} onClick={() => remove(index)}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button className={c5} onClick={() => append({ name: "", value: "" })}>
          <PlusCircle size={20} /> Add Specification
        </button>
      </div>
      {errors?.custom_specifications && (
        <p className="text-red-500 text-xs mt-1">
          {errors.custom_specifications.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;
