import React from "react";
import { View, Text, Pressable, Platform, TextInput, Modal } from "react-native";
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

const esitoBadge = (tc, esito) => {
  if (esito === "Superato")     return { bg: tc.badgeLowBg, fg: tc.badgeLowText };
  if (esito === "Non superato") return { bg: tc.dangerBg,   fg: tc.dangerText };
  return { bg: tc.badgeMedBg, fg: tc.badgeMedText };
};

export default function ExamsScreen({ data, helpers, upsert, remove, addSuggestedSession }) {
  const { styles, themeColors: tc } = useStyles();

  const [tab, setTab]                   = React.useState("Futuri");
  const [esitoFilter, setEsitoFilter]   = React.useState("Tutti");
  const [editing, setEditing]           = React.useState(null);
  const [query, setQuery]               = React.useState("");
  const [dateFrom, setDateFrom]         = React.useState("");
  const [dateTo, setDateTo]             = React.useState("");
  const [showDateFilter, setShowDateFilter] = React.useState(false);

  // Step 1: GradeModal — quale esame sta per essere valutato
  const [gradeExam, setGradeExam]       = React.useState(null);
  // Step 2: CourseGradeModal — chiedere se il voto è anche quello del corso
  const [cgmExam, setCgmExam]           = React.useState(null);
  const [cgmVoto, setCgmVoto]           = React.useState(null);
  // Step 3 (opzionale): conflitto — il corso ha già un voto
  const [conflictData, setConflictData] = React.useState(null);

  // Ordinamento
  const [sortBy, setSortBy]             = React.useState("date");
  const [sortOrder, setSortOrder]       = React.useState(null);

  const handleSortPress = (key) => {
    if (sortBy === key) {
      const currentDir = sortOrder || (tab === "Passati" ? "desc" : "asc");
      setSortOrder(currentDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // --- Categorizzazione ---
  const isDone = (e) =>
    e.completed || e.status === "Completato" || e.status === "Annullato" ||
    e.esito === "Superato" || e.esito === "Non superato";

  const isConsegna   = (e) => e.type === "Consegna";
  const isToDeliver  = (e) => isConsegna(e) && e.date >= isoToday && !isDone(e);
  const isOverdue    = (e) => isConsegna(e) && e.date <  isoToday && !isDone(e);
  const isFuture     = (e) => e.date >= isoToday && !isDone(e) && !isConsegna(e);
  const isPast       = (e) => !isFuture(e) && !isOverdue(e) && !isToDeliver(e);

  const overdueCount   = data.exams.filter(isOverdue).length;
  const deliverCount   = data.exams.filter(isToDeliver).length;

  // --- Azioni sugli esami ---
  const markSuperato = (exam, voto, isForCourse = false) => {
    upsert("exams", { ...exam, esito: "Superato", completed: true, voto: voto || "", isGradeForCourse: isForCourse });
    if (isForCourse && exam.courseId) {
      const course = helpers.courseById(exam.courseId);
      if (course) upsert("courses", { ...course, actualGrade: voto, status: "Completato" });
    }
  };

  const markNonSuperato = (exam) =>
    upsert("exams", { ...exam, esito: "Non superato", completed: true });

  const markCompletata = (exam) =>
    upsert("exams", { ...exam, completed: true });

  // Dopo GradeModal: se c'è un voto e un corso associato, si apre CourseGradeModal
  const onGradeSelected = (exam, voto) => {
    setGradeExam(null);
    if (!voto) {
      markSuperato(exam, "");
    } else if (exam.courseId && helpers.courseById(exam.courseId)) {
      setCgmVoto(voto);
      setCgmExam(exam);
    } else {
      markSuperato(exam, voto);
    }
  };

  // Risposta al CourseGradeModal
  const onCourseGradeAnswer = (isForCourse) => {
    if (!cgmExam) return;
    if (isForCourse) {
      const course = helpers.courseById(cgmExam.courseId);
      // Se il corso ha già un voto (assegnato da un altro esame), chiedi cosa fare
      if (course?.actualGrade) {
        const prevExam = data.exams.find(
          (e) => e.courseId === cgmExam.courseId && e.isGradeForCourse && e.id !== cgmExam.id
        );
        setConflictData({ exam: cgmExam, voto: cgmVoto, course, prevExam });
        setCgmExam(null);
        setCgmVoto(null);
        return;
      }
    }
    markSuperato(cgmExam, cgmVoto, isForCourse);
    setCgmExam(null);
    setCgmVoto(null);
  };

  // Risoluzione conflitto voto corso
  const onConflictResolve = (useNew) => {
    if (!conflictData) return;
    if (useNew) {
      // Toglie il badge "voto corso" all'esame precedente
      if (conflictData.prevExam) {
        upsert("exams", { ...conflictData.prevExam, isGradeForCourse: false });
      }
      markSuperato(conflictData.exam, conflictData.voto, true);
    } else {
      // Mantiene il vecchio, salva il nuovo solo come voto esame
      markSuperato(conflictData.exam, conflictData.voto, false);
    }
    setConflictData(null);
  };

  // --- Filtraggio e Ordinamento ---
  const tabFilter = { Futuri: isFuture, "Da consegnare": isToDeliver, "In ritardo": isOverdue, Passati: isPast };
  const exams = [...data.exams]
    .filter(tabFilter[tab] || (() => true))
    .filter((e) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (helpers.courseById(e.courseId)?.name || "").toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      );
    })
    .filter((e) => (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo))
    .filter((e) => tab !== "Passati" || esitoFilter === "Tutti" || (e.esito || "Da valutare") === esitoFilter)
    .sort((a, b) => {
      const field = sortBy || "date";
      const direction = sortOrder || (tab === "Passati" ? "desc" : "asc");

      let comparison = 0;
      if (field === "date") {
        comparison = a.date.localeCompare(b.date);
      } else if (field === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (field === "course") {
        const aCourse = helpers.courseById(a.courseId)?.name || "";
        const bCourse = helpers.courseById(b.courseId)?.name || "";
        comparison = aCourse.localeCompare(bCourse);
      }

      return direction === "asc" ? comparison : -comparison;
    });

  const tabLabels = {};
  if (deliverCount > 0) tabLabels["Da consegnare"] = `Da consegnare (${deliverCount})`;
  if (overdueCount > 0) tabLabels["In ritardo"]    = `In ritardo (${overdueCount})`;

  // Campi del form: negli esami futuri non ha senso scegliere esito o voto
  const editingIsFuture = editing && !isDone(editing) && (editing.date || "") >= isoToday;
  const examFields = [
    { key: "title",    label: "Titolo *",          required: true },
    { key: "courseId", label: "Corso associato",    type: "course" },
    { key: "date",     label: "Data *",             required: true },
    { key: "type",     label: "Tipo",               options: ["Altro","Consegna","Prova intercorso","Prova orale","Prova scritta"] },
    { key: "priority", label: "Priorità",           options: ["Alta","Media","Bassa"] },
    ...(!editingIsFuture ? [
      { key: "esito",  label: "Esito",              options: ["Da valutare","Superato","Non superato"] },
      { key: "voto",   label: "Voto",               options: ["", ...gradeOptions] },
    ] : []),
    { key: "notes",    label: "Note",               multiline: true },
  ];

  const dateInputStyle = {
    padding: "8px 10px", borderRadius: 10, fontSize: 14, width: "100%", boxSizing: "border-box",
    border: `1px solid ${tc.borderDark}`, backgroundColor: tc.card, color: tc.textTitle,
  };

  return (
    <View>
      <ScreenTop title="Esami e scadenze" button="Nuovo esame" onPress={() => setEditing({ ...emptyExam })} />
      <SearchBox value={query} onChangeText={setQuery} placeholder="Cerca esame, corso o tipo..." />

      {/* Barra filtro data */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Pressable
          style={[
            styles.secondaryButton,
            { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
            (showDateFilter || dateFrom || dateTo) && { backgroundColor: tc.primary },
          ]}
          onPress={() => setShowDateFilter(!showDateFilter)}
        >
          <MaterialIcons name="date-range" size={16}
            color={(showDateFilter || dateFrom || dateTo) ? tc.textOnPrimary : tc.textBody} />
          <Text style={[styles.secondaryButtonText, { fontSize: 13 },
            (showDateFilter || dateFrom || dateTo) && { color: tc.textOnPrimary }]}>
            {(dateFrom || dateTo) ? "Filtro date attivo" : "Filtra per data"}
          </Text>
        </Pressable>
        {(dateFrom || dateTo) && (
          <Pressable style={[styles.secondaryButton, { paddingVertical: 8, paddingHorizontal: 12 }]}
            onPress={() => { setDateFrom(""); setDateTo(""); }}>
            <Text style={[styles.secondaryButtonText, { fontSize: 13 }]}>Rimuovi filtro</Text>
          </Pressable>
        )}
      </View>

      {showDateFilter && (
        <View style={[styles.card, { marginBottom: 14 }]}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Periodo</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[["Da", dateFrom, setDateFrom], ["A", dateTo, setDateTo]].map(([label, val, setVal]) => (
              <View key={label} style={{ flex: 1 }}>
                <Text style={[styles.rowMeta, { marginBottom: 4 }]}>{label}</Text>
                {Platform.OS === "web"
                  ? <input type="date" value={val} onChange={(e) => setVal(e.target.value)} style={dateInputStyle} />
                  : <TextInput style={[styles.input, { marginBottom: 0 }]} value={val}
                      onChangeText={setVal} placeholder="YYYY-MM-DD" placeholderTextColor={tc.textMuted} />
                }
              </View>
            ))}
          </View>
        </View>
      )}

      <Segmented
        options={["Futuri", "Da consegnare", "In ritardo", "Passati"]}
        labels={tabLabels} value={tab}
        onChange={(v) => {
          setTab(v);
          if (v !== "Passati") setEsitoFilter("Tutti");
          setSortBy("date");
          setSortOrder(null);
        }}
      />
      {tab === "Passati" && (
        <Segmented options={esitoFilterOptions} value={esitoFilter} onChange={setEsitoFilter} />
      )}

      {/* Barra di ordinamento */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <Text style={{ fontSize: 13, color: tc.textMuted, fontWeight: "600" }}>Ordina per:</Text>
        {[
          { key: "date", label: "Data" },
          { key: "title", label: "Titolo" },
          { key: "course", label: "Corso" }
        ].map((opt) => {
          const active = sortBy === opt.key;
          const activeDir = active ? (sortOrder || (tab === "Passati" ? "desc" : "asc")) : null;
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

      {exams.map((exam) => {
        const courseName    = helpers.courseById(exam.courseId)?.name;
        const badge         = esitoBadge(tc, exam.esito);
        const isDeliveryTab = tab === "Da consegnare" || tab === "In ritardo";
        const showEsito     = isDeliveryTab || (tab === "Passati" && (!exam.esito || exam.esito === "Da valutare"));
        const extraWarn     = (exam.isGradeForCourse && exam.voto)
          ? `Questo esame è il voto finale del corso "${courseName || ""}". Eliminandolo, il voto verrà rimosso e il corso tornerà in corso.`
          : "";

        return (
          <View key={exam.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{exam.title}</Text>
                <Text style={styles.rowMeta}>
                  {courseName || "Senza corso"} · {exam.type} · {formatDate(exam.date)}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <PriorityBadge value={exam.priority} />
                {tab === "Da consegnare" && <Text style={[styles.badge, { backgroundColor: tc.badgeMedBg, color: tc.badgeMedText }]}>Da consegnare</Text>}
                {tab === "In ritardo"    && <Text style={[styles.badge, { backgroundColor: tc.dangerBg,   color: tc.dangerText   }]}>In ritardo</Text>}
                {tab === "Passati"       && <Text style={[styles.badge, { backgroundColor: badge.bg,       color: badge.fg        }]}>{exam.esito || "Da valutare"}</Text>}
                {exam.esito === "Superato" && exam.voto && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4,
                    backgroundColor: tc.badgeLowBg, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 }}>
                    <Text style={{ fontSize: 14 }}>🏅</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: tc.badgeLowText }}>{exam.voto}</Text>
                  </View>
                )}
                {exam.isGradeForCourse && exam.voto && (
                  <Text style={[styles.badge, { backgroundColor: tc.primary + "22", color: tc.primary, fontSize: 11 }]}>✓ Voto corso</Text>
                )}
              </View>
            </View>

            {exam.notes ? <Text style={styles.bodyText}>{exam.notes}</Text> : null}

            {showEsito && (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <Pressable style={[styles.secondaryButton, { flex: 1, backgroundColor: tc.badgeLowBg, flexDirection: "row", gap: 6, justifyContent: "center" }]}
                  onPress={() => setGradeExam(exam)}>
                  <MaterialIcons name="check-circle" size={16} color={tc.badgeLowText} />
                  <Text style={[styles.secondaryButtonText, { color: tc.badgeLowText }]}>Superato</Text>
                </Pressable>
                <Pressable style={[styles.secondaryButton, { flex: 1, backgroundColor: tc.dangerBg, flexDirection: "row", gap: 6, justifyContent: "center" }]}
                  onPress={() => markNonSuperato(exam)}>
                  <MaterialIcons name="cancel" size={16} color={tc.dangerText} />
                  <Text style={[styles.secondaryButtonText, { color: tc.dangerText }]}>Non superato</Text>
                </Pressable>
              </View>
            )}

            <View style={[styles.actions, { flexWrap: "wrap" }]}>
              {isDeliveryTab && (
                <Pressable style={[styles.primaryButton, { flexDirection: "row", gap: 6, alignItems: "center" }]}
                  onPress={() => markCompletata(exam)}>
                  <MaterialIcons name="check" size={16} color={tc.textOnPrimary} />
                  <Text style={styles.primaryButtonText}>Completata</Text>
                </Pressable>
              )}
              <Pressable style={styles.secondaryButton} onPress={() => addSuggestedSession(exam)}>
                <Text style={styles.secondaryButtonText}>Vai al Planner</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setEditing(exam)}>
                <Text style={styles.secondaryButtonText}>Modifica</Text>
              </Pressable>
              <DangerButton
                onPress={() => remove("exams", exam.id)}
                itemName={exam.title} itemType="esame"
                warningMessage="L'eliminazione di un esame rimuoverà anche tutte le attività del planner ad esso associate."
                extraWarning={extraWarn}
              />
            </View>
          </View>
        );
      })}

      <GradeModal
        visible={Boolean(gradeExam)} tc={tc} styles={styles}
        onClose={() => setGradeExam(null)}
        onSave={(voto) => onGradeSelected(gradeExam, voto)}
      />

      <CourseGradeModal
        visible={Boolean(cgmExam)} tc={tc}
        voto={cgmVoto}
        courseName={helpers.courseById(cgmExam?.courseId)?.name || ""}
        onNo={() => onCourseGradeAnswer(false)}
        onYes={() => onCourseGradeAnswer(true)}
        onClose={() => onCourseGradeAnswer(false)}
      />

      <ConflictGradeModal
        visible={Boolean(conflictData)} tc={tc}
        data={conflictData}
        onKeepOld={() => onConflictResolve(false)}
        onUseNew={() => onConflictResolve(true)}
        onClose={() => onConflictResolve(false)}
      />

      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica esame" : "Nuovo esame"}
        value={editing} fields={examFields}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => { upsert("exams", item); setEditing(null); }}
        helpers={helpers}
      />
    </View>
  );
}

/* -------------------------
   GradeModal — selezione voto
------------------------- */
function GradeModal({ visible, tc, styles, onClose, onSave }) {
  const [sel, setSel] = React.useState(null);
  React.useEffect(() => { if (visible) setSel(null); }, [visible]);

  const label    = sel === "" ? "Nessun voto" : sel ? `(${sel})` : "";
  const canSave  = sel !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={{ maxWidth: 420, width: "92%", borderRadius: 24, overflow: "hidden",
          backgroundColor: tc.card, shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 }}>

          <View style={{ backgroundColor: tc.primary, paddingVertical: 18, paddingHorizontal: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>🏅</Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.3 }}>Inserisci il voto</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Seleziona il voto ottenuto</Text>
            <Pressable onPress={onClose} style={{ position: "absolute", top: 12, right: 14,
              width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)",
              justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>✕</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              {gradeOptions.map((grade) => {
                const active = sel === grade;
                return (
                  <Pressable key={grade} onPress={() => setSel(grade)} style={{
                    width: grade === "30L" ? 54 : 44, height: 42, borderRadius: 11,
                    justifyContent: "center", alignItems: "center",
                    backgroundColor: active ? tc.primary : tc.card,
                    borderWidth: 2, borderColor: active ? tc.primary : tc.borderDark,
                    shadowColor: active ? tc.primary : "transparent",
                    shadowOffset: { width: 0, height: 3 }, shadowOpacity: active ? 0.35 : 0,
                    shadowRadius: 6, elevation: active ? 5 : 0,
                  }}>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: active ? "#fff" : tc.textTitle }}>{grade}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => setSel("")} style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginBottom: 14,
              backgroundColor: sel === "" ? tc.badgeMedBg : tc.card,
              borderWidth: 2, borderColor: sel === "" ? tc.badgeMedText : tc.borderDark,
            }}>
              <MaterialIcons name="block" size={18} color={sel === "" ? tc.badgeMedText : tc.textMuted} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: sel === "" ? tc.badgeMedText : tc.textTitle }}>Nessun voto</Text>
                <Text style={{ fontSize: 11, color: tc.textMuted }}>Superato senza voto numerico</Text>
              </View>
            </Pressable>

            <View style={{ gap: 8 }}>
              <Pressable disabled={!canSave} onPress={() => onSave(sel)} style={{
                borderRadius: 12, paddingVertical: 12, flexDirection: "row", gap: 8,
                alignItems: "center", justifyContent: "center",
                backgroundColor: canSave ? tc.primary : tc.borderDark, opacity: canSave ? 1 : 0.45,
              }}>
                <MaterialIcons name="check-circle" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Conferma {label}</Text>
              </Pressable>
              <Pressable onPress={onClose} style={{
                borderRadius: 12, paddingVertical: 11, alignItems: "center",
                backgroundColor: tc.card, borderWidth: 1.5, borderColor: tc.borderDark,
              }}>
                <Text style={{ color: tc.textBody, fontWeight: "600", fontSize: 14 }}>Annulla</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* -------------------------
   CourseGradeModal — voto = voto finale del corso?
