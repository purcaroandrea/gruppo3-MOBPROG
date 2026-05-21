import { View, Text, Pressable } from "react-native";
import styles from "../styles/styles";
import ScreenTop from "../components/ScreenTop";
import Segmented from "../components/Segmented";
import PriorityBadge from "../components/PriorityBadge";
import DangerButton from "../components/DangerButton";
import EntityModal from "../components/EntityModal";
import { emptyExam } from "../data/emptyTemplates";
import { formatDate } from "../helpers/date";

export default function ExamsScreen({ data, helpers, upsert, remove, addSuggestedSession }) {
  const [filter, setFilter] = React.useState("Futuri");
  const [editing, setEditing] = React.useState(null);

  const exams = [...data.exams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((exam) => {
      if (filter === "Completati") return exam.status === "Completato";
      if (filter === "Annullati") return exam.status === "Annullato";
      return exam.status !== "Completato" && exam.status !== "Annullato";
    });

  return (
    <View>
      <ScreenTop
        title="Esami e scadenze"
        button="Nuova scadenza"
        onPress={() => setEditing({ ...emptyExam })}
      />

      <Segmented
        options={["Futuri", "Completati", "Annullati"]}
        value={filter}
        onChange={setFilter}
      />

      {exams.map((exam) => (
        <View key={exam.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{exam.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(exam.courseId)?.name || "Senza corso"} · {exam.type} ·{" "}
                {formatDate(exam.date)}
              </Text>
            </View>
            <PriorityBadge value={exam.priority} />
          </View>

          <Text style={styles.bodyText}>{exam.notes}</Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => addSuggestedSession(exam)}
            >
              <Text style={styles.secondaryButtonText}>Vai al Planner</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => setEditing(exam)}
            >
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>

            <DangerButton onPress={() => remove("exams", exam.id)} />
          </View>
        </View>
      ))}

      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica scadenza" : "Nuova scadenza"}
        value={editing}
        fields={[
          { key: "title", label: "Titolo", required: true },
          { key: "courseId", label: "Corso", type: "course" },
          { key: "date", label: "Data (YYYY-MM-DD)", required: true },
          { key: "type", label: "Tipo", options: ["Esame", "Consegna"] },
          { key: "priority", label: "Priorità", options: ["Alta", "Media", "Bassa"] },
          { key: "status", label: "Stato", options: ["Futuro", "Programmato", "Completato", "Annullato"] },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          upsert("exams", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}