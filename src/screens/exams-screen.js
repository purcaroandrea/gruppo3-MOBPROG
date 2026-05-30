import React from "react";
import { View, Text, Pressable, Platform, TextInput, Modal, ScrollView } from "react-native";
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

const isoToday = new Date().toISOString().slice(0, 10);
const esitoFilterOptions = ["Tutti", "Da valutare", "Superato", "Non superato"];
const gradeOptions = ["18","19","20","21","22","23","24","25","26","27","28","29","30","30L"];

export default function ExamsScreen({ data, helpers, upsert, remove, addSuggestedSession }) {
  const { styles, themeColors } = useStyles();
  const [tab, setTab] = React.useState("Futuri");
  const [esitoFilter, setEsitoFilter] = React.useState("Tutti");
  const [editing, setEditing] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [showDateFilter, setShowDateFilter] = React.useState(false);

  // Stato per il modale di inserimento voto
  const [gradeExam, setGradeExam] = React.useState(null);

  const hasDateFilter = Boolean(dateFrom || dateTo);

  /* ── Auto-categorizzazione ── */
  const isExamDone = (exam) =>
    exam.completed ||
    exam.status === "Completato" ||
    exam.status === "Annullato" ||
    exam.esito === "Superato" ||
    exam.esito === "Non superato";

  const isExamFuture = (exam) => exam.date >= isoToday && !isExamDone(exam);

  const isExamOverdue = (exam) =>
    exam.type === "Consegna" && exam.date < isoToday && !isExamDone(exam);

  const isExamPast = (exam) => !isExamFuture(exam) && !isExamOverdue(exam);

  const overdueCount = data.exams.filter(isExamOverdue).length;

  /* ── Salva esame con esito "Superato" + voto + aggiorna corso ── */
  const handleSuperato = (exam, voto) => {
    const updatedExam = { ...exam, esito: "Superato", completed: true, voto };
    upsert("exams", updatedExam);

    // Aggiorna actualGrade del corso associato
    if (exam.courseId) {
      const course = helpers.courseById(exam.courseId);
      if (course) {
        upsert("courses", { ...course, actualGrade: voto });
      }
    }
  };

  /* ── Salva esame con esito "Non superato" ── */
  const handleNonSuperato = (exam) => {
    upsert("exams", { ...exam, esito: "Non superato", completed: true });
  };

  /* ── Filtraggio ── */
  const exams = [...data.exams]
    .sort((a, b) =>
      tab === "Passati"
        ? b.date.localeCompare(a.date)   // più recenti prima
        : a.date.localeCompare(b.date)   // più vicini prima
    )
    .filter((exam) => {
      if (tab === "Futuri") return isExamFuture(exam);
      if (tab === "In ritardo") return isExamOverdue(exam);
      return isExamPast(exam);
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
    })
    .filter((exam) => {
      if (tab !== "Passati" || esitoFilter === "Tutti") return true;
      return (exam.esito || "Da valutare") === esitoFilter;
    });

  /* ── Colori badge esito ── */
  const esitoBadgeColors = (esito) => {
    const e = esito || "Da valutare";
    if (e === "Superato")
      return { bg: themeColors.badgeLowBg, fg: themeColors.badgeLowText };
    if (e === "Non superato")
      return { bg: themeColors.dangerBg, fg: themeColors.dangerText };
    return { bg: themeColors.badgeMedBg, fg: themeColors.badgeMedText };
  };

  return (
    <View>
      <ScreenTop
        title="Esami e scadenze"
        button="Nuovo esame"
        onPress={() => setEditing({ ...emptyExam })}
      />

      <SearchBox value={query} onChangeText={setQuery} placeholder="Cerca esame, corso o tipo..." />

      {/* ── Filtro date ── */}
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

      {/* ── Tab principali ── */}
      <Segmented
        options={["Futuri", "In ritardo", "Passati"]}
        labels={overdueCount > 0 ? { "In ritardo": `In ritardo (${overdueCount})` } : {}}
        value={tab}
        onChange={(v) => {
          setTab(v);
          if (v !== "Passati") setEsitoFilter("Tutti");
        }}
      />

      {/* ── Sub-filtro esito (solo Passati) ── */}
      {tab === "Passati" && (
        <Segmented
          options={esitoFilterOptions}
          value={esitoFilter}
          onChange={setEsitoFilter}
        />
      )}

      {/* ── Card esami ── */}
      {exams.map((exam) => {
        const badge = esitoBadgeColors(exam.esito);
        return (
          <View key={exam.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{exam.title}</Text>
                <Text style={styles.rowMeta}>
                  {helpers.courseById(exam.courseId)?.name || "Senza corso"} · {exam.type} ·{" "}
                  {formatDate(exam.date)}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <PriorityBadge value={exam.priority} />
                {tab === "In ritardo" && (
                  <Text
                    style={[
                      styles.badge,
                      { backgroundColor: themeColors.dangerBg, color: themeColors.dangerText },
                    ]}
                  >
                    In ritardo
                  </Text>
                )}
                {tab === "Passati" && (
                  <Text
                    style={[
                      styles.badge,
                      { backgroundColor: badge.bg, color: badge.fg },
                    ]}
                  >
                    {exam.esito || "Da valutare"}
                  </Text>
                )}
                {/* Badge voto per esami superati */}
                {exam.esito === "Superato" && exam.voto && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: themeColors.badgeLowBg,
                      paddingVertical: 3,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>🏅</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: themeColors.badgeLowText,
                      }}
                    >
                      {exam.voto}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {exam.notes ? <Text style={styles.bodyText}>{exam.notes}</Text> : null}

            {/* Bottoni esito rapido per "In ritardo" (Consegne) */}
            {tab === "In ritardo" && (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    { flex: 1, backgroundColor: themeColors.badgeLowBg, flexDirection: "row", gap: 6, justifyContent: "center" },
                  ]}
                  onPress={() => setGradeExam(exam)}
                >
                  <MaterialIcons name="check-circle" size={16} color={themeColors.badgeLowText} />
                  <Text style={[styles.secondaryButtonText, { color: themeColors.badgeLowText }]}>
                    Superato
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    { flex: 1, backgroundColor: themeColors.dangerBg, flexDirection: "row", gap: 6, justifyContent: "center" },
                  ]}
                  onPress={() => handleNonSuperato(exam)}
                >
                  <MaterialIcons name="cancel" size={16} color={themeColors.dangerText} />
                  <Text style={[styles.secondaryButtonText, { color: themeColors.dangerText }]}>
                    Non superato
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Bottoni esito rapido per Passati "Da valutare" */}
            {tab === "Passati" && (!exam.esito || exam.esito === "Da valutare") && (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    { flex: 1, backgroundColor: themeColors.badgeLowBg, flexDirection: "row", gap: 6, justifyContent: "center" },
                  ]}
                  onPress={() => setGradeExam(exam)}
                >
                  <MaterialIcons name="check-circle" size={16} color={themeColors.badgeLowText} />
                  <Text style={[styles.secondaryButtonText, { color: themeColors.badgeLowText }]}>
                    Superato
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    { flex: 1, backgroundColor: themeColors.dangerBg, flexDirection: "row", gap: 6, justifyContent: "center" },
                  ]}
                  onPress={() => handleNonSuperato(exam)}
                >
                  <MaterialIcons name="cancel" size={16} color={themeColors.dangerText} />
                  <Text style={[styles.secondaryButtonText, { color: themeColors.dangerText }]}>
                    Non superato
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={[styles.actions, { flexWrap: "wrap" }]}>
              {/* In ritardo → bottone completamento generico (va in Da valutare) */}
              {tab === "In ritardo" && (
                <Pressable
                  style={[styles.primaryButton, { flexDirection: "row", gap: 6, alignItems: "center" }]}
                  onPress={() => upsert("exams", { ...exam, completed: true })}
                >
                  <MaterialIcons name="check" size={16} color={themeColors.textOnPrimary} />
                  <Text style={styles.primaryButtonText}>Completata</Text>
                </Pressable>
              )}

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
        );
      })}

      {/* ── Modale inserimento voto ── */}
      <GradeModal
        visible={Boolean(gradeExam)}
        themeColors={themeColors}
        styles={styles}
        onClose={() => setGradeExam(null)}
        onSave={(voto) => {
          if (gradeExam) {
            handleSuperato(gradeExam, voto);
          }
          setGradeExam(null);
        }}
      />

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
          { key: "esito", label: "Esito", options: ["Da valutare", "Superato", "Non superato"] },
          { key: "voto", label: "Voto", options: ["", ...gradeOptions] },
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

