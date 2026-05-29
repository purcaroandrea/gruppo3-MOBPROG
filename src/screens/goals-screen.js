import React from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import ScreenTop from "../components/screen-top";
import Segmented from "../components/segmented";
import DangerButton from "../components/danger-button";
import Progress from "../components/progress";
import EntityModal from "../components/entity-modal";
import PriorityBadge from "../components/priority-badge";
import { emptyGoal } from "../data/emptyTemplates";

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
  const { styles } = useStyles();
  const [priority, setPriority] = React.useState("Tutte");
  const [showDone, setShowDone] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const goals = data.goals.filter((goal) => {
    const matchesPriority = priority === "Tutte" || goal.priority === priority;
    const matchesDone = showDone || !goal.completed;
    return matchesPriority && matchesDone;
  });

  return (
    <View>
      <ScreenTop
        title="Attività e obiettivi"
        button="Nuovo obiettivo"
        onPress={() => setEditing({ ...emptyGoal })}
      />

      <Segmented options={priorities} value={priority} onChange={setPriority} />

      <View style={styles.filterRow}>
        <Text style={styles.bodyText}>Mostra completati</Text>
        <Switch value={showDone} onValueChange={setShowDone} />
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

            <DangerButton onPress={() => remove("goals", goal.id)} />
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