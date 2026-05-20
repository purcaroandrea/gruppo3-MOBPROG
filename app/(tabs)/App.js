import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";

const STORAGE_KEY = "study-planner-v1";

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

function isValidDateStrict(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const [year, month, day] = dateString.split("-").map(Number);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  const date = new Date(dateString);
  return date.getMonth() + 1 === month && date.getDate() === day;
}

const seedData = {
  courses: [
    {
      id: "course-1",
      name: "Statistica Applicata",
      teacher: "Prof. Addesso/Postiglione",
      semester: "2 semestre",
      credits: "6",
      status: "In corso",
      targetGrade: "28",
      actualGrade: "",
      materials: "Dispense, Script in linguaggio R, Appunti",
      notes: "Priorità alta: progetto e orale a fine sessione."
    },
    {
      id: "course-2",
      name: "Basi di Dati",
      teacher: "Prof. Gaeta",
      semester: "2 semestre",
      credits: "9",
      status: "In corso",
      targetGrade: "27",
      actualGrade: "",
      materials: "Slide SQL, Libro di testo, Dispense teoriche",
      notes: "Ripassare join, trigger e transazioni."
    },
    {
      id: "course-3",
      name: "Analisi Dei Segnali",
      teacher: "Prof. Restaino",
      semester: "1 semestre",
      credits: "9",
      status: "Completato",
      targetGrade: "28",
      actualGrade: "27",
      materials: "Dispense, Esercizi svolti, Casi di studio",
      notes: "Esame superato, conservare appunti di probabilità per Statistica Applicata."
    }
  ],
  exams: [
    {
      id: "exam-1",
      title: "Progetto Statistica Applicata",
      courseId: "course-1",
      date: "2026-07-20",
      type: "Esame",
      priority: "Alta",
      status: "Programmato",
      result: "",
      notes: "Studiare la teoria e lavorare in team al progetto."
    },
    {
      id: "exam-2",
      title: "Prova scritta di Analisi dei Segnali",
      courseId: "course-3",
      date: "2025-02-17",
      type: "Consegna",
      priority: "Media",
      status: "Completato",
      result: "",
      notes: "Fare tanti esercizi e simulazioni d'esame."
    },
    {
      id: "exam-3",
      title: "Prova scritta Basi di Dati",
      courseId: "course-2",
      date: "2026-07-02",
      type: "Esame",
      priority: "Alta",
      status: "Futuro",
      result: "",
      notes: "Simulare almeno tre prove complete."
    }
  ],
  sessions: [
    {
      id: "session-1",
      title: "Studiare Teoria della Stima",
      courseId: "course-1",
      examId: "exam-1",
      date: isoToday,
      kind: "Progetto",
      plannedHours: "2",
      actualHours: "2",
      completed: true,
      notes: "Capire i concetti e le relative applicazioni."
    },
    {
      id: "session-2",
      title: "Ripasso SQL avanzato",
      courseId: "course-2",
      examId: "exam-3",
      date: addDays(isoToday, 1),
      kind: "Ripasso",
      plannedHours: "2.5",
      actualHours: "",
      completed: false,
      notes: "Join, group by, vincoli."
    },
    {
      id: "session-3",
      title: "Preparare relazione",
      courseId: "course-1",
      examId: "exam-1",
      date: addDays(isoToday, 3),
      kind: "Presentazione",
      plannedHours: "1.5",
      actualHours: "",
      completed: false,
      notes: "Iniziare a coprire la prima parte del programma."
    }
  ],
  goals: [
    {
      id: "goal-1",
      title: "Avanzamento Statistica Applicata",
      description: "Arrivare a una buona conoscenza della teoria e ad un progetto quasi in ultimazione.",
      courseId: "course-1",
      period: "Giugno-Luglio",
      priority: "Media",
      completed: false,
      estimatedHours: "8",
      actualHours: "3",
      notes: "Avanzamento parallelo di studio individuale e progetto in gruppo."
    },
    {
      id: "goal-2",
      title: "Superare l'esame di Basi di Dati",
      description: "Dare il tutto per tutto.",
      courseId: "course-2",
      period: "Giugno-Luglio",
      priority: "Alta",
      completed: false,
      estimatedHours: "42",
      actualHours: "6",
      notes: "Sostenere almeno un'ora giornaliera di SQL."
    }
  ]
};

