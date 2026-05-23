import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import styles from "../styles/styles";
import ScreenTop from "../components/ScreenTop";
import SearchBox from "../components/SearchBox";
import Segmented from "../components/Segmented";
import StatusBadge from "../components/StatusBadge";
import DangerButton from "../components/DangerButton";
import EntityModal from "../components/EntityModal";
import { emptyCourse } from "../data/emptyTemplates";

const courseStates = ["Tutti", "Da iniziare", "In corso", "Da ripassare", "Completato", "Superato"];

export default function CoursesScreen(props) {
  const { data, helpers, upsert, remove, setSelectedCourseId } = props;

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("Tutti");
  const [editing, setEditing] = React.useState(null);

  const courses = data.courses.filter((course) => {
    const matchesQuery = course.name.toLowerCase().includes(query.toLowerCase());
    const matchesState = filter === "Tutti" || course.status === filter;
    return matchesQuery && matchesState;
  });

  return (
    <View>
      <ScreenTop title="Corsi" button="Nuovo corso" onPress={() => setEditing({ ...emptyCourse })} />

      <SearchBox value={query} onChangeText={setQuery} placeholder="Cerca corso" />

      <Segmented options={courseStates} value={filter} onChange={setFilter} />

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
                {course.teacher} · {course.semester} · {course.credits} CFU
              </Text>
            </View>
            <StatusBadge value={course.status} />
          </View>

          <Text style={styles.bodyText}>{course.notes}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(course)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>

            <DangerButton onPress={() => remove("courses", course.id)} />
          </View>
        </Pressable>
      ))}
      
      
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica corso" : "Nuovo corso"}
        value={editing}
        fields={[
          { key: "name", label: "Nome", required: true },
          // commento
          { key: "prefix", label: "Titolo docente", options: ["Prof.", "Prof.ssa"] },
          { key: "teacherName", label: "Nome docente", placeholder: "Es. Rossi" },
          // commento
          // { key: "teacher", label: "Docente" },
          { key: "semester", label: "Semestre", options: ["1 semestre", "2 semestre"] },
          { key: "credits", label: "Crediti  (min 1 - max 20)", numeric: true },
          // VOTI
          { key: "targetGrade", label: "Voto desiderato", options: ["18","19","20","21","22","23","24","25","26","27","28","29","30","30L"] },
          { key: "actualGrade", label: "Voto ottenuto", options: ["","18","19","20","21","22","23","24","25","26","27","28","29","30","30L"] },
          // fine voti
           { key: "status", label: "Stato", options: ["Da iniziare", "In corso", "Completato"] },
          // { key: "status", label: "Stato", options: courseStates.slice(1) },
          { key: "materials", label: "Materiali", multiline: true },
          { key: "notes", label: "Note", multiline: true },
        ]}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          item.teacher = `${item.prefix} ${item.teacherName}`;   // aggiunta, eventualmente togli
          upsert("courses", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
   
}