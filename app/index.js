import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useStyles } from "../hooks/useStyles";
import { ThemeProvider } from "../src/contexts/themeContext";
import { emptySession } from "../src/data/emptyTemplates";
import { seedData } from "../src/data/seedData";
import { createHelpers } from "../src/helpers/createHelpers";
import { isValidDateStrict } from "../src/helpers/date";

import SettingsModal from "../src/components/settings-modal";
import CoursesScreen from "../src/screens/courses-screen";
import Dashboard from "../src/screens/dashboard";
import ExamsScreen from "../src/screens/exams-screen";
import GoalsScreen from "../src/screens/goals-screen";
import PlannerScreen from "../src/screens/planner-screen";
import PomodoroScreen from "../src/screens/pomodoro-screen";

const defaultSettings = {
  pomodoroStudyTime: "25",
  pomodoroBreakTime: "5",
  hapticsEnabled: true,
};

const TABS_ORDER = ["Dashboard", "Corsi", "Esami", "Planner", "Obiettivi", "Pomodoro"];

function MainApp() {
  const { styles, themeColors } = useStyles();
  const [data, setData] = useState(seedData);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const settings = data.settings || defaultSettings;

  // Timer Pomodoro
  const STUDY_DURATION = (parseInt(settings.pomodoroStudyTime, 10) || 25) * 60;
  const BREAK_DURATION = (parseInt(settings.pomodoroBreakTime, 10) || 5) * 60;

  const [pomodoroMode, setPomodoroMode] = useState("Studio");
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(STUDY_DURATION);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [prefilledSession, setPrefilledSession] = useState(null);

  const scrollViewRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const goToTab = useCallback((tabName) => {
    setActiveTab(tabName);
    const index = TABS_ORDER.indexOf(tabName);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * screenWidth, animated: false });
    }
  }, [screenWidth]);

  const helpers = useMemo(() => createHelpers(data), [data]);

  const upsert = useCallback((collection, item) => {
    // Validazione data 
    if (item.date && !isValidDateStrict(item.date)) {
      alert("La data inserita non è valida.");
      return;
    }
    if (item.endDate && !isValidDateStrict(item.endDate)) {
      alert("La data di fine inserita non è valida.");
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
  }, []);

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
        // Se l'esame eliminato era il voto finale del corso, resetta voto e stato del corso
        const deletedExam = current.exams.find((e) => e.id === id);
        if (deletedExam?.isGradeForCourse && deletedExam?.courseId) {
          updated.courses = updated.courses.map((c) =>
            c.id === deletedExam.courseId
              ? { ...c, actualGrade: "", status: "Completato" }
              : c
          );
        }
        updated.sessions = updated.sessions.filter((s) => s.examId !== id);
        updated.goals = updated.goals.filter((g) => g.examId !== id);
      }

      return updated;
    });
  };

  const addSuggestedSession = (exam) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    
    setPrefilledSession({
      ...emptySession,
      title: `Ripasso per ${exam.title}`,
      courseId: exam.courseId,
      examId: exam.id,
      priority: exam.priority || "Media",
      date: tomorrowStr,
      endDate: tomorrowStr,
      plannedHours: "90", 
      kind: "Ripasso",
    });
    
    goToTab("Planner");
  };

  const updateSetting = (key, value) => {
    setData((current) => ({
      ...current,
      settings: {
        ...(current.settings || defaultSettings),
        [key]: value,
      },
    }));
  };

  const resetAllData = () => {
    const freshData = {
      ...seedData,
      settings: defaultSettings,
    };
    setData(freshData);
    AsyncStorage.setItem("study-planner-v1", JSON.stringify(freshData)).catch((error) => {
      console.error("Errore durante il reset dei dati:", error);
    });
  };

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

  // Aggiorna il timer se cambiano i settaggi e il timer è fermo
  useEffect(() => {
    if (!pomodoroRunning) {
      setPomodoroSecondsLeft(pomodoroMode === "Studio" ? STUDY_DURATION : BREAK_DURATION);
    }
  }, [STUDY_DURATION, BREAK_DURATION, pomodoroMode, pomodoroRunning]);

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
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

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

  // Salva il tempo impostato in automatico sull'attività selezionata e sugli obiettivi collegati
  useEffect(() => {
    if (completedPomodoros > 0 && selectedSessionId) {
      const session = data?.sessions?.find((s) => s.id === selectedSessionId);

      if (session) {
        const currentActual = parseInt(session.actualHours || "0", 10);
        const pomodoroMins = parseInt(settings.pomodoroStudyTime, 10) || 25;
        const newActual = currentActual + pomodoroMins;
        upsert("sessions", { ...session, actualHours: String(newActual) });

        // Aggiorna anche l'obiettivo collegato direttamente all'attività
        if (session.goalId) {
          const linkedGoal = data?.goals?.find(
            (g) => g.id === session.goalId && !g.completed
          );
          if (linkedGoal) {
            const goalActual = parseInt(linkedGoal.actualHours || "0", 10);
            upsert("goals", { ...linkedGoal, actualHours: String(goalActual + pomodoroMins) });
          }
        }
      }
    }
  }, [completedPomodoros, selectedSessionId, data?.sessions, data?.goals, settings.pomodoroStudyTime, upsert]);

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

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        goToTab("Dashboard");
      }, 150);
    }
  }, [loaded, goToTab]);

  const screenProps = {
    data,
    helpers,
    upsert,
    remove,
    setActiveTab: goToTab,
    selectedCourseId,
    setSelectedCourseId,
    addSuggestedSession,
    prefilledSession,
    setPrefilledSession,
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

  const isLargeScreen = screenWidth > 768;

  return (
    <SafeAreaView style={styles.safe}>

<View style={[styles.header, { paddingHorizontal: isLargeScreen ? 20 : 10 }]}>
  {/* Sinistra: Logo + Nome App e Data */}
  <View style={{ flexDirection: "row", alignItems: "center", gap: isLargeScreen ? 10 : 6, flex: 1, marginRight: 8, minWidth: 0 }}>
    <Image
      source={require("../assets/images/logo-mobile.png")}
      style={{ height: isLargeScreen ? 50 : 38, width: isLargeScreen ? 50 : 38 }}
      resizeMode="contain"
    />
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text
        numberOfLines={1}
        style={{ fontSize: isLargeScreen ? 18 : 13, fontWeight: "800", color: themeColors.textTitle }}
      >
        Study Planner & Exam Tracker
      </Text>
      <Text style={{ fontSize: isLargeScreen ? 12 : 9, color: themeColors.textMuted, textTransform: "lowercase" }}>
        {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
      </Text>
    </View>
  </View>

  {/* Destra: Il bottone Impostazioni */}
  <View style={{ flexDirection: "row", gap: 6, alignItems: "center", flexShrink: 0 }}>
    {/* Impostazioni */}
    <Pressable
      style={[
        isLargeScreen ? styles.headerIconButton : styles.iconButton,
        settingsVisible && styles.headerIconButtonActive,
      ]}
      onPress={() => setSettingsVisible(true)}
    >
      <MaterialIcons
        name="settings"
        size={isLargeScreen ? 22 : 20}
        color={
          settingsVisible
            ? themeColors.textOnPrimary
            : themeColors.textTitle
        }
      />
      {isLargeScreen && (
        <Text
          style={[
            styles.headerIconLabel,
            settingsVisible && styles.headerIconLabelActive,
          ]}
        >
          Impostazioni
        </Text>
      )}
    </Pressable>
  </View>
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
      activeTab === "Dashboard" && styles.bottomNavItemActive,
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
        styles.bottomNavLabel,
        activeTab === "Dashboard" && styles.bottomNavLabelActive,
      ]}
    >
      Dashboard
    </Text>
  </Pressable>

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

      {/* Pomodoro Timer FAB */}
      <Pressable
        style={[
          styles.fab,
          activeTab === "Pomodoro" && styles.fabActive,
        ]}
        onPress={() => goToTab("Pomodoro")}
      >
        <MaterialIcons
          name="timer"
          size={24}
          color={themeColors.textOnPrimary}
        />
        <Text style={styles.fabText}>Pomodoro</Text>
      </Pressable>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        settings={settings}
        updateSetting={updateSetting}
        resetAllData={resetAllData}
      />
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