const emptyCourse = {
  name: "",
  teacher: "",
  semester: "",
  credits: "",
  status: "Da iniziare",
  targetGrade: "",
  actualGrade: "",
  materials: "",
  notes: ""
};

const emptyExam = {
  title: "",
  courseId: "",
  date: isoToday,
  type: "Esame",
  priority: "Media",
  status: "Futuro",
  result: "",
  notes: ""
};

const emptySession = {
  title: "",
  courseId: "",
  examId: "",
  date: isoToday,
  kind: "Studio",
  plannedHours: "1",
  actualHours: "",
  completed: false,
  notes: ""
};

const emptyGoal = {
  title: "",
  description: "",
  courseId: "",
  period: "",
  priority: "Media",
  completed: false,
  estimatedHours: "",
  actualHours: "",
  notes: ""
};

const tabs = ["Dashboard", "Corsi", "Esami", "Planner", "Obiettivi", "Pomodoro"];
const courseStates = ["Tutti", "Da iniziare", "In corso", "Da ripassare", "Completato", "Superato"];
const priorities = ["Tutte", "Alta", "Media", "Bassa"];

export default function App() {
  const [data, setData] = useState(seedData);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setData(JSON.parse(saved));
      } catch (error) {
        console.warn("Impossibile caricare i dati locali", error);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.warn("Impossibile salvare i dati locali", error)
    );
  }, [data, loaded]);

  const helpers = useMemo(() => createHelpers(data), [data]);

  const upsert = (collection, item) => {
  // Validazione data (solo se il campo esiste)
  if (item.date && !isValidDateStrict(item.date)) {
    alert("La data inserita non è valida.");
    return;
  }

  setData((current) => {
    const exists = current[collection].some((entry) => entry.id === item.id);
    return {
      ...current,
      [collection]: exists
        ? current[collection].map((entry) => (entry.id === item.id ? item : entry))
        : [{ ...item, id: `${collection}-${Date.now()}` }, ...current[collection]]
    };
  });
};


  const remove = (collection, id) => {
    setData((current) => ({
      ...current,
      [collection]: current[collection].filter((entry) => entry.id !== id)
    }));
  };

  const addSuggestedSession = (exam) => {
    const course = helpers.courseById(exam.courseId);
    upsert("sessions", {
      ...emptySession,
      title: `Ripasso mirato: ${course?.name || exam.title}`,
      courseId: exam.courseId,
      examId: exam.id,
      date: addDays(isoToday, 1),
      kind: "Ripasso",
      plannedHours: "2",
      notes: `Suggerita per la scadenza del ${formatDate(exam.date)}.`
    });
    setActiveTab("Planner");
  };

  const screenProps = {
    data,
    helpers,
    upsert,
    remove,
    setActiveTab,
    selectedCourseId,
    setSelectedCourseId,
    addSuggestedSession
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Study Planner & Exam Tracker</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{helpers.weekHours.planned}h</Text>
          <Text style={styles.headerBadgeSmall}>a settimana</Text>
        </View>
      </View>
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "Dashboard" && <Dashboard {...screenProps} />}
        {activeTab === "Corsi" && <CoursesScreen {...screenProps} />}
        {activeTab === "Esami" && <ExamsScreen {...screenProps} />}
        {activeTab === "Planner" && <PlannerScreen {...screenProps} />}
        {activeTab === "Obiettivi" && <GoalsScreen {...screenProps} />}
        {activeTab === "Pomodoro" && <PomodoroScreen />}
      </ScrollView>
    </SafeAreaView>
  );
}

