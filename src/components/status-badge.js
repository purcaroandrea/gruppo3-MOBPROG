import React from "react";
import { Text } from "react-native";
import { useStyles } from "../../hooks/useStyles";

export default function StatusBadge({ value }) {
  const { styles } = useStyles();
  return <Text style={[styles.badge, styles.statusBadge]}>{value}</Text>;
}