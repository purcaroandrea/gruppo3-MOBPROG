import { View, Text, Pressable, Switch } from "react-native";
import styles from "../styles/styles";
import ScreenTop from "../components/ScreenTop";
import DangerButton from "../components/DangerButton";
import EntityModal from "../components/EntityModal";
import { emptySession } from "../data/emptyTemplates";
import { addDays, startOfWeek, weekday, formatDate } from "../helpers/date";

export default function PlannerScreen({ data, helpers, upsert, remove }) {
  const [editing, setEditing] = React.useState(null);
  const [weekStart, setWeekStart] = React.useState(startOfWeek(new Date().toISOString().slice(0, 10)));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const visibleSessions = data.sessions.filter((s) => days.includes(s.date));

  const toggleComplete = (session) => {
    upsert("sessions", {
      ...session,
      completed: !session.completed,
      actualHours: session.actualHours || session.plannedHours,
    });
  };

  return (
    <View>
      <ScreenTop
        title="Planner settimanale"
        button="Nuova attività"
        onPress={() => setEditing({ ...emptySession })}
      />

      <View style={styles.weekBar}>
        <Pressable style={styles.iconButton} onPress={() => setWeekStart(addDays(weekStart, -7))}>
          <Text style={styles.iconButtonText}>{"<<"}</Text>
        </Pressable>

        <Text style={styles.weekTitle}>
          {formatDate(days[0])} - {formatDate(days[6])}
        </Text>

        <Pressable style={styles.iconButton} onPress={() => setWeekStart(addDays(weekStart, 7))}>
          <Text style={styles.iconButtonText}>{">>"}</Text>
        </Pressable>
      </View>

      <View style={styles.calendar}>
        {days.map((day) => {
          const daily = visibleSessions.filter((s) => s.date === day);
          return (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{weekday(day)}</Text>
              <Text style={styles.dayDate}>{day.slice(8, 10)}</Text>

              {daily.map((session) => (
                <Pressable
                  key={session.id}
                  style={[
                    styles.miniSession,
                    session.completed && styles.miniSessionDone,
                  ]}
                  onPress={() => setEditing(session)}
                >
                  <Text style={styles.miniSessionText}>{session.title}</Text>
                  <Text style={styles.miniSessionMeta}>{session.plannedHours}h</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>

      {visibleSessions.map((session) => (
        <View key={session.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{session.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(session.courseId)?.name || "Senza corso"} ·{" "}
                {session.kind} · {formatDate(session.date)}
              </Text>
            </View>

            <Switch value={session.completed} onValueChange={() => toggleComplete(session)} />
          </View>

          <Text style={styles.bodyText}>
            Previsto {session.plannedHours || 0}h · Svolto {session.actualHours || 0}h
          </Text>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(session)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>

            <DangerButton onPress={() => remove("sessions", session.id)} />
          </View>
        </View>
      ))}

      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica attività" : "Nuova attività"}
        value={editing}
        fields={[
          { key: "title", label: "Titolo", required: true },
          { key: "courseId", label: "Corso", type: "course" },
          { key: "examId", label: "Esame", type: "exam" },
          { key: "date", label: "Data (YYYY-MM-DD)", required: true },
          { key: "kind", label: "Tipo", options: ["Studio", "Ripasso", "Progetto", "Presentazione"] },
          { key: "plannedHours", label: "Ore previste", numeric: true },
          { key: "actualHours", label: "Ore svolte", numeric: true },
          { key: "completed", label: "Completata", type: "boolean" },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          upsert("sessions", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}