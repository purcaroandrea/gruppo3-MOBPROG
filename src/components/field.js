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

    const hm = txt.match(/^(\d+)h\s*(\d+)m$/);
    if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2]);

    const h = txt.match(/^(\d+)h$/);
    if (h) return parseInt(h[1]) * 60;

    const m = txt.match(/^(\d+)m$/);
    if (m) return parseInt(m[1]);

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

  // Gestione estimatedHours / actualHours (obiettivi)
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

  // Gestione plannedHours / actualHours (attività)
  const isPlanned = field.key === "plannedHours";
  const isActual = field.key === "actualHours";
  const isActivity = !("estimatedHours" in value);
  const canEditActual = isActivity ? value.completed === true : true;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>

      <TextInput
        style={[styles.input, field.multiline && styles.textarea]}
        value={String(current ?? "")}
        placeholder={field.placeholder || field.label}
        multiline={field.multiline}
        keyboardType={isPlanned || isActual ? "numeric" : "default"}
        editable={
          (!isPlanned) &&
          (!isActual || canEditActual)
        }
        onChangeText={(txt) => {
          if (isPlanned) return;

          if (isActual && isActivity) {
            if (!canEditActual) return;
            if (!/^\d*$/.test(txt)) return;

            const num = parseInt(txt || "0");
            const max = parseInt(value.plannedHours || "0");

            if (num >= 0 && num <= max) set(String(num));
            return;
          }

          if (isActual && !isActivity) return;

          set(txt);
        }}
      />
    </View>
  );
}