function Dashboard({ data, helpers, setActiveTab, addSuggestedSession }) {
  const upcoming = helpers.upcomingExams.slice(0, 3);
  const topCourses = helpers.studyByCourse.slice(0, 4);

  return (
    <View>
      <Text style={styles.sectionTitle}>Panoramica</Text>
      <View style={styles.metricGrid}>
        <Metric label="Corsi" value={data.courses.length} />
        <Metric label="Esami futuri" value={helpers.futureExams.length} />
        <Metric label="Task aperti" value={helpers.openGoals + helpers.openSessions} />
        <Metric label="Ore svolte" value={`${helpers.weekHours.actual}h`} />
      </View>

      <Panel title="Scadenze imminenti" action="Vedi esami" onAction={() => setActiveTab("Esami")}>
        {upcoming.map((exam) => (
          <View key={exam.id} style={styles.rowCard}>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>{exam.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(exam.courseId)?.name || "Senza corso"} · {formatDate(exam.date)}
              </Text>
            </View>
            <PriorityBadge value={exam.priority} />
          </View>
        ))}
      </Panel>

      <Panel title="Ripartizione per corso delle ore settimanali">
        {topCourses.map((entry) => (
          <View key={entry.courseId} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{entry.name}</Text>
            <View style={styles.chartTrack}>
              <View style={[styles.chartFill, { width: `${entry.percent}%` }]} />
            </View>
            <Text style={styles.chartValue}>{entry.hours}h</Text>
          </View>
        ))}
      </Panel>

      {helpers.nextCriticalExam && (
        <Panel title="Suggerimento automatico">
          <Text style={styles.bodyText}>
            L'esame più vicino con priorità alta è {helpers.nextCriticalExam.title}. Conviene pianificare un
            ripasso per domani.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => addSuggestedSession(helpers.nextCriticalExam)}>
            <Text style={styles.primaryButtonText}>Crea attività</Text>
          </Pressable>
        </Panel>
      )}
    </View>
  );
}

function CoursesScreen(props) {
  const { data, helpers, upsert, remove, setSelectedCourseId } = props;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");
  const [editing, setEditing] = useState(null);

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
        <Pressable key={course.id} style={styles.card} onPress={() => setSelectedCourseId(course.id)}>
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
            <DangerButton onPress={() => confirmRemove("corso", () => remove("courses", course.id))} />
          </View>
        </Pressable>
      ))}
      <CourseDetail courseId={props.selectedCourseId} {...props} />
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica corso" : "Nuovo corso"}
        value={editing}
        fields={courseFields}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          upsert("courses", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}

