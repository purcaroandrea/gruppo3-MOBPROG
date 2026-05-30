import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import Segmented from "./segmented";

const WebSelect = ({ field, current, set, styles, themeColors }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <Pressable
        style={[
          styles.input,
          current ? { borderColor: themeColors.primary } : null,
          open ? { borderColor: themeColors.primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : null
        ]}
        onPress={() => setOpen(!open)}
      >
        <Text style={{
          color: current ? themeColors.textTitle : themeColors.textMuted,
          fontSize: 15,
        }}>
          {current || "Seleziona..."}
        </Text>
      </Pressable>

      {open && (
        <View style={{
          backgroundColor: themeColors.card,
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: themeColors.primary,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          padding: 6,
          marginBottom: 14,
        }}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
            {field.options.map((opt) => (
              <Pressable
                key={opt}
                style={({ hovered }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: current === opt
                    ? themeColors.primary
                    : (hovered ? themeColors.primaryLight : "transparent"),
                  borderRadius: 8,
                  marginVertical: 1,
                })}
                onPress={() => {
                  set(opt);
                  setOpen(false);
                }}
              >
                {({ hovered }) => (
                  <Text style={{
                    fontSize: 14,
                    color: current === opt
                      ? themeColors.textOnPrimary
                      : (hovered ? themeColors.textTitle : themeColors.textBody),
                    fontWeight: current === opt ? "600" : "400",
                  }}>
                    {opt === "" ? "Nessuno / Vuoto" : opt}
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const MobileSelect = ({ field, current, set, styles, themeColors }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <Pressable
        style={[
          styles.input,
          current ? { borderColor: themeColors.primary } : null
        ]}
        onPress={() => setOpen(true)}
      >
        <Text style={{
          color: current ? themeColors.textTitle : themeColors.textMuted,
          fontSize: 15,
        }}>
          {current || "Seleziona..."}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={[styles.modalSheet, { maxHeight: "60%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{field.label}</Text>
              <Pressable style={styles.modalCloseButton} onPress={() => setOpen(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {field.options.map((opt) => (
                <Pressable
                  key={opt}
                  style={({ hovered }) => ({
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: themeColors.borderLight || "#f0f0f0",
                    backgroundColor: current === opt
                      ? themeColors.primary
                      : (hovered ? themeColors.primaryLight : "transparent"),
                    borderRadius: 8,
                    marginVertical: 2,
                  })}
                  onPress={() => {
                    set(opt);
                    setOpen(false);
                  }}
                >
                  {({ hovered }) => (
                    <Text style={{
                      fontSize: 16,
                      color: current === opt
                        ? themeColors.textOnPrimary
                        : (hovered ? themeColors.textTitle : themeColors.textBody),
                      fontWeight: current === opt ? "600" : "400",
                    }}>
                      {opt === "" ? "Nessuno / Vuoto" : opt}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const DatePickerField = ({ field, current, set, styles }) => {
  const [showPicker, setShowPicker] = useState(false);

  const parsed = current ? new Date(current) : new Date();
  const display = current
    ? new Date(current).toLocaleDateString("it-IT", {
      day: "2-digit", month: "2-digit", year: "numeric",
    })
    : "";

  // Web
  if (Platform.OS === "web") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <input
          type="date"
          value={current || ""}
          onChange={(e) => set(e.target.value)}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
            width: "auto",
            maxWidth: 160,
            display: "block",
          }}
        />
      </View>
    );
  }

  // iOS / Android: DateTimePicker nativo
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={styles.inputText}>{display || "Seleziona data"}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={parsed}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selectedDate) => {
            // Su Android l'utente clicca OK/Annulla, quindi possiamo chiudere la modale
            if (Platform.OS === "android") {
              setShowPicker(false);
            }

            if (selectedDate) {
              // Estraiamo la data LOCALE per evitare il bug del fuso orario
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const day = String(selectedDate.getDate()).padStart(2, "0");
              set(`${year}-${month}-${day}`);
            }
          }}
        />
      )}
    </View>
  );
};

export default function Field({ field, value, onChange, helpers }) {
  const { styles, themeColors } = useStyles();
  const current = value[field.key];
  const set = (next) => onChange({ ...value, [field.key]: next });

  // Campo Data
  if (field.type === "date" || field.key === "date") {
    return (
      <DatePickerField
        field={field}
        current={current}
        set={set}
        styles={styles}
      />
    );
  }

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

  // Campo: selezione esame (filtrato per corso dell'obiettivo selezionato)
  if (field.type === "exam") {
    let filteredExams = helpers.examOptions;
    if (value.goalId) {
      const goal = helpers.goalById(value.goalId);
      const goalCourseId = goal?.courseId || "";
      filteredExams = helpers.examOptions.filter(
        (e) => (helpers.examById(e.id)?.courseId || "") === goalCourseId
      );
    }
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...filteredExams.map((o) => o.id)]}
          labels={{
            "": "Nessuno",
            ...Object.fromEntries(filteredExams.map((o) => [o.id, o.title])),
          }}
          value={current || ""}
          onChange={(id) => {
            const exam = id ? helpers.examById(id) : null;
            const updates = { ...value, examId: id };
            // Se c'è un obiettivo selezionato e non è compatibile, resettalo
            if (value.goalId && exam) {
              const goal = helpers.goalById(value.goalId);
              if (goal && (goal.courseId || "") !== (exam.courseId || "")) {
                updates.goalId = "";
              }
            }
            onChange(updates);
          }}
        />
      </View>
    );
  }

  // Campo: selezione obiettivo (filtrato per corso dell'esame selezionato)
  if (field.type === "goal") {
    let filteredGoals = helpers.goalOptions;
    if (value.examId) {
      const exam = helpers.examById(value.examId);
      const examCourseId = exam?.courseId || "";
      filteredGoals = helpers.goalOptions.filter(
        (g) => (helpers.goalById(g.id)?.courseId || "") === examCourseId
      );
    }
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...filteredGoals.map((g) => g.id)]}
          labels={{
            "": "Nessuno",
            ...Object.fromEntries(filteredGoals.map((g) => [g.id, g.title])),
          }}
          value={current || ""}
          onChange={(id) => {
            const goal = id ? helpers.goalById(id) : null;
            const updates = { ...value, goalId: id };
            // Se c'è un esame selezionato e non è compatibile, resettalo
            if (value.examId && goal) {
              const exam = helpers.examById(value.examId);
              if (exam && (exam.courseId || "") !== (goal.courseId || "")) {
                updates.examId = "";
              }
            }
            onChange(updates);
          }}
        />
      </View>
    );
  }

  // Campo: selezione a tendina per liste lunghe (es. Mesi, Voti)
  if (field.type === "select" || (field.options && field.options.length > 5)) {
    if (Platform.OS === "web") {
      return (
        <WebSelect field={field} current={current} set={set} styles={styles} themeColors={themeColors} />
      );
    }
    return (
      <MobileSelect field={field} current={current} set={set} styles={styles} themeColors={themeColors} />
    );
  }

  // Campo: opzioni predefinite (Segmented control generico per liste corte)
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
            const clean = txt.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s''\-]/g, "");
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

  // GESTIONE TEMPO (Ore e Minuti separati)
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

      if (isActual && !("estimatedHours" in value)) {
        const maxMinutes = parseInt(value.plannedHours || "0", 10);
        if (total > maxMinutes) return;
      }

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
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={hoursVal > 0 || totalMinutes > 0 ? String(hoursVal) : ""}
              placeholder="Ore"
              onChangeText={(txt) => handleTimeChange(txt, minutesVal)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={minutesVal > 0 || totalMinutes > 0 ? String(minutesVal) : ""}
              placeholder="Minuti"
              maxLength={2}
              onChangeText={(txt) => {
                let m = parseInt(txt, 10) || 0;
                if (m > 59) m = 59;
                handleTimeChange(hoursVal, m);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Fallback per campi testuali generici
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