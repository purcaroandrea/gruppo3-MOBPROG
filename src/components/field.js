import React from "react";
import { View, Text, TextInput, Switch } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";
import Segmented from "./Segmented";

export default function Field({ field, value, onChange, helpers }) {
  const { styles } = useStyles();
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

  // Campo: selezione obiettivo
  if (field.type === "goal") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...helpers.goalOptions.map((g) => g.id)]}
          labels={{
            "": "Nessuno",
            ...Object.fromEntries(helpers.goalOptions.map((g) => [g.id, g.title])),
          }}
          value={current || ""}
          onChange={set}
        />
      </View>
    );
  }

  // Campo: opzioni predefinite (Segmented control generico)
  if (field.options) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented options={field.options} value={current} onChange={set} />
      </View>
    );
  }

  // Campo booleano (Switch)
  if (field.type === "boolean") {
    return (
      <View style={styles.filterRow}>
        <Text style={styles.label}>{field.label}</Text>
        <Switch value={Boolean(current)} onValueChange={set} />
      </View>
    );
  }

  // Validazione nome docente
  if (field.key === "teacherName") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <TextInput
          style={styles.input}
          value={current}
          onChangeText={(txt) => {
            const clean = txt.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
            set(clean);
          }}
          placeholder="Es. Rossi"
          keyboardType="default"
        />
      </View>
    );
  }

  // Validazione CFU
  if (field.key === "credits") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <TextInput
          style={styles.input}
          value={String(current || "")}
          onChangeText={(txt) => {
            let n = parseInt(txt) || "";
            if (n !== "" && (n < 1 || n > 20)) return;
            set(String(n));
          }}
          keyboardType="numeric"
        />
      </View>
    );
  }

  // 🔥 NUOVA GESTIONE TEMPO (Ore e Minuti separati)
  const isPlanned = field.key === "plannedHours";
  const isActual = field.key === "actualHours";
  const isEstimated = field.key === "estimatedHours";
  
  if (isPlanned || isActual || isEstimated) {
    const totalMinutes = parseInt(current || "0", 10);
    const hoursVal = Math.floor(totalMinutes / 60);
    const minutesVal = totalMinutes % 60;

    const handleTimeChange = (newHours, newMins) => {
      const h = parseInt(newHours, 10) || 0;
      const m = parseInt(newMins, 10) || 0;
      const total = (h * 60) + m;
      
      // Limite per actualHours: non può superare plannedHours (per le sessioni)
      if (isActual && !("estimatedHours" in value)) {
        const maxMinutes = parseInt(value.plannedHours || "0", 10);
        if (total > maxMinutes) return;
      }

      // Limite per actualHours: non può superare estimatedHours (per gli obiettivi)
      if (isActual && ("estimatedHours" in value)) {
        const maxMinutes = parseInt(value.estimatedHours || "0", 10);
        if (total > maxMinutes) return;
      }
      
      set(String(total));
    };

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Input delle Ore */}
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={hoursVal > 0 || totalMinutes > 0 ? String(hoursVal) : ""}
              placeholder="Ore"
              editable={!isPlanned} // isPlanned si calcola in automatico da inizio/fine
              onChangeText={(txt) => handleTimeChange(txt, minutesVal)}
            />
          </View>
          {/* Input dei Minuti */}
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={minutesVal > 0 || totalMinutes > 0 ? String(minutesVal) : ""}
              placeholder="Minuti"
              maxLength={2}
              editable={!isPlanned}
              onChangeText={(txt) => {
                let m = parseInt(txt, 10) || 0;
                if (m > 59) m = 59; // Limita i minuti a 59
                handleTimeChange(hoursVal, m);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Fallback per campi testuali generici (Note, Titoli, ecc.)
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>

      <TextInput
        style={[styles.input, field.multiline && styles.textarea]}
        value={String(current ?? "")}
        placeholder={field.placeholder || field.label}
        multiline={field.multiline}
        onChangeText={set}
      />
    </View>
  );
}