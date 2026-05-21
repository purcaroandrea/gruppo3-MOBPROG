import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "../styles/styles";

export default function Panel({ title, action, onAction, children }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelTop}>
        <Text style={styles.panelTitle}>{title}</Text>
        {action && (
          <Pressable onPress={onAction}>
            <Text style={styles.linkText}>{action}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}