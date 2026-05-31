import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import Field from "./field";

export default function EntityModal({
  visible,
  title,
  value,
  fields,
  onChange,
  onClose,
  onSave,
  helpers,
  validate,
}) {

  const { styles, themeColors: tc } = useStyles();

  if (!value) return null;

  const validationError = validate ? validate(value) : null;

  const valid = fields.every((field) => {
    const v = String(value[field.key] || "").trim();

    if (field.required && !v) return false;

    if (field.key === "teacherName" && v && !/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’\-]+$/.test(v))
      return false;

    if (field.key === "credits" && v && (v < 1 || v > 20))
      return false;

    return true;
  }) && !validationError;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={value}
                onChange={onChange}
                helpers={helpers}
              />
            ))}

            {validationError ? (
              <Text style={{ color: tc.dangerText || "#C0392B", fontSize: 13, marginTop: 4, marginBottom: 12, fontWeight: "600" }}>
                ⚠️ {validationError}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                style={[styles.primaryButton, !valid && styles.disabledButton]}
                disabled={!valid}
                onPress={() => onSave(value)}
              >
                <Text style={styles.primaryButtonText}>Salva</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Annulla</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}