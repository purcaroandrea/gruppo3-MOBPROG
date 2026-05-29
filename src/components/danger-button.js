import React from "react";
import { Pressable, Text } from "react-native";
import { useStyles } from "../../hooks/useStyles";

export default function DangerButton({ onPress }) {
  const { styles } = useStyles();
  return (
    <Pressable style={styles.dangerButton} onPress={onPress}>
      <Text style={styles.dangerButtonText}>Elimina</Text>
    </Pressable>
  );
}