------------------------- */
function CourseGradeModal({ visible, tc, voto, courseName, onClose, onYes, onNo }) {
  if (!voto) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" }}>
        <View style={{ backgroundColor: tc.card, borderRadius: 24, maxWidth: 400, width: "90%",
          overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 }}>

          <View style={{ alignItems: "center", paddingTop: 28, paddingBottom: 16, paddingHorizontal: 24 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tc.primary + "18",
              justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ fontSize: 28 }}>🎓</Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: "800", color: tc.textTitle, textAlign: "center", marginBottom: 10 }}>
              Voto finale del corso?
            </Text>
            <Text style={{ fontSize: 14, color: tc.textBody, textAlign: "center", lineHeight: 21 }}>
              Il voto <Text style={{ fontWeight: "800", color: tc.primary, fontSize: 15 }}>{voto}</Text> corrisponde
              anche al voto finale del corso{"\n"}
              <Text style={{ fontWeight: "700", color: tc.textTitle }}>{courseName}</Text>?
            </Text>
          </View>

          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: tc.primary + "12",
            borderRadius: 12, padding: 12, flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <MaterialIcons name="info-outline" size={17} color={tc.primary} style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontSize: 13, color: tc.textBody, lineHeight: 19 }}>
              Se sì, il corso passerà a <Text style={{ fontWeight: "700" }}>Completato</Text> e mostrerà il voto {voto} nella sezione Corsi.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, padding: 20, paddingTop: 0 }}>
            <ModalBtn label="No" sub="Solo voto esame" onPress={onNo} tc={tc} />
            <ModalBtn label="Sì" sub="Completa il corso" onPress={onYes} tc={tc} primary />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* -------------------------
   ConflictGradeModal — il corso ha già un voto: tenerlo o sostituirlo?
