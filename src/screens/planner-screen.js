import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import DangerButton from "../components/danger-button";
import EntityModal from "../components/entity-modal";
import ScreenTop from "../components/screen-top";
import SearchBar from "../components/search-bar";
import Segmented from "../components/segmented";
import PriorityBadge from "../components/priority-badge";
import { emptySession } from "../data/emptyTemplates";
import { addDays, formatDate, startOfWeek, weekday, getSessionDaysCount } from "../helpers/date";
import { minutesToHM } from "../helpers/format";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DropdownFilter from "../components/dropdown-filter";

export default function PlannerScreen({ data, helpers, upsert, remove, prefilledSession, setPrefilledSession }) {
  const { styles, themeColors: tc } = useStyles();
  const [editing, setEditing] = React.useState(null);

  React.useEffect(() => {
    if (prefilledSession) {
      setEditing(prefilledSession);
      setPrefilledSession(null);
    }
  }, [prefilledSession, setPrefilledSession]);

  const handleEdit = (session) => {
    setEditing({
      ...session,
      endDate: session.endDate || session.date,
    });
  };

  const validateSession = (item) => {
    if (!item.date || !item.endDate) return null;
    if (item.endDate < item.date) {
      return "La data di fine non può essere antecedente alla data di inizio.";
    }

    const daysCount = getSessionDaysCount(item);
    const maxMinutes = daysCount * 24 * 60;

    const planned = parseInt(item.plannedHours || "0", 10);
    const actual = parseInt(item.actualHours || "0", 10);

    if (planned > maxMinutes) {
      return `Il tempo previsto non può superare 24 ore al giorno (${daysCount * 24} ore in totale per ${daysCount} ${daysCount === 1 ? "giorno" : "giorni"}).`;
    }
    if (actual > maxMinutes) {
      return `Il tempo impiegato non può superare 24 ore al giorno (${daysCount * 24} ore in totale per ${daysCount} ${daysCount === 1 ? "giorno" : "giorni"}).`;
    }

    return null;
  };

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
  const [priorityFilter, setPriorityFilter] = React.useState("Tutte");

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
  let visibleSessions = data.sessions.filter((session) => {
    const start = session.date;
    const end = session.endDate || session.date;
    return start <= days[6] && end >= days[0];
  });

  if (priorityFilter !== "Tutte") {
    visibleSessions = visibleSessions.filter((s) => (s.priority || "Media") === priorityFilter);
  }

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

  if (priorityFilter !== "Tutte") {
    allSessions = allSessions.filter((s) => (s.priority || "Media") === priorityFilter);
  }

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{session.title}</Text>
            <PriorityBadge value={session.priority || "Media"} />
          </View>
          <Text style={styles.rowMeta}>
            {(() => {
              const exam = session.examId ? helpers.examById(session.examId) : null;
              const goal = session.goalId ? helpers.goalById(session.goalId) : null;
              const courseId = exam?.courseId || goal?.courseId;
              return courseId ? helpers.courseById(courseId)?.name || "Senza corso" : "Senza corso";
            })()} ·{" "}
            {session.kind} ·{" "}
            {session.endDate && session.endDate !== session.date
              ? `${formatDate(session.date)} - ${formatDate(session.endDate)}`
              : formatDate(session.date)}
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
        <Pressable style={styles.secondaryButton} onPress={() => handleEdit(session)}>
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

  const filtersActive = priorityFilter !== "Tutte" || periodFilter !== "Tutte";

  const clearFilters = () => {
    setPriorityFilter("Tutte");
    setPeriodFilter("Tutte");
    setSortBy("Nome");
    setSortOrder("Crescente");
  };

  // Pannello filtri condiviso tra le due viste
  const filterPanel = (showPeriod = false) => (
    <SearchBar
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Cerca per titolo o corso..."
      filtersActive={filtersActive}
      onClearFilters={clearFilters}
    >
      {/* Periodo (solo vista Lista) */}
      {showPeriod && (
        <View>
          <Text style={[styles.label, { marginBottom: 6 }]}>Periodo</Text>
          <Segmented
            options={["Tutte", "Future", "Passate"]}
            value={periodFilter}
            onChange={setPeriodFilter}
          />
        </View>
      )}

      {/* Priorità */}
      <View style={{ alignItems: "flex-start" }}>
        <Text style={[styles.label, { marginBottom: 6 }]}>Priorità</Text>
        <DropdownFilter
          label="Priorità"
          value={priorityFilter}
          options={["Tutte", "Alta", "Media", "Bassa"]}
          onChange={setPriorityFilter}
        />
      </View>

      {/* Ordinamento */}
      <View>
        <Text style={[styles.label, { marginBottom: 6 }]}>Ordina per</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "Nome", label: "Nome" },
            { key: "Data di inserimento", label: "Data" },
            { key: "Corso", label: "Corso" },
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
                <Text style={{ fontSize: 12, fontWeight: "700", color: active ? tc.primary : tc.textBody }}>
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
    </SearchBar>
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
            {filterPanel(false)}
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
                .filter((session) => {
                  const start = session.date;
                  const end = session.endDate || session.date;
                  return start <= day && day <= end;
                })
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
                      onPress={() => handleEdit(session)}
                    >
                      <Text style={styles.miniSessionText}>{session.title}</Text>
                      <Text style={styles.miniSessionMeta}>
                        {(() => {
                          const daysCount = getSessionDaysCount(session);
                          if (daysCount > 1) {
                            return `${minutesToHM(Math.round(parseInt(session.plannedHours || "0", 10) / daysCount))}/g`;
                          }
                          return minutesToHM(session.plannedHours);
                        })()}
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
            {filterPanel(true)}
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
          { key: "date", label: "Data inizio *", required: true },
          { key: "endDate", label: "Data fine *", type: "date", required: true },
          { key: "kind", label: "Tipo", options: ["Studio", "Ripasso", "Esercitazione", "Preparazione esame", "Lettura di materiale", "Completamento di consegne", "Altro"] },
          { key: "priority", label: "Priorità", options: ["Alta", "Media", "Bassa"] },
          { key: "plannedHours", label: "Tempo di studio previsto", numeric: true },
          { key: "actualHours", label: "Tempo di studio impiegato", numeric: true },
          { key: "completed", label: "Completata", type: "boolean" },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={(next) => {
          if (next.date && (!next.endDate || next.endDate < next.date)) {
            next.endDate = next.date;
          }
          setEditing(next);
        }}
        onClose={() => setEditing(null)}
        validate={validateSession}
        onSave={(item) => {
          const today = new Date().toISOString().slice(0, 10);
          
          if (!item.id && item.date < today) {
            alert("Non puoi pianificare una nuova attività in una data passata. ⏳");
            return;
          }

          const finalItem = {
            ...item,
            endDate: item.endDate || item.date,
          };

          upsert("sessions", finalItem);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}