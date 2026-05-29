import React from "react";
import { TextInput, View, Pressable } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function SearchBox(props) {
  const { styles, themeColors } = useStyles();
  
  return (
    <View style={{ position: "relative", justifyContent: "center", marginBottom: 14 }}>
      <TextInput
        style={[styles.input, { paddingRight: 40, marginBottom: 0 }]}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        {...props}
      />
      {Boolean(props.value) && (
        <Pressable
          style={{ position: "absolute", right: 12, padding: 4 }}
          onPress={() => props.onChangeText && props.onChangeText("")}
        >
          <MaterialIcons name="close" size={20} color={themeColors?.textMuted || "#888"} />
        </Pressable>
      )}
    </View>
  );
}