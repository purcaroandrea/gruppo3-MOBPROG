import React from "react";
import { View, Text, Pressable } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";

export default function Panel({ title, action, onAction, children }) {
  const { styles } = useStyles();
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