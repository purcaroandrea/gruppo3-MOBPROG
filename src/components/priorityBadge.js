import React from "react";
import { Text } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";

export default function PriorityBadge({ value }) {
  const { styles } = useStyles();
  const style =
    value === "Alta"
      ? styles.highBadge
      : value === "Bassa"
      ? styles.lowBadge
      : styles.mediumBadge;

  return <Text style={[styles.badge, style]}>{value}</Text>;
}