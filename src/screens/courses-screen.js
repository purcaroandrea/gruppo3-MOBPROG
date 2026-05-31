import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import DangerButton from "../components/danger-button";
import DropdownFilter from "../components/dropdown-filter";
import EntityModal from "../components/entity-modal";
import ScreenTop from "../components/screen-top";
import SearchBar from "../components/search-bar";
import StatusBadge from "../components/status-badge";
import { emptyCourse } from "../data/emptyTemplates";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { formatDate } from "../helpers/date";

const courseStates    = ["Tutti", "Da iniziare", "In corso", "Completato", "Superato"];
const semesterOptions = ["Tutti", "1 semestre", "2 semestre"];
// Anno: rimossi "7° anno" e "Fuori corso" come richiesto
const annoOptions     = ["Tutti", "1° anno", "2° anno", "3° anno", "4° anno", "5° anno", "6° anno"];

export default function CoursesScreen(props) {
  const { styles, themeColors: tc } = useStyles();
  const { data, helpers, upsert, remove, setSelectedCourseId } = props;

  const [query, setQuery]                   = React.useState("");
  const [filter, setFilter]                 = React.useState("Tutti");
  const [editing, setEditing]               = React.useState(null);
  const [semesterFilter, setSemesterFilter] = React.useState("Tutti");
  const [yearFilter, setYearFilter]         = React.useState("Tutti");
  const [sortBy, setSortBy]                 = React.useState("name");
  const [sortOrder, setSortOrder]           = React.useState(null);

  const handleSortPress = (key) => {
    if (sortBy === key) {
      setSortOrder((sortOrder || "asc") === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const filtersActive = filter !== "Tutti" || semesterFilter !== "Tutti" || yearFilter !== "Tutti";

  const clearFilters = () => {
    setFilter("Tutti");
    setSemesterFilter("Tutti");
    setYearFilter("Tutti");
    setSortBy("name");
    setSortOrder(null);
  };

  const courses = data.courses
    .filter((course) => {
      const matchesQuery    = course.name.toLowerCase().includes(query.toLowerCase());
      const matchesState    = filter === "Tutti" || course.status === filter;
      const matchesSemester = semesterFilter === "Tutti" || course.semester === semesterFilter;
      const matchesYear     = yearFilter === "Tutti" || course.year === yearFilter;
      return matchesQuery && matchesState && matchesSemester && matchesYear;
    })
    .sort((a, b) => {
      const field     = sortBy || "name";
      const direction = sortOrder || "asc";
      let comparison  = 0;
      if (field === "name")    comparison = a.name.localeCompare(b.name);
      else if (field === "credits") comparison = Number(a.credits || 0) - Number(b.credits || 0);
      return direction === "asc" ? comparison : -comparison;
    });

  return (
    <View>
      <ScreenTop title="Corsi" button="Nuovo corso" onPress={() => setEditing({ ...emptyCourse })} />

      {/* Barra di ricerca con filtri integrati */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Cerca corso..."
        filtersActive={filtersActive}
        onClearFilters={clearFilters}
      >
        <View style={{ alignItems: "flex-start" }}>
          <Text style={[styles.label, { marginBottom: 6 }]}>Stato</Text>
          <DropdownFilter
            label="Stato"
            value={filter}
            options={courseStates}
            onChange={setFilter}
          />
        </View>

        <View style={{ alignItems: "flex-start" }}>
          <Text style={[styles.label, { marginBottom: 6 }]}>Semestre</Text>
          <DropdownFilter
            label="Semestre"
            value={semesterFilter}
            options={semesterOptions}
            onChange={setSemesterFilter}
          />
        </View>

        <View style={{ alignItems: "flex-start" }}>
          <Text style={[styles.label, { marginBottom: 6 }]}>Anno</Text>
          <DropdownFilter
            label="Anno"
            value={yearFilter}
            options={annoOptions}
            onChange={setYearFilter}
          />
        </View>
      </SearchBar>

      {/* Ordinamento */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Text style={{ fontSize: 13, color: tc.textMuted, fontWeight: "600" }}>Ordina per:</Text>
        {[
          { key: "name",    label: "Nome" },
          { key: "credits", label: "CFU" },
        ].map((opt) => {
          const active    = sortBy === opt.key;
          const activeDir = active ? (sortOrder || "asc") : null;
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
                  name={activeDir === "asc" ? "arrow-upward" : "arrow-downward"}
                  size={14}
                  color={tc.primary}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Lista corsi */}
      {courses.map((course) => (
        <Pressable
          key={course.id}
          style={styles.card}
          onPress={() => setSelectedCourseId(course.id)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{course.name}</Text>
              <Text style={styles.rowMeta}>
                {course.teacher} · {course.year ? `${course.year} · ` : ""}{course.semester} · {course.credits} CFU{course.endDate ? ` · Fine: ${formatDate(course.endDate)}` : ""}
              </Text>

              <Text style={styles.bodyText}>{course.notes}</Text>

              {course.materials ? (
                <Text style={styles.bodyText}>Materiali: {course.materials}</Text>
              ) : null}

              {course.targetGrade ? (
                <Text style={styles.bodyText}>Voto desiderato: {course.targetGrade}</Text>
              ) : null}
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <StatusBadge value={course.status} />
              {course.actualGrade ? (
                <View
                  style={{
                    marginTop: 6,
                    backgroundColor: "#f0f0f0",
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={[styles.rowMeta, { fontSize: 18 }]}>🏅 {course.actualGrade}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(course)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>
            <DangerButton
              onPress={() => remove("courses", course.id)}
              itemName={course.name}
              itemType="corso"
              warningMessage="L'eliminazione di un corso rimuoverà anche tutti gli esami, gli obiettivi e le attività del planner ad esso associati."
            />
          </View>
        </Pressable>
      ))}

      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica corso" : "Nuovo corso"}
        value={editing}
        fields={[
          { key: "name",       label: "Nome *",       required: true },
          { key: "prefix",     label: "Titolo docente", options: ["Prof.", "Prof.ssa"] },
          { key: "teacherName", label: "Nome docente *", placeholder: "Es. Rossi", required: true },
          { key: "semester",   label: "Semestre",     options: ["1 semestre", "2 semestre"] },
          { key: "year",       label: "Anno",         options: ["1° anno", "2° anno", "3° anno", "4° anno", "5° anno", "6° anno"] },
          { key: "credits",    label: "Crediti * (min 1 - max 20)", numeric: true, required: true },
          { key: "endDate",    label: "Data di fine", type: "date" },
          { key: "targetGrade", label: "Voto desiderato", options: ["18","19","20","21","22","23","24","25","26","27","28","29","30","30L"] },
          ...(editing?.status === "Completato" || editing?.status === "Superato" ? [
            { key: "actualGrade", label: "Voto ottenuto", options: ["","18","19","20","21","22","23","24","25","26","27","28","29","30","30L"] },
          ] : []),
          { key: "status",    label: "Stato",     options: ["Da iniziare", "In corso", "Completato", "Superato"] },
          { key: "materials", label: "Materiali", multiline: true },
          { key: "notes",     label: "Note",      multiline: true },
        ]}
        onChange={(next) => {
          if (next && next.status !== "Completato" && next.status !== "Superato") {
            next.actualGrade = "";
          }
          setEditing(next);
        }}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          item.teacher = item.prefix ? `${item.prefix} ${item.teacherName}` : item.teacherName;

          if (item.actualGrade) {
            item.status = "Superato";
          } else {
            const today = new Date().toISOString().slice(0, 10);
            if (item.endDate && item.endDate < today) item.status = "Completato";
          }

          const oldCourse = data.courses.find((c) => c.id === item.id);
          if (oldCourse && oldCourse.actualGrade !== item.actualGrade) {
            const prevExam = data.exams.find((e) => e.courseId === item.id && e.isGradeForCourse);
            if (prevExam) upsert("exams", { ...prevExam, isGradeForCourse: false });
          }

          upsert("courses", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}