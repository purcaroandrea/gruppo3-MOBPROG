import { Text } from "react-native";
import styles from "../styles/styles";

export default function StatusBadge({ value }) {
  return <Text style={[styles.badge, styles.statusBadge]}>{value}</Text>;
}