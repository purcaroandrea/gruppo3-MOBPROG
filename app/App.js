import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
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

// 1. RINOMINATA DA "App" A "MainApp"
function MainApp() {
  // 👉 INSERIMENTO DELL'HOOK COME PRIMA RIGA
  const { styles, themeColors } = useStyles();
  const [data, setData] = useState(seedData);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const tabs = ["Dashboard", "Corsi", "Esami", "Planner", "Obiettivi", "Pomodoro"];

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

    // 🔥 Abbiamo rimosso la validazione e il calcolo forzato su startTime ed endTime
    // In questo modo le ore manuali che inserisci non verranno più sovrascritte!

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

      // 1) Rimuovi l'elemento principale
      updated[collection] = updated[collection].filter((e) => e.id !== id);

      // 2) Eliminazione a cascata ottimizzata e pulita
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
      plannedHours: "90", // 🔥 Registra 90 minuti
      kind: "Ripasso",
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
    addSuggestedSession,
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 1. HEADER */}
<View style={styles.header}>
  {/* Pulsante Dashboard (home) a sinistra */}
  <Pressable
    style={[
      styles.headerIconButton,
      activeTab === "Dashboard" && styles.headerIconButtonActive,
    ]}
    onPress={() => setActiveTab("Dashboard")}
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

  {/* Titolo centrale (puoi cambiarlo a piacere) */}
  {/* <Text style={styles.title}>Study Planner</Text> */}
  <Image
  source={require("../assets/images/logo-mobile.png")}
  style={{ height: 60, width: 60 }}
  resizeMode="contain"
/>

  {/* Pulsante Pomodoro a destra */}
  <Pressable
    style={[
      styles.headerIconButton,
      activeTab === "Pomodoro" && styles.headerIconButtonActive,
    ]}
    onPress={() => setActiveTab("Pomodoro")}
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
      Pomodoro
    </Text>
  </Pressable>
</View>


      {/* 3. CONTENUTO DELLE SCHERMATE */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "Dashboard" && <Dashboard {...screenProps} />}
        {activeTab === "Corsi" && <CoursesScreen {...screenProps} />}
        {activeTab === "Esami" && <ExamsScreen {...screenProps} />}
        {activeTab === "Planner" && <PlannerScreen {...screenProps} />}
        {activeTab === "Obiettivi" && <GoalsScreen {...screenProps} />}
        {activeTab === "Pomodoro" && <PomodoroScreen {...screenProps} />}
      </ScrollView>
      {/* 3. NAVIGAZIONE IN BASSO */}
<View style={styles.bottomNav}>
  <Pressable
    style={[
      styles.bottomNavItem,
      activeTab === "Corsi" && styles.bottomNavItemActive,
    ]}
    onPress={() => setActiveTab("Corsi")}
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
    onPress={() => setActiveTab("Esami")}
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
    onPress={() => setActiveTab("Planner")}
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
    onPress={() => setActiveTab("Obiettivi")}
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

// 2. NUOVA FUNZIONE PRINCIPALE CHE AVVOLGE TUTTO NEL TEMA
export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}