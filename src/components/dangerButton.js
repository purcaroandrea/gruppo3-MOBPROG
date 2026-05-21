import { Pressable, Text } from "react-native";
import styles from "../styles/styles";

export default function DangerButton({ onPress }) {
  return (
    <Pressable style={styles.dangerButton} onPress={onPress}>
      <Text style={styles.dangerButtonText}>Elimina</Text>
    </Pressable>
  );
}