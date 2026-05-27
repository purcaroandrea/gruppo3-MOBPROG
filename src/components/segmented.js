import React from "react";
import { ScrollView, Pressable, Text } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";

export default function Segmented({ options, labels = {}, value, onChange }) {
  const { styles } = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.segmented}
    >
      {options.map((option) => (
        <Pressable
          key={option}
          style={[styles.segment, value === option && styles.segmentActive]}
          onPress={() => onChange(option)}
        >
          <Text
            style={[
              styles.segmentText,
              value === option && styles.segmentTextActive,
            ]}
            numberOfLines={1}
          >
            {labels[option] || option || "Nessuno"}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}