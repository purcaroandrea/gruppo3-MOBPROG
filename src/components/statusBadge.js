import { Text } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";

export default function StatusBadge({ value }) {
  const { styles } = useStyles();
  return <Text style={[styles.badge, styles.statusBadge]}>{value}</Text>;
}