import { Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import { minutesToHM } from "../helpers/format";

export default function Progress({ actual, total }) {
  const { styles } = useStyles();
  // Calcola la percentuale basandosi sui minuti totali
  // Math.min assicura che la barra non superi il 100% se si studia più del previsto
  const percent = total ? Math.min(100, Math.round((actual / total) * 100)) : 0;

  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.rowMeta}>
        {/* Mostra il testo formattato (es. 1h 30m / 10h · 15%) */}
        {minutesToHM(actual)} / {minutesToHM(total)} · {percent}%
      </Text>
    </View>
  );
}