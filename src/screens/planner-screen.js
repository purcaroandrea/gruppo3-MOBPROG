import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import DangerButton from "../components/danger-button";
import EntityModal from "../components/entity-modal";
import ScreenTop from "../components/screen-top";
import SearchBox from "../components/search-box";
import Segmented from "../components/segmented";
import { emptySession } from "../data/emptyTemplates";
import { addDays, formatDate, startOfWeek, weekday } from "../helpers/date";
import { minutesToHM } from "../helpers/format";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function PlannerScreen({ data, helpers, upsert, remove }) {
  const { styles, themeColors: tc } = useStyles();
  const [editing, setEditing] = React.useState(null);

  const handleSortPress = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "Crescente" ? "Decrescente" : "Crescente");
    } else {
      setSortBy(key);
      setSortOrder("Crescente");
    }
  };
  
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
      const exam = s.examId ? helpers.examById(s.examId) : null;
      const goal = s.goalId ? helpers.goalById(s.goalId) : null;
      const courseId = exam?.courseId || goal?.courseId;
      const courseName = courseId ? helpers.courseById(courseId)?.name || "" : "";
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
      const exam = s.examId ? helpers.examById(s.examId) : null;
      const goal = s.goalId ? helpers.goalById(s.goalId) : null;
      const courseId = exam?.courseId || goal?.courseId;
      const courseName = courseId ? helpers.courseById(courseId)?.name || "" : "";
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
            {(() => {
              const exam = session.examId ? helpers.examById(session.examId) : null;
              const goal = session.goalId ? helpers.goalById(session.goalId) : null;
              const courseId = exam?.courseId || goal?.courseId;
              return courseId ? helpers.courseById(courseId)?.name || "Senza corso" : "Senza corso";
            })()} ·{" "}
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

        <DangerButton
          onPress={() => remove("sessions", session.id)}
          itemName={session.title}
          itemType="attività"
        />
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

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 13, color: tc.textMuted, fontWeight: "600" }}>Ordina per:</Text>
              {[
                { key: "Nome", label: "Nome" },
                { key: "Data di inserimento", label: "Data" },
                { key: "Corso", label: "Corso" }
              ].map((opt) => {
                const active = sortBy === opt.key;
                const activeDir = active ? sortOrder : null;
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
                        name={activeDir === "Crescente" ? "arrow-upward" : "arrow-downward"}
                        size={14}
                        color={tc.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
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
            
            <Text style={[styles.label, { marginTop: 10, marginBottom: 6 }]}>Periodo</Text>
            <Segmented
              options={["Tutte", "Future", "Passate"]}
              value={periodFilter}
              onChange={setPeriodFilter}
            />

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 13, color: tc.textMuted, fontWeight: "600" }}>Ordina per:</Text>
              {[
                { key: "Nome", label: "Nome" },
                { key: "Data di inserimento", label: "Data" },
                { key: "Corso", label: "Corso" }
              ].map((opt) => {
                const active = sortBy === opt.key;
                const activeDir = active ? sortOrder : null;
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
                        name={activeDir === "Crescente" ? "arrow-upward" : "arrow-downward"}
                        size={14}
                        color={tc.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
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
          { key: "examId", label: "Esame", type: "exam" },
          { key: "goalId", label: "Obiettivo", type: "goal" },
          { key: "date", label: "Data *", required: true },
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