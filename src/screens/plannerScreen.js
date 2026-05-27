import React from "react";
import { View, Text, Pressable, Switch } from "react-native";
import styles from "../styles/styles";
import ScreenTop from "../components/ScreenTop";
import DangerButton from "../components/DangerButton";
import EntityModal from "../components/EntityModal";
import { emptySession } from "../data/emptyTemplates";
import { addDays, startOfWeek, weekday, formatDate } from "../helpers/date";
import { minutesToHM } from "../helpers/format"; // 🔥 Importata la nuova formattazione del tempo

export default function PlannerScreen({ data, helpers, upsert, remove }) {
  const [editing, setEditing] = React.useState(null);
  const [weekStart, setWeekStart] = React.useState(startOfWeek(new Date().toISOString().slice(0, 10)));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const visibleSessions = data.sessions
    .filter((session) => days.includes(session.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const toggleComplete = (session) => {
    // 1. Troviamo la data di oggi in formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    // 2. Se l'utente tenta di spuntare un'attività non completata e la data è nel futuro...
    if (!session.completed && session.date > today) {
      // 👇 INSERISCI QUI LA TUA FRASE PERSONALIZZATA 👇
      alert("Ehi, non correre! Non puoi completare un'attività pianificata nel futuro. ⏳");
      return; // Questo blocca l'esecuzione ed evita che venga salvata come completata
    }

    // 3. Se il controllo viene superato, procede normalmente
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

      {/* BARRA NAVIGAZIONE SETTIMANA */}
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

      {/* CALENDARIO */}
      <View style={styles.calendar}>
        {days.map((day) => {
          // 🔥 Ordinamento corretto e sicuro degli orari (es. "09:00" vs "10:00")
          const daily = visibleSessions
            .filter((session) => session.date === day)
            .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

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
                  <Text style={styles.miniSessionMeta}>
                    {session.startTime && session.endTime
                      ? `${session.startTime}–${session.endTime}`
                      : minutesToHM(session.plannedHours)} 
                  </Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>

      {/* LISTA SESSIONI */}
      {visibleSessions.map((session) => (
        <View key={session.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{session.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(session.courseId)?.name || "Senza corso"} ·{" "}
                {session.kind} · {formatDate(session.date)}
                {session.startTime && session.endTime
                  ? ` · ${session.startTime}–${session.endTime}`
                  : ""}
              </Text>
            </View>

            <Switch value={session.completed} onValueChange={() => toggleComplete(session)} />
          </View>

          {session.examId && (
            <Text style={styles.rowMeta}>
              Esame: {helpers.examById(session.examId)?.title}
            </Text>
          )}

          {session.goalId && (
            <Text style={styles.rowMeta}>
              Obiettivo: {helpers.goalById(session.goalId)?.title}
            </Text>
          )}

          {session.notes && (
            <Text style={styles.bodyText}>
              Note: {session.notes}
            </Text>
          )}

          <Text style={styles.bodyText}>
            {/* 🔥 Mostra le ore formattate tramite minutesToHM */}
            Previsto {minutesToHM(session.plannedHours)} · Svolto {minutesToHM(session.actualHours)}
          </Text>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(session)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>

            <DangerButton onPress={() => remove("sessions", session.id)} />
          </View>
        </View>
      ))}

      {/* MODALE DI MODIFICA/CREAZIONE */}
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica attività" : "Nuova attività"}
        value={editing}
        fields={[
          { key: "title", label: "Nome", required: true },
          { key: "courseId", label: "Corso", type: "course" },
          { key: "examId", label: "Esame", type: "exam" },
          { key: "goalId", label: "Obiettivo", type: "goal" },
          { key: "date", label: "Data (YYYY-MM-DD)", required: true },
          { key: "startTime", label: "Ora inizio (HH:MM)" },
          { key: "endTime", label: "Ora fine (HH:MM)" },
          { key: "kind", label: "Tipo", options: ["Avanzamento sul progetto", "Completamento di consegne", "Esercitazione", "Lettura di materiale", "Ripasso"] },
          { key: "plannedHours", label: "Ore previste", numeric: true },
          { key: "actualHours", label: "Ore svolte", numeric: true },
          { key: "completed", label: "Completata", type: "boolean" },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={(next) => {
          setEditing(next);
          // 🔥 Ricalcola automaticamente i minuti totali se vengono cambiati gli orari
          if (next.startTime && next.endTime) {
            const [sh, sm] = next.startTime.split(":").map(Number);
            const [eh, em] = next.endTime.split(":").map(Number);
            
            let start = sh * 60 + sm;
            let end = eh * 60 + em;
            
            // Gestione notturna (es. 23:00 -> 01:00)
            if (end < start) {
              end += 24 * 60;
            }
            
            const diffMin = end - start;
            setEditing((prev) => ({ ...prev, plannedHours: String(diffMin) }));
          }
        }}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          if (!item.startTime || !item.endTime) {
            alert("Inserisci ora di inizio e ora di fine");
            return;
          }
          upsert("sessions", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}