import React from "react";
import { TextInput } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";

export default function SearchBox(props) {
  const { styles } = useStyles();
  return (
    <TextInput
      style={styles.input}
      autoCapitalize="none"
      clearButtonMode="while-editing"
      {...props}
    />
  );
}