/* ── Componente GradeModal ── */
function GradeModal({ visible, themeColors, styles, onClose, onSave }) {
  const [selectedGrade, setSelectedGrade] = React.useState(null);

  // Reset selezione quando si apre il modale
  React.useEffect(() => {
    if (visible) setSelectedGrade(null);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalSheet,
            { maxWidth: 400, width: "90%" },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Inserisci il voto</Text>
            <Pressable style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.rowMeta,
              { marginBottom: 16, paddingHorizontal: 20 },
            ]}
          >
            Seleziona il voto ottenuto per questo esame
          </Text>

          {/* Griglia voti */}
          <ScrollView style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {gradeOptions.map((grade) => {
                const isSelected = selectedGrade === grade;
                return (
                  <Pressable
                    key={grade}
                    onPress={() => setSelectedGrade(grade)}
                    style={{
                      width: 60,
                      height: 48,
                      borderRadius: 12,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: isSelected
                        ? themeColors.primary
                        : themeColors.card,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? themeColors.primary
                        : themeColors.borderDark,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "700",
                        color: isSelected
                          ? themeColors.textOnPrimary
                          : themeColors.textTitle,
                      }}
                    >
                      {grade}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Bottoni azione */}
            <View style={[styles.actions, { marginBottom: 20 }]}>
              <Pressable
                style={[
                  styles.primaryButton,
                  !selectedGrade && styles.disabledButton,
                  { flexDirection: "row", gap: 8, alignItems: "center" },
                ]}
                disabled={!selectedGrade}
                onPress={() => onSave(selectedGrade)}
              >
                <MaterialIcons name="check-circle" size={18} color={themeColors.textOnPrimary} />
                <Text style={styles.primaryButtonText}>
                  Conferma {selectedGrade ? `(${selectedGrade})` : ""}
                </Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Annulla</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}