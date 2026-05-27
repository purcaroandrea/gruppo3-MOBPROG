import React from "react";
import { View, Text, Pressable } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";

export default function ScreenTop({ title, button, onPress }) {
  const { styles } = useStyles();
  return (
    <View style={styles.screenTop}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{button}</Text>
      </Pressable>
    </View>
  );
}
