import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState, useRef } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useStyles } from "../hooks/useStyles";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import { emptySession } from "../src/data/emptyTemplates";
import { seedData } from "../src/data/seedData";
import { createHelpers } from "../src/helpers/createHelpers";
import { isValidDateStrict } from "../src/helpers/date";
import CoursesScreen from "../src/screens/CoursesScreen";
import Dashboard from "../src/screens/Dashboard";
import ExamsScreen from "../src/screens/ExamsScreen";
import GoalsScreen from "../src/screens/GoalsScreen";
import PlannerScreen from "../src/screens/PlannerScreen";
import PomodoroScreen from "../src/screens/PomodoroScreen";

function MainApp() {
  const { styles, themeColors } = useStyles();
  const [data, setData] = useState(seedData);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // --- Pomodoro Timer Globale ---
  const STUDY_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  const [pomodoroMode, setPomodoroMode] = useState("Studio");
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(STUDY_DURATION);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const pomodoroSoundRef = useRef(null);
  const targetEndTimeRef = useRef(null);

  // Riproduce il suono quando il timer arriva a zero
  async function playPomodoroSound() {
    try {
      if (!pomodoroSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/images/pomodoro-end.mp3")
        );
        pomodoroSoundRef.current = sound;
      }
      await pomodoroSoundRef.current.replayAsync();
    } catch (e) {
      console.warn("Errore riproduzione audio Pomodoro:", e);
    }
  }

  // Sincronizza il tempo di fine target quando si avvia/ferma il timer
  useEffect(() => {
    if (pomodoroRunning) {
      targetEndTimeRef.current = Date.now() + pomodoroSecondsLeft * 1000;
    } else {
      targetEndTimeRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoroRunning]);

  // Sincronizza il tempo di fine target se cambia la modalità mentre è in esecuzione
  useEffect(() => {
    if (pomodoroRunning) {
      targetEndTimeRef.current = Date.now() + pomodoroSecondsLeft * 1000;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoroMode]);

  // Gestione principale del conto alla rovescia globale (timestamp-based)
  useEffect(() => {
    if (!pomodoroRunning) return;

    const timer = setInterval(() => {
      if (!targetEndTimeRef.current) return;

      const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));

      if (remaining > 0) {
        setPomodoroSecondsLeft(remaining);
      } else {
        // Timer scaduto
        playPomodoroSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const nextMode = pomodoroMode === "Studio" ? "Pausa" : "Studio";
        const nextDuration = nextMode === "Studio" ? STUDY_DURATION : BREAK_DURATION;

        if (pomodoroMode === "Studio") {
          setCompletedPomodoros((count) => count + 1);
        }

        setPomodoroMode(nextMode);
        setPomodoroSecondsLeft(nextDuration);
        targetEndTimeRef.current = Date.now() + nextDuration * 1000;
      }
    }, 500);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoroRunning, pomodoroMode]);

  // Salva 25 minuti in automatico sull'attività selezionata
  useEffect(() => {
    if (completedPomodoros > 0 && selectedSessionId) {
      const session = data?.sessions?.find((s) => s.id === selectedSessionId);

      if (session) {
        const currentActual = parseInt(session.actualHours || "0", 10);
        const newActual = currentActual + 25;
        upsert("sessions", { ...session, actualHours: String(newActual) });
      }
    }
  }, [completedPomodoros, selectedSessionId, data?.sessions]);

  const TABS_ORDER = ["Dashboard", "Corsi", "Esami", "Planner", "Obiettivi", "Pomodoro"];
  const scrollViewRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const goToTab = (tabName) => {
    setActiveTab(tabName);
    const index = TABS_ORDER.indexOf(tabName);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * screenWidth, animated: true });
    }
  };

  // Caricamento dei dati con gestione degli errori ottimizzata
  useEffect(() => {
    async function load() {
      try {
        const saved = await AsyncStorage.getItem("study-planner-v1");
        if (saved) setData(JSON.parse(saved));
      } catch (error) {
        console.error("Errore nel caricamento del database locale:", error);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  // Salvataggio dei dati ogni volta che lo stato 'data' cambia
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("study-planner-v1", JSON.stringify(data)).catch((error) => {
        console.error("Errore durante il salvataggio dei dati:", error);
      });
    }
  }, [data, loaded]);

  const helpers = useMemo(() => createHelpers(data), [data]);
  
  const upsert = (collection, item) => {
    // Validazione data 
    if (item.date && !isValidDateStrict(item.date)) {
      alert("La data inserita non è valida.");
      return;
    }


    setData((current) => {
      const exists = current[collection].some((e) => e.id === item.id);

      // Normalizzazione ID
      let newItem = exists
        ? item
        : { ...item, id: `${collection}-${Date.now()}` };

      return {
        ...current,
        [collection]: exists
          ? current[collection].map((e) => (e.id === item.id ? newItem : e))
          : [newItem, ...current[collection]],
      };
    });
  };

  const remove = (collection, id) => {
    setData((current) => {
      let updated = { ...current };

      updated[collection] = updated[collection].filter((e) => e.id !== id);

      if (collection === "courses") {
        const examIds = updated.exams
          .filter((ex) => ex.courseId === id)
          .map((ex) => ex.id);

        updated.exams = updated.exams.filter((ex) => ex.courseId !== id);
        updated.goals = updated.goals.filter((g) => g.courseId !== id);

        // Rimuove le sessioni associate sia al corso che agli esami eliminati
        updated.sessions = updated.sessions.filter(
          (s) => s.courseId !== id && !examIds.includes(s.examId)
        );
      }

      if (collection === "exams") {
        updated.sessions = updated.sessions.filter((s) => s.examId !== id);
        updated.goals = updated.goals.filter((g) => g.examId !== id);
      }

      return updated;
    });
  };

  const addSuggestedSession = (exam) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    upsert("sessions", {
      ...emptySession,
      title: `Ripasso per ${exam.title}`,
      courseId: exam.courseId,
      examId: exam.id,
      date: tomorrow.toISOString().slice(0, 10),
      plannedHours: "90", 
      kind: "Ripasso",
    });
    
    goToTab("Planner");
  };

  const screenProps = {
    data,
    helpers,
    upsert,
    remove,
    setActiveTab: goToTab,
    selectedCourseId,
    setSelectedCourseId,
    addSuggestedSession,
    pomodoroProps: {
      mode: pomodoroMode,
      setMode: setPomodoroMode,
      secondsLeft: pomodoroSecondsLeft,
      setSecondsLeft: setPomodoroSecondsLeft,
      running: pomodoroRunning,
      setRunning: setPomodoroRunning,
      completedPomodoros,
      setCompletedPomodoros,
      selectedSessionId,
      setSelectedSessionId,
    },
  };

  return (
    <SafeAreaView style={styles.safe}>

<View style={styles.header}>

  <Pressable
    style={[
      styles.headerIconButton,
      activeTab === "Dashboard" && styles.headerIconButtonActive,
    ]}
    onPress={() => goToTab("Dashboard")}
  >
    <MaterialIcons
      name="home"
      size={22}
      color={
        activeTab === "Dashboard"
          ? themeColors.textOnPrimary
          : themeColors.textTitle
      }
    />
    <Text
      style={[
        styles.headerIconLabel,
        activeTab === "Dashboard" && styles.headerIconLabelActive,
      ]}
    >
      Dashboard
    </Text>
  </Pressable>


  <Image
  source={require("../assets/images/logo-mobile.png")}
  style={{ height: 60, width: 60 }}
  resizeMode="contain"
/>

  <Pressable
    style={[
      styles.headerIconButton,
      activeTab === "Pomodoro" && styles.headerIconButtonActive,
    ]}
    onPress={() => goToTab("Pomodoro")}
  >
    <MaterialIcons
      name="timer"
      size={22}
      color={
        activeTab === "Pomodoro"
          ? themeColors.textOnPrimary
          : themeColors.textTitle
      }
    />
    <Text
      style={[
        styles.headerIconLabel,
        activeTab === "Pomodoro" && styles.headerIconLabelActive,
      ]}
    >
      {pomodoroRunning
        ? `Pomodoro (${Math.floor(pomodoroSecondsLeft / 60)}:${(pomodoroSecondsLeft % 60).toString().padStart(2, "0")})`
        : "Pomodoro"}
    </Text>
  </Pressable>
</View>


      {/* 3. CONTENUTO DELLE SCHERMATE (CAROSELLO) */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          if (TABS_ORDER[index] && TABS_ORDER[index] !== activeTab) {
            setActiveTab(TABS_ORDER[index]);
          }
        }}
        scrollEventThrottle={16}
      >
        {TABS_ORDER.map((tab) => (
          <ScrollView
            key={tab}
            style={{ width: screenWidth }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {tab === "Dashboard" && <Dashboard {...screenProps} />}
            {tab === "Corsi" && <CoursesScreen {...screenProps} />}
            {tab === "Esami" && <ExamsScreen {...screenProps} />}
            {tab === "Planner" && <PlannerScreen {...screenProps} />}
            {tab === "Obiettivi" && <GoalsScreen {...screenProps} />}
            {tab === "Pomodoro" && <PomodoroScreen {...screenProps} />}
          </ScrollView>
        ))}
      </ScrollView>

<View style={styles.bottomNav}>
  <Pressable
    style={[
      styles.bottomNavItem,
      activeTab === "Corsi" && styles.bottomNavItemActive,
    ]}
    onPress={() => goToTab("Corsi")}
  >
    <MaterialIcons
      name="menu-book"
      size={22}
      color={
        activeTab === "Corsi"
          ? themeColors.textOnPrimary
          : themeColors.textTitle
      }
    />
    <Text
      style={[
        styles.bottomNavLabel,
        activeTab === "Corsi" && styles.bottomNavLabelActive,
      ]}
    >
      Corsi
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.bottomNavItem,
      activeTab === "Esami" && styles.bottomNavItemActive,
    ]}
    onPress={() => goToTab("Esami")}
  >
    <MaterialIcons
      name="assignment"
      size={22}
      color={
        activeTab === "Esami"
          ? themeColors.textOnPrimary
          : themeColors.textTitle
      }
    />
    <Text
      style={[
        styles.bottomNavLabel,
        activeTab === "Esami" && styles.bottomNavLabelActive,
      ]}
    >
      Esami
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.bottomNavItem,
      activeTab === "Planner" && styles.bottomNavItemActive,
    ]}
    onPress={() => goToTab("Planner")}
  >
    <MaterialIcons
      name="event-note"
      size={22}
      color={
        activeTab === "Planner"
          ? themeColors.textOnPrimary
          : themeColors.textTitle
      }
    />
    <Text
      style={[
        styles.bottomNavLabel,
        activeTab === "Planner" && styles.bottomNavLabelActive,
      ]}
    >
      Planner
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.bottomNavItem,
      activeTab === "Obiettivi" && styles.bottomNavItemActive,
    ]}
    onPress={() => goToTab("Obiettivi")}
  >
    <MaterialIcons
      name="flag"
      size={22}
      color={
        activeTab === "Obiettivi"
          ? themeColors.textOnPrimary
          : themeColors.textTitle
      }
    />
    <Text
      style={[
        styles.bottomNavLabel,
        activeTab === "Obiettivi" && styles.bottomNavLabelActive,
      ]}
    >
      Obiettivi
    </Text>
  </Pressable>
</View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}