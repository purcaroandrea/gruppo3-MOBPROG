import React from "react";
import { Pressable, Text, View } from "react-native";
import DangerButton from "../components/danger-button";
import EntityModal from "../components/entity-modal";
import ScreenTop from "../components/screen-top";
import SearchBox from "../components/search-box";
import Segmented from "../components/segmented";
import StatusBadge from "../components/status-badge";
import { emptyCourse } from "../data/emptyTemplates";
import { useStyles } from "../../hooks/useStyles";
const courseStates = ["Tutti", "Da iniziare", "In corso", "Completato"];

export default function CoursesScreen(props) {
  const { styles } = useStyles();
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


    
              {course.status === "Completato" && course.actualGrade ?
(
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

            <DangerButton onPress={() => remove("courses", course.id)} />
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