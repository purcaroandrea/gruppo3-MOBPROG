import { Text } from "react-native";
import styles from "../styles/styles";

export default function PriorityBadge({ value }) {
  const style =
    value === "Alta"
      ? styles.highBadge
      : value === "Bassa"
      ? styles.lowBadge
      : styles.mediumBadge;

  return <Text style={[styles.badge, style]}>{value}</Text>;
}