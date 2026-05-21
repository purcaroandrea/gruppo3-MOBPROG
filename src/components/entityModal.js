import { Modal, View, ScrollView, Text, Pressable } from "react-native";
import styles from "../styles/styles";
import Field from "./Field";

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
  if (!value) return null;

  const valid = fields.every(
    (field) => !field.required || String(value[field.key] || "").trim()
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{title}</Text>

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