import { ScrollView, Pressable, Text } from "react-native";
import styles from "../styles/styles";

export default function Segmented({ options, labels = {}, value, onChange }) {
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