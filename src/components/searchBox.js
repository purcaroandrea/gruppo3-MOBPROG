import { TextInput } from "react-native";
import styles from "../styles/styles";

export default function SearchBox(props) {
  return (
    <TextInput
      style={styles.input}
      autoCapitalize="none"
      clearButtonMode="while-editing"
      {...props}
    />
  );
}