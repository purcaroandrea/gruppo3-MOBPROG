import React from "react";
import { Modal, View, ScrollView, Text, Pressable } from "react-native";
// Ottimo l'import qui!
import { useStyles } from "../../hooks/useStyles";
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
  // 👉 INSERISCILO ESATTAMENTE QUI: come primissima riga della funzione
  const { styles } = useStyles();

  // ⚠️ Questo return condizionale deve venire DOPO la chiamata all'hook
  if (!value) return null;
  
  const valid = fields.every((field) => {
  const v = String(value[field.key] || "").trim();

  if (field.required && !v) return false;

  if (field.key === "teacherName" && v && !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(v))
    return false;

  if (field.key === "credits" && v && (v < 1 || v > 20))
    return false;

  return true;
  });

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