import { View, Text, Pressable } from "react-native";
import styles from "../styles/styles";

export default function ScreenTop({ title, button, onPress }) {
  return (
    <View style={styles.screenTop}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{button}</Text>
      </Pressable>
    </View>
  );
}