function CourseDetail({ selectedCourseId, setSelectedCourseId, data, helpers, setActiveTab }) {
  const course = data.courses.find((entry) => entry.id === selectedCourseId);
  if (!course) return null;

  const exams = data.exams.filter((exam) => exam.courseId === course.id);
  const sessions = data.sessions.filter((session) => session.courseId === course.id);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedCourseId(null)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView>
            <Text style={styles.modalTitle}>{course.name}</Text>
            <Text style={styles.rowMeta}>{course.teacher}</Text>
            <Text style={styles.bodyText}>{course.notes}</Text>
            <Text style={styles.detailLine}>Materiali: {course.materials || "Non indicati"}</Text>
            <Text style={styles.detailLine}>
              Voto desiderato: {course.targetGrade || "-"} · Voto ottenuto: {course.actualGrade || "-"}
            </Text>
            <Panel title="Collegamenti">
              <Text style={styles.bodyText}>Esami collegati: {exams.length}</Text>
              <Text style={styles.bodyText}>Sessioni pianificate: {sessions.length}</Text>
              <Text style={styles.bodyText}>Ore previste: {helpers.hoursForCourse(course.id)}h</Text>
            </Panel>
            <View style={styles.actions}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  setSelectedCourseId(null);
                  setActiveTab("Planner");
                }}
              >
                <Text style={styles.primaryButtonText}>Vai al planner</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setSelectedCourseId(null)}>
                <Text style={styles.secondaryButtonText}>Chiudi</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ExamsScreen({ data, helpers, upsert, remove, addSuggestedSession }) {
  const [filter, setFilter] = useState("Futuri");
  const [editing, setEditing] = useState(null);
  const exams = [...data.exams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((exam) => {
      if (filter === "Completati") return exam.status === "Completato";
      if (filter === "Annullati") return exam.status === "Annullato";
      return exam.status !== "Completato" && exam.status !== "Annullato";
    });

  return (
    <View>
      <ScreenTop title="Esami e scadenze" button="Nuova scadenza" onPress={() => setEditing({ ...emptyExam })} />
      <Segmented options={["Futuri", "Completati", "Annullati"]} value={filter} onChange={setFilter} />
      {exams.map((exam) => (
        <View key={exam.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{exam.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(exam.courseId)?.name || "Senza corso"} · {exam.type} · {formatDate(exam.date)}
              </Text>
            </View>
            <PriorityBadge value={exam.priority} />
          </View>
          <Text style={styles.bodyText}>{exam.notes}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => addSuggestedSession(exam)}>
              <Text style={styles.secondaryButtonText}>Suggerisci sessione di studio</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(exam)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>
            <DangerButton onPress={() => confirmRemove("scadenza", () => remove("exams", exam.id))} />
          </View>
        </View>
      ))}
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica scadenza" : "Nuova scadenza"}
        value={editing}
        fields={examFields}
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

function PlannerScreen({ data, helpers, upsert, remove }) {
  const [editing, setEditing] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(isoToday));
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const visibleSessions = data.sessions.filter((session) => days.includes(session.date));

  const toggleComplete = (session) => {
    upsert("sessions", { ...session, completed: !session.completed, actualHours: session.actualHours || session.plannedHours });
  };

  return (
    <View>
      <ScreenTop title="Planner settimanale" button="Nuova attività" onPress={() => setEditing({ ...emptySession })} />
      <View style={styles.weekBar}>
        <Pressable style={styles.iconButton} onPress={() => setWeekStart(addDays(weekStart, -7))}>
          <Text style={styles.iconButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.weekTitle}>
          {formatDate(days[0])} - {formatDate(days[6])}
        </Text>
        <Pressable style={styles.iconButton} onPress={() => setWeekStart(addDays(weekStart, 7))}>
          <Text style={styles.iconButtonText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.calendar}>
        {days.map((day) => {
          const daily = visibleSessions.filter((session) => session.date === day);
          return (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{weekday(day)}</Text>
              <Text style={styles.dayDate}>{day.slice(8, 10)}</Text>
              {daily.map((session) => (
                <Pressable key={session.id} style={[styles.miniSession, session.completed && styles.miniSessionDone]} onPress={() => setEditing(session)}>
                  <Text style={styles.miniSessionText}>{session.title}</Text>
                  <Text style={styles.miniSessionMeta}>{session.plannedHours}h</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>
      {visibleSessions.map((session) => (
        <View key={session.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{session.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(session.courseId)?.name || "Senza corso"} · {session.kind} · {formatDate(session.date)}
              </Text>
            </View>
            <Switch value={session.completed} onValueChange={() => toggleComplete(session)} />
          </View>
          <Text style={styles.bodyText}>
            Previsto {session.plannedHours || 0}h · Svolto {session.actualHours || 0}h
          </Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(session)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>
            <DangerButton onPress={() => confirmRemove("attività", () => remove("sessions", session.id))} />
          </View>
        </View>
      ))}
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica attività" : "Nuova attività"}
        value={editing}
        fields={sessionFields}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          upsert("sessions", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}

function GoalsScreen({ data, helpers, upsert, remove }) {
  const [priority, setPriority] = useState("Tutte");
  const [showDone, setShowDone] = useState(false);
  const [editing, setEditing] = useState(null);

  const goals = data.goals.filter((goal) => {
    const matchesPriority = priority === "Tutte" || goal.priority === priority;
    const matchesDone = showDone || !goal.completed;
    return matchesPriority && matchesDone;
  });

  return (
    <View>
      <ScreenTop title="Attività e obiettivi" button="Nuovo obiettivo" onPress={() => setEditing({ ...emptyGoal })} />
      <Segmented options={priorities} value={priority} onChange={setPriority} />
      <View style={styles.filterRow}>
        <Text style={styles.bodyText}>Mostra completati</Text>
        <Switch value={showDone} onValueChange={setShowDone} />
      </View>
      {goals.map((goal) => (
        <View key={goal.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{goal.title}</Text>
              <Text style={styles.rowMeta}>
                {helpers.courseById(goal.courseId)?.name || "Obiettivo personale"} · {goal.period || "Senza periodo"}
              </Text>
            </View>
            <PriorityBadge value={goal.priority} />
          </View>
          <Text style={styles.bodyText}>{goal.description}</Text>
          <Progress actual={toNumber(goal.actualHours)} total={toNumber(goal.estimatedHours)} />
          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => upsert("goals", { ...goal, completed: !goal.completed })}>
              <Text style={styles.secondaryButtonText}>{goal.completed ? "Riapri" : "Completa"}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setEditing(goal)}>
              <Text style={styles.secondaryButtonText}>Modifica</Text>
            </Pressable>
            <DangerButton onPress={() => confirmRemove("obiettivo", () => remove("goals", goal.id))} />
          </View>
        </View>
      ))}
      <EntityModal
        visible={Boolean(editing)}
        title={editing?.id ? "Modifica obiettivo" : "Nuovo obiettivo"}
        value={editing}
        fields={goalFields}
        onChange={setEditing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          upsert("goals", item);
          setEditing(null);
        }}
        helpers={helpers}
      />
    </View>
  );
}

function PomodoroScreen() {
  const [mode, setMode] = useState("Studio");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value > 1) return value - 1;
        const nextMode = mode === "Studio" ? "Pausa" : "Studio";
        if (mode === "Studio") setSessions((count) => count + 1);
        setMode(nextMode);
        return nextMode === "Studio" ? 25 * 60 : 5 * 60;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, mode]);

  const reset = (nextMode = mode) => {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(nextMode === "Studio" ? 25 * 60 : 5 * 60);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Pomodoro Timer</Text>
      <View style={styles.timerPanel}>
        <Text style={styles.timerMode}>{mode}</Text>
        <Text style={styles.timer}>{formatTimer(secondsLeft)}</Text>
        <Text style={styles.rowMeta}>Sessioni completate oggi: {sessions}</Text>
        <View style={styles.actionsCentered}>
          <Pressable style={styles.primaryButton} onPress={() => setRunning((value) => !value)}>
            <Text style={styles.primaryButtonText}>{running ? "Pausa" : "Avvia"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => reset("Studio")}>
            <Text style={styles.secondaryButtonText}>Ripristina</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => reset("Pausa")}>
            <Text style={styles.secondaryButtonText}>Pausa breve</Text>
          </Pressable>
        </View>
      </View>
      <Panel title="Che cos'è il Pomodoro Timer?">
        <Text style={styles.bodyText}>
          Il Pomodoro Timer è un ingegnoso e simpatico strumento di computazione temporale che viene in aiuto agli studenti
          nel momento in cui ci si vuole concentrare in uno studio ben organizzato: saranno alternate sessioni da 25 minuti di 
          massima attenzione e di piena operatività e sessioni da 5 minuti di meritato riposo.
          Le ore effettive svolte saranno normalmente registrate, giacché la funzione è integrata nel planner.
        </Text>
      </Panel>
    </View>
  );
}

function EntityModal({ visible, title, value, fields, onChange, onClose, onSave, helpers }) {
  if (!value) return null;
  const valid = fields.every((field) => !field.required || String(value[field.key] || "").trim());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{title}</Text>
            {fields.map((field) => (
              <Field key={field.key} field={field} value={value} onChange={onChange} helpers={helpers} />
            ))}
            <View style={styles.actions}>
              <Pressable style={[styles.primaryButton, !valid && styles.disabledButton]} disabled={!valid} onPress={() => onSave(value)}>
                <Text style={styles.primaryButtonText}>Salva</Text>
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

function Field({ field, value, onChange, helpers }) {
  const current = value[field.key];
  const set = (next) => onChange({ ...value, [field.key]: next });

  if (field.type === "course") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...helpers.courseOptions.map((option) => option.id)]}
          labels={{ "": "Nessuno", ...Object.fromEntries(helpers.courseOptions.map((option) => [option.id, option.name])) }}
          value={current || ""}
          onChange={set}
        />
      </View>
    );
  }

  if (field.type === "exam") {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented
          options={["", ...helpers.examOptions.map((option) => option.id)]}
          labels={{ "": "Nessuno", ...Object.fromEntries(helpers.examOptions.map((option) => [option.id, option.title])) }}
          value={current || ""}
          onChange={set}
        />
      </View>
    );
  }

  if (field.options) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <Segmented options={field.options} value={current} onChange={set} />
      </View>
    );
  }

  if (field.type === "boolean") {
    return (
      <View style={styles.filterRow}>
        <Text style={styles.label}>{field.label}</Text>
        <Switch value={Boolean(current)} onValueChange={set} />
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput
        style={[styles.input, field.multiline && styles.textarea]}
        value={String(current || "")}
        onChangeText={set}
        placeholder={field.placeholder || field.label}
        multiline={field.multiline}
        keyboardType={field.numeric ? "decimal-pad" : "default"}
      />
    </View>
  );
}

function ScreenTop({ title, button, onPress }) {
  return (
    <View style={styles.screenTop}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{button}</Text>
      </Pressable>
    </View>
  );
}

function SearchBox(props) {
  return <TextInput style={styles.input} autoCapitalize="none" clearButtonMode="while-editing" {...props} />;
}

function Segmented({ options, labels = {}, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmented}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.segment, value === option && styles.segmentActive]} onPress={() => onChange(option)}>
          <Text style={[styles.segmentText, value === option && styles.segmentTextActive]} numberOfLines={1}>
            {labels[option] || option || "Nessuno"}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Panel({ title, action, onAction, children }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelTop}>
        <Text style={styles.panelTitle}>{title}</Text>
        {action && (
          <Pressable onPress={onAction}>
            <Text style={styles.linkText}>{action}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusBadge({ value }) {
  return <Text style={[styles.badge, styles.statusBadge]}>{value}</Text>;
}

function PriorityBadge({ value }) {
  return <Text style={[styles.badge, value === "Alta" ? styles.highBadge : value === "Bassa" ? styles.lowBadge : styles.mediumBadge]}>{value}</Text>;
}

function DangerButton({ onPress }) {
  return (
    <Pressable style={styles.dangerButton} onPress={onPress}>
      <Text style={styles.dangerButtonText}>Elimina</Text>
    </Pressable>
  );
}

function Progress({ actual, total }) {
  const percent = total ? Math.min(100, Math.round((actual / total) * 100)) : 0;
  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.rowMeta}>
        {actual}h / {total || 0}h · {percent}%
      </Text>
    </View>
  );
}

