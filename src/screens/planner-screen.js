import React from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import ScreenTop from "../components/screen-top";
import DangerButton from "../components/danger-button";
import EntityModal from "../components/entity-modal";
import SearchBox from "../components/searchBox";
import Segmented from "../components/segmented";
import { emptySession } from "../data/emptyTemplates";
import { addDays, startOfWeek, weekday, formatDate } from "../helpers/date";
import { minutesToHM } from "../helpers/format";

export default function PlannerScreen({ data, helpers, upsert, remove }) {
  const { styles } = useStyles();
  const [editing, setEditing] = React.useState(null);
  
  // Stati per la vista settimanale
  const [weekStart, setWeekStart] = React.useState(startOfWeek(new Date().toISOString().slice(0, 10)));
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Stati per la vista lista e comuni
  const [viewMode, setViewMode] = React.useState("Settimanale");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("Nome");
  const [sortOrder, setSortOrder] = React.useState("Crescente");
  const [periodFilter, setPeriodFilter] = React.useState("Tutte");

  // Helper per l'ordinamento
  const sortSessions = (sessionsList) => {
    return [...sessionsList].sort((a, b) => {
      let res = 0;
      if (sortBy === "Nome") {
        res = (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "Data di inserimento") {
        const timeA = parseInt(a.id?.match(/\d+/)?.[0] || "0", 10);
        const timeB = parseInt(b.id?.match(/\d+/)?.[0] || "0", 10);
        res = timeA - timeB;
      } else if (sortBy === "Corso") {
        const courseA = helpers.courseById(a.courseId)?.name || "Z";
        const courseB = helpers.courseById(b.courseId)?.name || "Z";
        res = courseA.localeCompare(courseB) || (a.title || "").localeCompare(b.title || "");
      }
      return sortOrder === "Crescente" ? res : -res;
    });
  };

  // Filtri e ordinamenti per la vista settimanale
  let visibleSessions = data.sessions.filter((session) => days.includes(session.date));

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    visibleSessions = visibleSessions.filter((s) => {
      const courseName = helpers.courseById(s.courseId)?.name || "";
      return (s.title || "").toLowerCase().includes(q) || courseName.toLowerCase().includes(q);
    });
  }

  visibleSessions = sortSessions(visibleSessions);

  // Filtri e ordinamenti per la lista completa
  const todayDate = new Date().toISOString().slice(0, 10);
  let allSessions = [...data.sessions];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    allSessions = allSessions.filter((s) => {
      const courseName = helpers.courseById(s.courseId)?.name || "";
      return (s.title || "").toLowerCase().includes(q) || courseName.toLowerCase().includes(q);
    });
  }

  if (periodFilter === "Future") {
    allSessions = allSessions.filter((s) => s.date >= todayDate);
  } else if (periodFilter === "Passate") {
    allSessions = allSessions.filter((s) => s.date < todayDate);
  }

  allSessions = sortSessions(allSessions);

  const toggleComplete = (session) => {
    //Troviamo la data di oggi in formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    //Se l'utente tenta di spuntare un'attività non completata e la data è nel futuro...
    if (!session.completed && session.date > today) {
      alert("Ehi, non correre! Non puoi completare un'attività pianificata nel futuro. ⏳");
      return; 
    }

    //Se il controllo viene superato, procede normalmente
    upsert("sessions", {
      ...session,
      completed: !session.completed,
      actualHours: session.actualHours || session.plannedHours,
    });
  };

  const renderSessionCard = (session) => (
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
        Previsto {minutesToHM(session.plannedHours)} · Svolto {minutesToHM(session.actualHours)}
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => setEditing(session)}>
          <Text style={styles.secondaryButtonText}>Modifica</Text>
        </Pressable>

        <DangerButton onPress={() => remove("sessions", session.id)} />
      </View>
    </View>
  );

  return (
    <View>
      <ScreenTop
        title="Planner"
        button="Nuova attività"
        onPress={() => setEditing({ ...emptySession })}
      />

      <Segmented
        options={["Settimanale", "Lista"]}
        value={viewMode}
        onChange={setViewMode}
      />

      {viewMode === "Settimanale" ? (
        <>
          {/* FILTRI E ORDINAMENTO SETTIMANALE */}
          <View style={styles.panel}>
            <SearchBox
              placeholder="Cerca per titolo o corso..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Ordina per</Text>
            <Segmented
              options={["Nome", "Data di inserimento", "Corso"]}
              value={sortBy}
              onChange={setSortBy}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Direzione</Text>
            <Segmented
              options={["Crescente", "Decrescente"]}
              value={sortOrder}
              onChange={setSortOrder}
            />
          </View>

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
                        {minutesToHM(session.plannedHours)} 
                      </Text>
                    </Pressable>
                  ))}
                </View>
              );
            })}
          </View>

          {/* LISTA SESSIONI SETTIMANALI */}
          {visibleSessions.map(renderSessionCard)}

          {visibleSessions.length === 0 && (
            <Text style={styles.bodyText}>Nessuna attività trovata per questa settimana.</Text>
          )}
        </>
      ) : (
        <>
          {/* VISTA LISTA COMPLETA */}
          <View style={styles.panel}>
            <SearchBox
              placeholder="Cerca per titolo o corso..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <Text style={[styles.label, { marginTop: 10 }]}>Periodo</Text>
            <Segmented
              options={["Tutte", "Future", "Passate"]}
              value={periodFilter}
              onChange={setPeriodFilter}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Ordina per</Text>
            <Segmented
              options={["Nome", "Data di inserimento", "Corso"]}
              value={sortBy}
              onChange={setSortBy}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Direzione</Text>
            <Segmented
              options={["Crescente", "Decrescente"]}
              value={sortOrder}
              onChange={setSortOrder}
            />
          </View>

          {allSessions.map(renderSessionCard)}
          
          {allSessions.length === 0 && (
            <Text style={styles.bodyText}>Nessuna attività trovata.</Text>
          )}
        </>
      )}

      {/* MODALE DI MODIFICA/CREAZIONE */}
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica attività" : "Nuova attività"}
        value={editing}
        fields={[
          { key: "title", label: "Nome *", required: true },
          { key: "courseId", label: "Corso", type: "course" },
          { key: "examId", label: "Esame", type: "exam" },
          { key: "goalId", label: "Obiettivo", type: "goal" },
          { key: "date", label: "Data * (YYYY-MM-DD)", required: true },
          { key: "kind", label: "Tipo", options: ["Altro", "Avanzamento sul progetto", "Completamento di consegne", "Esercitazione", "Lettura di materiale", "Ripasso"] },
          { key: "plannedHours", label: "Tempo di studio previsto", numeric: true },
          { key: "actualHours", label: "Tempo di studio impiegato", numeric: true },
          { key: "completed", label: "Completata", type: "boolean" },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={(next) => {
          setEditing(next);
        }}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          // Controllo: Impedisce la creazione nel passato
          const today = new Date().toISOString().slice(0, 10);
          
          if (!item.id && item.date < today) {
            alert("Non puoi pianificare una nuova attività in una data passata. ⏳");
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