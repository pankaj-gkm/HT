import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type CheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: React.ReactNode;
  style?: React.CSSProperties;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function CheckboxField<T extends FieldValues>({
  name,
  control,
  label,
  style = {},
  ...props
}: CheckboxFieldProps<T>) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label
        style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}
      >
        <Controller
          name={name}
          control={control}
          render={({
            field,
          }: {
            field: {
              value: boolean;
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
              onBlur: () => void;
              ref: React.Ref<HTMLInputElement>;
              name: string;
            };
          }) => (
            <input
              type="checkbox"
              checked={!!field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
              {...props}
            />
          )}
        />
        {label}
      </label>
    </div>
  );
}
