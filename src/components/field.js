import { View, Text, TextInput, Switch } from "react-native";
import styles from "../styles/styles";
import Segmented from "./Segmented";

export default function Field({ field, value, onChange, helpers }) {
  const current = value[field.key];
  const set = (next) => onChange({ ...value, [field.key]: next });

  // Campo: selezione corso
  if (field.type === "course") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...helpers.courseOptions.map((o) => o.id)]}
          labels={{
            "": "Nessuno",
            ...Object.fromEntries(helpers.courseOptions.map((o) => [o.id, o.name])),
          }}
          value={current || ""}
          onChange={set}
        />
      </View>
    );
  }

  // Campo: selezione esame
  if (field.type === "exam") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...helpers.examOptions.map((o) => o.id)]}
          labels={{
            "": "Nessuno",
            ...Object.fromEntries(helpers.examOptions.map((o) => [o.id, o.title])),
          }}
          value={current || ""}
          onChange={set}
        />
      </View>
    );
  }

  // Campo: opzioni predefinite
  if (field.options) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented options={field.options} value={current} onChange={set} />
      </View>
    );
  }

  // Campo booleano
  if (field.type === "boolean") {
    return (
      <View style={styles.filterRow}>
        <Text style={styles.label}>{field.label}</Text>
        <Switch value={Boolean(current)} onValueChange={set} />
      </View>
    );
  }

  // Campo testo / multilinea
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput
        style={[styles.input, field.multiline && styles.textarea]}
        value={String(current || "")}
        onChangeText={set}
        placeholder={field.placeholder || field.label}
        multiline={field.multiline}
        keyboardType={field.numeric ? "decimal-pad" : "default"}
      />
    </View>
  );
}