function createHelpers(data) {
  const courseById = (id) => data.courses.find((course) => course.id === id);
  const futureExams = data.exams.filter((exam) => exam.status !== "Completato" && exam.status !== "Annullato" && exam.date >= isoToday);
  const upcomingExams = [...futureExams].sort((a, b) => a.date.localeCompare(b.date));
  const weekStart = startOfWeek(isoToday);
  const weekEnd = addDays(weekStart, 6);
  const weekSessions = data.sessions.filter((session) => session.date >= weekStart && session.date <= weekEnd);
  const weekHours = {
    planned: round1(weekSessions.reduce((sum, session) => sum + toNumber(session.plannedHours), 0)),
    actual: round1(weekSessions.reduce((sum, session) => sum + toNumber(session.actualHours), 0))
  };
  const maxCourseHours = Math.max(1, ...data.courses.map((course) => hoursForCourse(course.id)));

  function hoursForCourse(courseId) {
    return round1(data.sessions.filter((session) => session.courseId === courseId).reduce((sum, session) => sum + toNumber(session.plannedHours), 0));
  }

  return {
    courseById,
    futureExams,
    upcomingExams,
    nextCriticalExam: upcomingExams.find((exam) => exam.priority === "Alta") || upcomingExams[0],
    courseOptions: data.courses.map((course) => ({ id: course.id, name: course.name })),
    examOptions: data.exams.map((exam) => ({ id: exam.id, title: exam.title })),
    openSessions: data.sessions.filter((session) => !session.completed).length,
    openGoals: data.goals.filter((goal) => !goal.completed).length,
    weekHours,
    hoursForCourse,
    studyByCourse: data.courses
      .map((course) => {
        const hours = hoursForCourse(course.id);
        return { courseId: course.id, name: course.name, hours, percent: Math.max(5, Math.round((hours / maxCourseHours) * 100)) };
      })
      .sort((a, b) => b.hours - a.hours)
  };
}

