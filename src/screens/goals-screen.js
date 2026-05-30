import React from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import ScreenTop from "../components/screen-top";
import SearchBox from "../components/search-box";
import Segmented from "../components/segmented";
import DangerButton from "../components/danger-button";
import Progress from "../components/progress";
import EntityModal from "../components/entity-modal";
import PriorityBadge from "../components/priority-badge";
import { emptyGoal } from "../data/emptyTemplates";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const months = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre"
];




const priorities = ["Tutte", "Alta", "Media", "Bassa"];

export default function GoalsScreen({ data, helpers, upsert, remove }) {
  const { styles, themeColors: tc } = useStyles();
  const [priority, setPriority] = React.useState("Tutte");
  const [showDone, setShowDone] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("");

  // Ordinamento
  const [sortBy, setSortBy] = React.useState("name");
  const [sortOrder, setSortOrder] = React.useState(null);

  const handleSortPress = (key) => {
    if (sortBy === key) {
      const currentDir = sortOrder || "asc";
      setSortOrder(currentDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const courseFilterOptions = [
    "",
    ...helpers.courseOptions.map((c) => c.id),
  ];
  const courseFilterLabels = {
    "": "Tutti i corsi",
    ...Object.fromEntries(helpers.courseOptions.map((c) => [c.id, c.name])),
  };

  const goals = data.goals
    .filter((goal) => {
      const matchesPriority = priority === "Tutte" || goal.priority === priority;
      const matchesDone = showDone || !goal.completed;
      const matchesCourse = !courseFilter || goal.courseId === courseFilter;
      const matchesQuery = !query || (() => {
        const q = query.toLowerCase();
        const courseName = helpers.courseById(goal.courseId)?.name || "";
        return (
          goal.title.toLowerCase().includes(q) ||
          (goal.description || "").toLowerCase().includes(q) ||
          courseName.toLowerCase().includes(q)
        );
      })();
      return matchesPriority && matchesDone && matchesCourse && matchesQuery;
    })
    .sort((a, b) => {
      const field = sortBy || "name";
      const direction = sortOrder || "asc";

      let comparison = 0;
      if (field === "name") {
        comparison = a.title.localeCompare(b.title);
      } else if (field === "course") {
        const courseA = helpers.courseById(a.courseId)?.name || "";
        const courseB = helpers.courseById(b.courseId)?.name || "";
        comparison = courseA.localeCompare(courseB);
      }

      return direction === "asc" ? comparison : -comparison;
    });

  return (
    <View>
      <ScreenTop
        title="Obiettivi"
        button="Nuovo obiettivo"
        onPress={() => setEditing({ ...emptyGoal })}
      />

      <SearchBox value={query} onChangeText={setQuery} placeholder="Cerca obiettivo..." />

      <View style={[styles.card, { marginBottom: 10, paddingVertical: 12 }]}>
        <Text style={[styles.label, { marginBottom: 4 }]}>Filtra per corso</Text>
        <Segmented
          options={courseFilterOptions}
          labels={courseFilterLabels}
          value={courseFilter}
          onChange={(v) => {
            setCourseFilter(v);
            setSortBy("name");
            setSortOrder(null);
          }}
        />
      </View>

      <View style={[styles.card, { marginBottom: 10, paddingVertical: 12 }]}>
        <Text style={[styles.label, { marginBottom: 4 }]}>Priorità</Text>
        <Segmented options={priorities} value={priority} onChange={(v) => {
          setPriority(v);
          setSortBy("name");
          setSortOrder(null);
        }} />

        <View style={[styles.filterRow, { marginBottom: 0, marginTop: 4 }]}>
          <Text style={styles.bodyText}>Mostra completati</Text>
          <Switch value={showDone} onValueChange={setShowDone} />
        </View>
      </View>

      {/* Barra di ordinamento */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 12, flexWrap: "wrap" }}>
        <Text style={{ fontSize: 13, color: tc.textMuted, fontWeight: "600" }}>Ordina per:</Text>
        {[
          { key: "name", label: "Nome" },
          { key: "course", label: "Corso" }
        ].map((opt) => {
          const active = sortBy === opt.key;
          const activeDir = active ? (sortOrder || "asc") : null;
          return (
            <Pressable
              key={opt.key}
              onPress={() => handleSortPress(opt.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                backgroundColor: active ? tc.primary + "15" : tc.card,
                borderWidth: 1.5,
                borderColor: active ? tc.primary : tc.borderDark,
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: "700",
                color: active ? tc.primary : tc.textBody
              }}>
                {opt.label}
              </Text>
              {active && (
                <MaterialIcons
                  name={activeDir === "asc" ? "arrow-upward" : "arrow-downward"}
                  size={14}
                  color={tc.primary}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {goals.map((goal) => (
        <View key={goal.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{goal.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(goal.courseId)?.name || "Obiettivo personale"} ·{" "}
                {goal.periodStart && goal.periodEnd
             ? `${goal.periodStart} – ${goal.periodEnd}`
            : "Senza periodo"}


              </Text>
            </View>
            <PriorityBadge value={goal.priority} />
          </View>

          <Text style={styles.bodyText}>{goal.description}</Text>

           {goal.notes && (
            <Text style={styles.bodyText}>
              Note: {goal.notes}
            </Text>
          )}

          <Progress
            actual={parseFloat(goal.actualHours) || 0}
            total={parseFloat(goal.estimatedHours) || 0}
          />

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => upsert("goals", { ...goal, completed: !goal.completed })}
            >
              <Text style={styles.secondaryButtonText}>
                {goal.completed ? "Riapri" : "Completa"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => setEditing(goal)}
            >
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>

            <DangerButton
              onPress={() => remove("goals", goal.id)}
              itemName={goal.title}
              itemType="obiettivo"
            />
          </View>
        </View>
      ))}

      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica obiettivo" : "Nuovo obiettivo"}
        value={editing}
        fields={[
          { key: "title", label: "Titolo *", required: true },
          { key: "description", label: "Descrizione", multiline: true },
          { key: "courseId", label: "Corso", type: "course" },

          { key: "periodStart", label: "Mese iniziale", type: "select", options: months },
          { key: "periodEnd", label: "Mese finale", type: "select", options: months },

          { key: "priority", label: "Priorità", options: ["Alta", "Media", "Bassa"] },
          { key: "estimatedHours", label: "Tempo stimato", numeric: true },
          { key: "actualHours", label: "Tempo impiegato", numeric: true },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {        
          upsert("goals", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}