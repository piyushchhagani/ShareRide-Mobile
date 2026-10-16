import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { colors, radius, spacing } from "../../theme/tokens";

type FormFieldProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "placeholder"
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
};

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  required = false,
  editable = true,
  multiline = false,
  style,
  ...inputProps
}: FormFieldProps) {
  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(
      Text,
      { style: styles.label },
      label,
      required
        ? React.createElement(Text, { style: styles.required }, " *")
        : null,
    ),
    React.createElement(
      View,
      {
        style: [
          styles.inputContainer,
          multiline && styles.multilineContainer,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ],
      },
      React.createElement(TextInput, {
        ...inputProps,
        value,
        onChangeText,
        placeholder: placeholder ?? `Enter ${label.toLowerCase()}`,
        placeholderTextColor: colors.textMuted,
        editable,
        multiline,
        selectionColor: colors.brand,
        accessibilityLabel: label,
        style: [styles.input, multiline && styles.multilineInput, style],
      }),
    ),
    error
      ? React.createElement(
          Text,
          { accessibilityRole: "alert", style: styles.errorText },
          error,
        )
      : helperText
        ? React.createElement(
            Text,
            { style: styles.helperText },
            helperText,
          )
        : null,
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  required: {
    color: colors.danger,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  multilineContainer: {
    minHeight: 110,
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
    opacity: 0.75,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});