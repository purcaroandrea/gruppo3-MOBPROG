import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable } from "react-native"; // Aggiunto Pressable

import styles from "../src/styles/styles";
import { seedData } from "../src/data/seedData";
import { emptyCourse, emptyExam, emptySession, emptyGoal } from "../src/data/emptyTemplates";
import { createHelpers } from "../src/helpers/createHelpers";
import { isValidDateStrict, isValidTime } from "../src/helpers/date";

import Dashboard from "../src/screens/Dashboard";
import CoursesScreen from "../src/screens/CoursesScreen";
import ExamsScreen from "../src/screens/ExamsScreen";
import PlannerScreen from "../src/screens/PlannerScreen";
import GoalsScreen from "../src/screens/GoalsScreen";
import PomodoroScreen from "../src/screens/PomodoroScreen";

export default function App() {
  const [data, setData] = useState(seedData);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const tabs = ["Dashboard", "Corsi", "Esami", "Planner", "Obiettivi", "Pomodoro"];

  useEffect(() => {
    async function load() {
      const saved = await AsyncStorage.getItem("study-planner-v1");
      if (saved) setData(JSON.parse(saved));
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem("study-planner-v1", JSON.stringify(data));
  }, [data, loaded]);

  const helpers = useMemo(() => createHelpers(data), [data]);
  
  const upsert = (collection, item) => {
  // Validazione data 
  if (item.date && !isValidDateStrict(item.date)) {
    alert("La data inserita non è valida.");
    return;
  }

  // Validazione orari
  if (collection === "sessions") {
  if (item.startTime && !isValidTime(item.startTime)) {
    alert("L'ora di inizio non è valida.");
    return;
  }
  if (item.endTime && !isValidTime(item.endTime)) {
    alert("L'ora di fine non è valida.");
    return;
  }

  // Impedisce durata zero
  if (item.startTime === item.endTime) {
    alert("L'ora di fine non può essere uguale all'ora di inizio.");
    return;
  }
}



  setData((current) => {
    const exists = current[collection].some((e) => e.id === item.id);

    // Normalizzazione ID
    let newItem = exists
      ? item
      : { ...item, id: `${collection}-${Date.now()}` };

    // 🔥 Calcolo automatico durata sessione 
    if (collection === "sessions" && newItem.startTime && newItem.endTime) {
      const [sh, sm] = newItem.startTime.split(":").map(Number);
      const [eh, em] = newItem.endTime.split(":").map(Number);

      let start = sh * 60 + sm;
      let end = eh * 60 + em;

      // Caso overnight (es. 23:00 → 01:00)
      if (end < start) {
        end += 24 * 60;
      }

      const diffHours = (end - start) / 60;
      newItem.plannedHours = diffHours.toFixed(1);
    }

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

    // 2) Eliminazione a cascata
    if (collection === "courses") {
      // elimina esami del corso
      const examIds = updated.exams
        .filter((ex) => ex.courseId === id)
        .map((ex) => ex.id);

      updated.exams = updated.exams.filter((ex) => ex.courseId !== id);

      // elimina sessioni legate al corso
      updated.sessions = updated.sessions.filter(
        (s) => s.courseId !== id
      );

      // elimina obiettivi legati al corso
      updated.goals = updated.goals.filter((g) => g.courseId !== id);

      // elimina sessioni legate agli esami eliminati
      updated.sessions = updated.sessions.filter(
        (s) => !examIds.includes(s.examId)
      );
    }

    if (collection === "exams") {
      // elimina sessioni legate all'esame
      updated.sessions = updated.sessions.filter(
        (s) => s.examId !== id
      );

      // elimina obiettivi legati all'esame
      updated.goals = updated.goals.filter((g) => g.examId !== id);
    }

    if (collection === "sessions") {
      // nessuna cascata aggiuntiva
    }

    if (collection === "goals") {
      // nessuna cascata aggiuntiva
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
      plannedHours: "1.5",
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
        <View>
          <Text style={styles.title}>Study Planner & Exam Tracker</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{helpers.weekHours?.planned || 0}h</Text>
          <Text style={styles.headerBadgeSmall}>Questa settimana!</Text>
        </View>
      </View>

      {/* 2. BARRA DELLE TAB RIPRISTINATA (SOPRA E IN ORIZZONTALE) */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 3. CONTENUTO DELLE SCHERMATE */}
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
