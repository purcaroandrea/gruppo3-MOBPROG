import React from "react";
import { View, Text } from "react-native";
import { useStyles } from "../../hooks/useStyles";

export default function Metric({ label, value }) {
  const { styles } = useStyles();
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}