------------------------- */
function ConflictGradeModal({ visible, tc, data, onKeepOld, onUseNew, onClose }) {
  if (!data) return null;
  const { voto, course, prevExam } = data;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" }}>
        <View style={{ backgroundColor: tc.card, borderRadius: 24, maxWidth: 400, width: "90%",
          overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 }}>

          <View style={{ alignItems: "center", paddingTop: 28, paddingBottom: 16, paddingHorizontal: 24 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tc.dangerBg,
              justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: "800", color: tc.textTitle, textAlign: "center", marginBottom: 10 }}>
              Il corso ha già un voto
            </Text>
            <Text style={{ fontSize: 14, color: tc.textBody, textAlign: "center", lineHeight: 21 }}>
              Il corso <Text style={{ fontWeight: "700", color: tc.textTitle }}>{course.name}</Text> ha già
              il voto <Text style={{ fontWeight: "800", color: tc.primary }}>{course.actualGrade}</Text>
              {prevExam ? ` (da "${prevExam.title}")` : ""}.{"\n"}
              Vuoi sostituirlo con <Text style={{ fontWeight: "800", color: tc.primary }}>{voto}</Text>?
            </Text>
          </View>

          <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: tc.dangerBg + "55",
            borderRadius: 12, padding: 12, flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <MaterialIcons name="warning" size={17} color={tc.dangerText} style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontSize: 13, color: tc.textBody, lineHeight: 19 }}>
              Se sostituisci, il badge <Text style={{ fontWeight: "700" }}>✓ Voto corso</Text> verrà rimosso dall{"'"}esame precedente.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, padding: 20, paddingTop: 0 }}>
            <ModalBtn label={`Mantieni ${course.actualGrade}`} sub="Nessuna modifica" onPress={onKeepOld} tc={tc} />
            <ModalBtn label={`Usa ${voto}`} sub="Sostituisci voto" onPress={onUseNew} tc={tc} primary />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* Bottone riutilizzabile per i modali */
function ModalBtn({ label, sub, onPress, tc, primary = false }) {
  return (
    <Pressable onPress={onPress} style={{
      flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center",
      backgroundColor: primary ? tc.primary : tc.card,
      borderWidth: primary ? 0 : 2, borderColor: tc.borderDark,
      shadowColor: primary ? tc.primary : "transparent",
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: primary ? 0.35 : 0,
      shadowRadius: 10, elevation: primary ? 6 : 0,
    }}>
      <Text style={{ fontWeight: "700", fontSize: 15, color: primary ? "#fff" : tc.textTitle }}>{label}</Text>
      <Text style={{ fontSize: 11, color: primary ? "rgba(255,255,255,0.75)" : tc.textMuted, marginTop: 2 }}>{sub}</Text>
    </Pressable>
  );
}