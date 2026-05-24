import React from "react";
import { View, Text, TextInput, Switch } from "react-native";
import styles from "../styles/styles";
import Segmented from "./Segmented";

export default function Field({ field, value, onChange, helpers }) {
  const current = value[field.key];
  const set = (next) => onChange({ ...value, [field.key]: next });

// aggiunta
function parseTimeInput(txt) {
  if (!txt) return null;

  txt = txt.trim().toLowerCase();

  // formato "1h 30m"
  const hm = txt.match(/^(\d+)h\s*(\d+)m$/);
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2]);

  // formato "1h"
  const h = txt.match(/^(\d+)h$/);
  if (h) return parseInt(h[1]) * 60;

  // formato "30m"
  const m = txt.match(/^(\d+)m$/);
  if (m) return parseInt(m[1]);

  // formato decimale "1.5"
  const dec = parseFloat(txt);
  if (!isNaN(dec) && dec >= 0 && dec <= 24) {
    return Math.round(dec * 60);
  }

  return null;
}

function formatMinutes(min) {
  if (min === null || min === undefined) return "";

  const h = Math.floor(min / 60);
  const m = min % 60;

  if (h > 0 && m > 0) return `${h} h ${m} m`;
  if (h > 0) return `${h} h`;
  return `${m} m`;
}
// fine aggiunta

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


/*
    // Campo testo / multilinea
const isAutoCalculated =
  field.key === "plannedHours" &&
  value.startTime &&
  value.endTime;

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
      editable={!isAutoCalculated}   
    />
  </View>
);

*/

// 🔥 Gestione ore stimate e ore svolte SOLO per gli obiettivi
const isGoalEstimated = field.key === "estimatedHours" && "estimatedHours" in value;
const isGoalActual = field.key === "actualHours" && "estimatedHours" in value;

if (isGoalEstimated || isGoalActual) {
  const isEstimated = isGoalEstimated;
  const isActual = isGoalActual;

  const n = parseInt(current) || 0;
  const canEditActual = value.completed === true;

  const increment = () => {
    if (isEstimated) {
      if (n < 500) set(String(n + 1));
    } else {
      if (!canEditActual) return;
      const max = parseInt(value.estimatedHours || "0");
      if (n < max) set(String(n + 1));
    }
  };

  const decrement = () => {
    if (n > 0) set(String(n - 1));
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>

      <View style={styles.row}>
        <Text style={styles.counterButton} onPress={decrement}>–</Text>

        <TextInput
          style={[styles.input, { textAlign: "center", width: 80 }]}
          value={String(current ?? "")}
          keyboardType="numeric"
          editable={isEstimated || (isActual && canEditActual)}
          onChangeText={(txt) => {
            if (!/^\d*$/.test(txt)) return;
            const num = parseInt(txt || "0");

            if (isEstimated) {
              if (num >= 1 && num <= 500) set(String(num));
            } else {
              if (!canEditActual) return;
              const max = parseInt(value.estimatedHours || "0");
              if (num >= 0 && num <= max) set(String(num));
            }
          }}
        />

        <Text
          style={[
            styles.counterButton,
            isActual && !canEditActual && { opacity: 0.3 }
          ]}
          onPress={increment}
        >
          +
        </Text>
      </View>
    </View>
  );
}




/* Campo testo / multilinea abbastanza buono
const isPlanned = field.key === "plannedHours";
const isActual = field.key === "actualHours";

const canEditActual = value.completed === true;

return (
  <View style={styles.field}>
    <Text style={styles.label}>{field.label}</Text>

    <TextInput
      style={[styles.input, field.multiline && styles.textarea]}
      value={String(current ?? "")}
      placeholder={field.placeholder || field.label}
      multiline={field.multiline}
      keyboardType="decimal-pad"

      editable={
        (!isPlanned) && 
        (!isActual || canEditActual)
      }

      onChangeText={(txt) => {
        // 🔹 Validazione numerica con massimo 1 decimale
        const regex = /^\d+(\.\d)?$/;

        // Caso: actualHours
        if (isActual) {
          if (!canEditActual) return;
          if (!regex.test(txt)) return;
          const n = parseFloat(txt);
          if (isNaN(n) || n < 0.1) return;
          if (value.plannedHours != null && n > value.plannedHours) return;
          set(n);
          return;
        }

        // Tutti gli altri campi → comportamento normale
        set(txt);
      }}
    />
  </View>
);
*/

// Campo testo / multilinea
const isPlanned = field.key === "plannedHours";
const isActual = field.key === "actualHours";

/* actualHours editabile solo se completata
const canEditActual = value.completed === true;
*/
// 🔥 ATTIVITÀ: riconosciute perché NON hanno estimatedHours
const isActivity = !("estimatedHours" in value);

// 🔥 Negli obiettivi la logica è gestita sopra (stepper)
// 🔥 Nelle attività actualHours editabile solo se completed = true
const canEditActual = isActivity ? value.completed === true : true;


return (
  <View style={styles.field}>
    <Text style={styles.label}>{field.label}</Text>

    <TextInput
      style={[styles.input, field.multiline && styles.textarea]}
      value={String(current ?? "")}
      placeholder={field.placeholder || field.label}
      multiline={field.multiline}
      keyboardType="decimal-pad"

      // 🔥 regola corretta di editabilità
      editable={
        (!isPlanned) && 
        (!isActual || canEditActual)
      }


     onChangeText={(txt) => {
  // 🔹 Caso: plannedHours → NON editabile
  if (isPlanned) return;

  // 🔹 Caso: actualHours delle attività
  if (isActual && isActivity) {
    if (!canEditActual) return;

    // solo numeri interi
    if (!/^\d*$/.test(txt)) return;

    const num = parseInt(txt || "0");

    // limite: 0 ≤ actual ≤ plannedHours
    const max = parseInt(value.plannedHours || "0");
    if (num >= 0 && num <= max) {
      set(String(num));
    }

    return;
  }

  // 🔹 Caso: actualHours degli obiettivi → NON gestito qui
  // (lo gestisce il blocco stepper sopra)
  if (isActual && !isActivity) return;

  // 🔹 Tutti gli altri campi → comportamento normale
  set(txt);
}}

    />
  </View>
);



     


}