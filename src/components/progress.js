import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/styles";

export default function Progress({ actual, total }) {
  const percent = total ? Math.min(100, Math.round((actual / total) * 100)) : 0;

  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.rowMeta}>
        {actual}h / {total || 0}h · {percent}%
      </Text>
    </View>
  );
}