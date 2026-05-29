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
}) {

  const { styles } = useStyles();

  if (!value) return null;

  const valid = fields.every((field) => {
  const v = String(value[field.key] || "").trim();

  if (field.required && !v) return false;

  if (field.key === "teacherName" && v && !/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’\-]+$/.test(v))
    return false;

  if (field.key === "credits" && v && (v < 1 || v > 20))
    return false;

  return true;
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </Pressable>
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