function confirmRemove(label, onConfirm) {
  if (Platform.OS === "web") {
    onConfirm();
    return;
  }
  Alert.alert("Conferma eliminazione", `Vuoi eliminare questo ${label}?`, [
    { text: "Annulla", style: "cancel" },
    { text: "Elimina", style: "destructive", onPress: onConfirm }
  ]);
}

function addDays(isoDate, amount) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

function startOfWeek(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function formatDate(isoDate) {
  if (!isoDate) return "-";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function weekday(isoDate) {
  return ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][new Date(`${isoDate}T12:00:00`).getDay()];
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function toNumber(value) {
  const parsed = Number(String(value || "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

const courseFields = [
  { key: "name", label: "Nome corso", required: true },
  { key: "teacher", label: "Docente" },
  { key: "semester", label: "Semestre o periodo" },
  { key: "credits", label: "CFU", numeric: true },
  { key: "status", label: "Stato", options: courseStates.filter((item) => item !== "Tutti") },
  { key: "targetGrade", label: "Voto desiderato", numeric: true },
  { key: "actualGrade", label: "Voto ottenuto", numeric: true },
  { key: "materials", label: "Materiali o riferimenti", multiline: true },
  { key: "notes", label: "Note", multiline: true }
];

const examFields = [
  { key: "title", label: "Titolo", required: true },
  { key: "courseId", label: "Corso associato", type: "course" },
  { key: "date", label: "Data", placeholder: "YYYY-MM-DD", required: true },
  { key: "type", label: "Tipologia", options: ["Esame", "Appello", "Consegna", "Scadenza"] },
  { key: "priority", label: "Priorità", options: ["Alta", "Media", "Bassa"] },
  { key: "status", label: "Stato", options: ["Futuro", "Programmato", "Completato", "Annullato"] },
  { key: "result", label: "Voto o risultato" },
  { key: "notes", label: "Note", multiline: true }
];

const sessionFields = [
  { key: "title", label: "Titolo", required: true },
  { key: "courseId", label: "Corso associato", type: "course" },
  { key: "examId", label: "Esame associato", type: "exam" },
  { key: "date", label: "Giorno", placeholder: "YYYY-MM-DD", required: true },
  { key: "kind", label: "Tipo attività", options: ["Studio", "Ripasso", "Esercitazione", "Progetto", "Presentazione", "Lettura"] },
  { key: "plannedHours", label: "Ore previste", numeric: true },
  { key: "actualHours", label: "Ore svolte", numeric: true },
  { key: "completed", label: "Completata", type: "boolean" },
  { key: "notes", label: "Note", multiline: true }
];

const goalFields = [
  { key: "title", label: "Titolo", required: true },
  { key: "description", label: "Descrizione", multiline: true },
  { key: "courseId", label: "Corso associato", type: "course" },
  { key: "period", label: "Data o periodo" },
  { key: "priority", label: "Priorità", options: ["Alta", "Media", "Bassa"] },
  { key: "estimatedHours", label: "Tempo stimato", numeric: true },
  { key: "actualHours", label: "Tempo impiegato", numeric: true },
  { key: "completed", label: "Completato", type: "boolean" },
  { key: "notes", label: "Note", multiline: true }
];


const styles = StyleSheet.create({
  // --- Struttura Principale & Layout ---
  safe: {
    flex: 1,
    backgroundColor: "#FDFBF7", // Sfondo caldo avorio (riduce l'affaticamento visivo)
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 15,
    backgroundColor: "#F9F5EB", // Crema leggermente più scuro per separare l'header
    borderBottomWidth: 1,
    borderBottomColor: "#EAE3D2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C2A29", // Marrone scurissimo/antracite per un contrasto morbido
  },
  headerBadge: {
    backgroundColor: "#E28743", // Arancione tenue / Terra cotta professionale
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  headerBadgeSmall: {
    color: "#FDFBF7",
    fontSize: 10,
    opacity: 0.9,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- Navigazione Tab Superiore ---
  tabs: {
    backgroundColor: "#F9F5EB",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE3D2",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#EEE6D3",
  },
  tabButtonActive: {
    backgroundColor: "#EEB76B", // Giallo miele caldo e saturo
  },
  tabText: {
    color: "#605C58",
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#2C2A29",
    fontWeight: "700",
  },

  // --- Elementi Comuni e Intestazioni Schermate ---
  screenTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C2A29",
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: "#4A4643",
    lineHeight: 20,
    marginBottom: 12,
  },

  // --- Dashboard Griglia Metriche ---
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metric: {
    backgroundColor: "#FFFDF9",
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE3D2",
    shadowColor: "#2C2A29", // Ombra leggera per dare profondità professionale
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E28743", // Arancione corporate
  },
  metricLabel: {
    fontSize: 12,
    color: "#7C7570",
    marginTop: 4,
    fontWeight: "500",
  },

  // --- Card, Pannelli e Righe ---
  panel: {
    backgroundColor: "#FFFDF9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  panelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2A29",
  },
  linkText: {
    color: "#E28743",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFDF9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2A29",
    marginBottom: 4,
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECE1",
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2A29",
  },
  rowMeta: {
    fontSize: 12,
    color: "#7C7570",
    marginTop: 2,
  },
  detailLine: {
    fontSize: 14,
    color: "#4A4643",
    marginBottom: 6,
  },

  // --- Input, Form e Ricerca ---
  input: {
    backgroundColor: "#FFFDF9",
    color: "#2C2A29",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#D2C9B1",
    marginBottom: 14,
  },
  textarea: {
    height: 80,
    textAlignVertical: "top",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2A29",
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 12,
  },

  // --- Pulsanti (Bottoni) ---
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  actionsCentered: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: "#E28743", // Arancione tenue di impatto
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#EEE6D3", // Grigio/Beige caldo neutro
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#4A4643",
    fontWeight: "600",
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: "#FADBD8", // Rosso pastello morbido per non urlare
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#C0392B",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#EAE3D2",
    opacity: 0.6,
  },
  iconButton: {
    backgroundColor: "#EEE6D3",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    color: "#2C2A29",
    fontSize: 20,
    fontWeight: "bold",
  },

  // --- Badge di Stato e Priorità ---
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
  },
  statusBadge: {
    backgroundColor: "#EAE3D2",
    color: "#4A4643",
  },
  highBadge: {
    backgroundColor: "#F5C6AA", // Arancione più intenso (Alta priorità)
    color: "#7E3D11",
  },
  mediumBadge: {
    backgroundColor: "#F7E6C4", // Giallo tenue (Media priorità)
    color: "#7D5A13",
  },
  lowBadge: {
    backgroundColor: "#D5F5E3", // Verde menta rilassante
    color: "#1E8449",
  },

  // --- Grafici e Progress Bar ---
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  chartLabel: {
    width: "35%",
    fontSize: 13,
    color: "#4A4643",
  },
  chartTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#F4ECE1",
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  chartFill: {
    height: "100%",
    backgroundColor: "#EEB76B", // Riempimento a barre color miele
    borderRadius: 4,
  },
  chartValue: {
    width: "12%",
    fontSize: 13,
    fontWeight: "600",
    color: "#2C2A29",
    textAlign: "right",
  },
  progressBlock: {
    marginTop: 10,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F4ECE1",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E28743", // Barre di progresso arancioni
    borderRadius: 3,
  },

  // --- Segmented Control ---
  segmented: {
    paddingVertical: 4,
    marginBottom: 14,
    gap: 6,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#EAE3D2",
    minWidth: 70,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#E28743",
    borderColor: "#E28743",
  },
  segmentText: {
    color: "#7C7570",
    fontSize: 12,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },

  // --- Planner Settimanale & Calendario ---
  weekBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F5EB",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2A29",
  },
  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#F9F5EB",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  dayColumn: {
    alignItems: "center",
    width: "13.5%",
  },
  dayLabel: {
    fontSize: 11,
    color: "#7C7570",
    fontWeight: "600",
  },
  dayDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2A29",
    marginVertical: 4,
  },
  miniSession: {
    backgroundColor: "#FFFDF9",
    borderRadius: 6,
    padding: 4,
    width: "100%",
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#EAE3D2",
    borderLeftWidth: 3,
    borderLeftColor: "#EEB76B",
  },
  miniSessionDone: {
    opacity: 0.5,
    backgroundColor: "#F4ECE1",
    borderLeftColor: "#7C7570",
  },
  miniSessionText: {
    fontSize: 8,
    color: "#2C2A29",
    fontWeight: "500",
  },
  miniSessionMeta: {
    fontSize: 7,
    color: "#7C7570",
  },

  // --- Pomodoro Screen ---
  timerPanel: {
    backgroundColor: "#F9F5EB",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  timerMode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E28743",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#2C2A29",
    fontVariant: ["tabular-nums"],
    marginVertical: 10,
  },

  // --- Modali e Fogli di Dettaglio ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(44, 42, 41, 0.4)", // Sfondo oscurato caldo e morbido
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFDF9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "#EAE3D2",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C2A29",
    marginBottom: 6,
  },
});