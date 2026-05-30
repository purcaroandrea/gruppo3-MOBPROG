import React from "react";
import { View, Text, Pressable, Platform, TextInput } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import ScreenTop from "../components/screen-top";
import SearchBox from "../components/search-box";
import Segmented from "../components/segmented";
import PriorityBadge from "../components/priority-badge";
import DangerButton from "../components/danger-button";
import EntityModal from "../components/entity-modal";
import { emptyExam } from "../data/emptyTemplates";
import { formatDate } from "../helpers/date";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ExamsScreen({ data, helpers, upsert, remove, addSuggestedSession }) {
  const { styles, themeColors } = useStyles();
  const [filter, setFilter] = React.useState("Futuri");
  const [editing, setEditing] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [showDateFilter, setShowDateFilter] = React.useState(false);

  const hasDateFilter = Boolean(dateFrom || dateTo);

  const exams = [...data.exams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((exam) => {
      if (filter === "Completati") return exam.status === "Completato";
      if (filter === "Annullati") return exam.status === "Annullato";
      return exam.status !== "Completato" && exam.status !== "Annullato";
    })
    .filter((exam) => {
      if (!query) return true;
      const q = query.toLowerCase();
      const courseName = helpers.courseById(exam.courseId)?.name || "";
      return (
        exam.title.toLowerCase().includes(q) ||
        courseName.toLowerCase().includes(q) ||
        exam.type.toLowerCase().includes(q)
      );
    })
    .filter((exam) => {
      if (dateFrom && exam.date < dateFrom) return false;
      if (dateTo && exam.date > dateTo) return false;
      return true;
    });

  return (
    <View>
      <ScreenTop
        title="Esami e scadenze"
        button="Nuovo esame"
        onPress={() => setEditing({ ...emptyExam })}
      />

      <SearchBox value={query} onChangeText={setQuery} placeholder="Cerca esame, corso o tipo..." />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Pressable
          style={[
            styles.secondaryButton,
            { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
            (showDateFilter || hasDateFilter) && { backgroundColor: themeColors.primary },
          ]}
          onPress={() => setShowDateFilter(!showDateFilter)}
        >
          <MaterialIcons
            name="date-range"
            size={16}
            color={(showDateFilter || hasDateFilter) ? themeColors.textOnPrimary : themeColors.textBody}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { fontSize: 13 },
              (showDateFilter || hasDateFilter) && { color: themeColors.textOnPrimary },
            ]}
          >
            {hasDateFilter ? "Filtro date attivo" : "Filtra per data"}
          </Text>
        </Pressable>

        {hasDateFilter && (
          <Pressable
            style={[styles.secondaryButton, { paddingVertical: 8, paddingHorizontal: 12 }]}
            onPress={() => { setDateFrom(""); setDateTo(""); }}
          >
            <Text style={[styles.secondaryButtonText, { fontSize: 13 }]}>Rimuovi filtro</Text>
          </Pressable>
        )}
      </View>

      {showDateFilter && (
        <View style={[styles.card, { marginBottom: 14 }]}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Periodo</Text>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowMeta, { marginBottom: 4 }]}>Da</Text>
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: `1px solid ${themeColors.borderDark}`,
                    fontSize: 14,
                    backgroundColor: themeColors.card,
                    color: themeColors.textTitle,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <TextInput
                  style={[styles.input, { marginBottom: 0 }]}
                  value={dateFrom}
                  onChangeText={setDateFrom}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={themeColors.textMuted}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowMeta, { marginBottom: 4 }]}>A</Text>
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: `1px solid ${themeColors.borderDark}`,
                    fontSize: 14,
                    backgroundColor: themeColors.card,
                    color: themeColors.textTitle,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <TextInput
                  style={[styles.input, { marginBottom: 0 }]}
                  value={dateTo}
                  onChangeText={setDateTo}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={themeColors.textMuted}
                />
              )}
            </View>
          </View>
        </View>
      )}

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

            <DangerButton
              onPress={() => remove("exams", exam.id)}
              itemName={exam.title}
              itemType="esame"
              warningMessage="L'eliminazione di un esame rimuoverà anche tutte le attività del planner ad esso associate."
            />
          </View>
        </View>
      ))}

      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica esame" : "Nuovo esame"}
        value={editing}
        fields={[
          { key: "title", label: "Titolo *", required: true },
          { key: "courseId", label: "Corso associato", type: "course" },
          { key: "date", label: "Data *", required: true },
          { key: "type", label: "Tipo", options: ["Altro", "Consegna", "Prova intercorso", "Prova orale", "Prova scritta"] },
          { key: "priority", label: "Priorità", options: ["Alta", "Media", "Bassa"] },
          { key: "status", label: "Stato", options: ["Futuro", "Completato", "Annullato"] },
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