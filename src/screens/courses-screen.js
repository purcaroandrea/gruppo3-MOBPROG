import React from "react";
import { Pressable, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import DangerButton from "../components/danger-button";
import EntityModal from "../components/entity-modal";
import ScreenTop from "../components/screen-top";
import SearchBox from "../components/search-box";
import Segmented from "../components/segmented";
import StatusBadge from "../components/status-badge";
import { emptyCourse } from "../data/emptyTemplates";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
const courseStates = ["Tutti", "Da iniziare", "In corso", "Completato"];

export default function CoursesScreen(props) {
  const { styles, themeColors: tc } = useStyles();
  const { data, helpers, upsert, remove, setSelectedCourseId } = props;

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("Tutti");
  const [editing, setEditing] = React.useState(null);

  // Filtri avanzati e Ordinamento
  const [showFilters, setShowFilters] = React.useState(false);
  const [semesterFilter, setSemesterFilter] = React.useState("Tutti");
  const [yearFilter, setYearFilter] = React.useState("Tutti");
  const [sortBy, setSortBy] = React.useState("name");
  const [sortOrder, setSortOrder] = React.useState(null);

  const handleSortPress = (key) => {
    if (sortBy === key) {
      const currentDir = sortOrder || "asc";
      setSortOrder(currentDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const courses = data.courses
    .filter((course) => {
      const matchesQuery = course.name.toLowerCase().includes(query.toLowerCase());
      const matchesState = filter === "Tutti" || course.status === filter;
      const matchesSemester = semesterFilter === "Tutti" || course.semester === semesterFilter;
      const matchesYear = yearFilter === "Tutti" || course.year === yearFilter;
      return matchesQuery && matchesState && matchesSemester && matchesYear;
    })
    .sort((a, b) => {
      const field = sortBy || "name";
      const direction = sortOrder || "asc";

      let comparison = 0;
      if (field === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (field === "credits") {
        comparison = Number(a.credits || 0) - Number(b.credits || 0);
      }

      return direction === "asc" ? comparison : -comparison;
    });
  return (
    <View>
      <ScreenTop title="Corsi" button="Nuovo corso" onPress={() => setEditing({ ...emptyCourse })} />

      <SearchBox value={query} onChangeText={setQuery} placeholder="Cerca corso" />

      {/* Pulsante Filtri avanzati */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Pressable
          style={[
            styles.secondaryButton,
            { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
            (showFilters || semesterFilter !== "Tutti" || yearFilter !== "Tutti") && { backgroundColor: tc.primary },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons name="filter-list" size={16}
            color={(showFilters || semesterFilter !== "Tutti" || yearFilter !== "Tutti") ? tc.textOnPrimary : tc.textBody} />
          <Text style={[styles.secondaryButtonText, { fontSize: 13 },
            (showFilters || semesterFilter !== "Tutti" || yearFilter !== "Tutti") && { color: tc.textOnPrimary }]}>
            {(semesterFilter !== "Tutti" || yearFilter !== "Tutti") ? "Filtri attivi" : "Filtra per semestre/anno"}
          </Text>
        </Pressable>
        {(semesterFilter !== "Tutti" || yearFilter !== "Tutti") && (
          <Pressable style={[styles.secondaryButton, { paddingVertical: 8, paddingHorizontal: 12 }]}
            onPress={() => { setSemesterFilter("Tutti"); setYearFilter("Tutti"); }}>
            <Text style={[styles.secondaryButtonText, { fontSize: 13 }]}>Rimuovi filtri</Text>
          </Pressable>
        )}
      </View>

      {showFilters && (
        <View style={[styles.card, { marginBottom: 14, gap: 12 }]}>
          <View>
            <Text style={[styles.label, { marginBottom: 6 }]}>Semestre</Text>
            <Segmented
              options={["Tutti", "1 semestre", "2 semestre"]}
              value={semesterFilter}
              onChange={setSemesterFilter}
            />
          </View>
          <View>
            <Text style={[styles.label, { marginBottom: 6 }]}>Anno</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {["Tutti", "1° anno", "2° anno", "3° anno", "4° anno", "5° anno", "6° anno", "7° anno", "Fuori corso"].map((yOpt) => {
                const active = yearFilter === yOpt;
                return (
                  <Pressable
                    key={yOpt}
                    onPress={() => setYearFilter(yOpt)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      backgroundColor: active ? tc.primary : tc.card,
                      borderWidth: 1.5,
                      borderColor: active ? tc.primary : tc.borderDark,
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: active ? tc.textOnPrimary : tc.textBody
                    }}>
                      {yOpt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <Segmented options={courseStates} value={filter} onChange={(v) => {
        setFilter(v);
        setSortBy("name");
        setSortOrder(null);
      }} />

      {/* Barra di ordinamento */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <Text style={{ fontSize: 13, color: tc.textMuted, fontWeight: "600" }}>Ordina per:</Text>
        {[
          { key: "name", label: "Nome" },
          { key: "credits", label: "CFU" }
        ].map((opt) => {
          const active = sortBy === opt.key;
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
                {course.teacher} · {course.year ? `${course.year} · ` : ""}{course.semester} · {course.credits} CFU
              </Text>


    
              {/* NOTE */}
              <Text style={styles.bodyText}>{course.notes}</Text>

              {/* MATERIALI */}
              {course.materials ? (
                <Text style={styles.bodyText}>Materiali: {course.materials}</Text>
              ) : null}


       
              {/* VOTO DESIDERATO */}
              {course.targetGrade ?
(
                <Text style={styles.bodyText}>Voto desiderato: {course.targetGrade}</Text>
              ) : null}
            </View>

            {/* STATO + VOTO OTTENUTO */}
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
        title={editing?.id ?
"Modifica corso" : "Nuovo corso"}
        value={editing}
        fields={[
          { key: "name", label: "Nome *", required: true },
          { key: "prefix", label: "Titolo docente", options: ["Prof.", "Prof.ssa"] },
          { key: "teacherName", label: "Nome docente *", placeholder: "Es. Rossi", required: true },

          { key: "semester", label: "Semestre", options: ["1 semestre", "2 semestre"] },
          { key: "year", label: "Anno", options: ["1° anno", "2° anno", "3° anno", "4° anno", "5° anno", "6° anno", "7° anno", "Fuori corso"] },
          { key: "credits", label: "Crediti * (min 1 - max 20)", numeric: true, required: true },

          // VOTI
          { key: "targetGrade", label: "Voto desiderato", options: ["18","19","20","21","22","23","24","25","26","27","28","29","30","30L"] },
          { key: "actualGrade", label: "Voto ottenuto", options: ["","18","19","20","21","22","23","24","25","26","27","28","29","30","30L"] },


          { key: "status", label: "Stato", options: ["Da iniziare", "In corso", "Completato"] },

          { key: "materials", label: "Materiali", multiline: true },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          item.teacher = item.prefix ? `${item.prefix} ${item.teacherName}` : item.teacherName;
          upsert("courses", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}