import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Segmented from "../components/Segmented";
import Svg, { Circle } from "react-native-svg";

const STUDY_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function PomodoroScreen({ data, upsert }) {
  const { styles } = useStyles();
  const [mode, setMode] = useState("Studio");
  const [secondsLeft, setSecondsLeft] = useState(STUDY_DURATION);
  const [running, setRunning] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [minutesStudied, setMinutesStudied] = useState(0);
  const [nextModeToSet, setNextModeToSet] = useState("");

  // Contatore per tenere traccia delle sessioni finite oggi
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Salva l'id dell'attività a cui aggiungere le ore studiate
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const soundRef = useRef(null);
  const studyStartTimeRef = useRef(null);

  // Filtra le attività di oggi che non sono ancora state completate
  const today = new Date().toISOString().slice(0, 10);
  const availableSessions =
    data?.sessions.filter((s) => s.date === today && !s.completed) || [];

  // Prepara le etichette per il selettore
  const sessionOptions = ["", ...availableSessions.map((s) => s.id)];
  const sessionLabels = { "": "Nessuna attività" };
  availableSessions.forEach((s) => {
    sessionLabels[s.id] = s.title;
  });

  // Riproduce il suono quando il timer arriva a zero
  async function playSound() {
    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/images/pomodoro-end.mp3")
      );
      soundRef.current = sound;
    }
    await soundRef.current.replayAsync();
  }

  // Traccia quando inizia lo studio
  useEffect(() => {
    if (running && mode === "Studio" && !studyStartTimeRef.current) {
      studyStartTimeRef.current = Date.now();
    }
    if (!running) {
      studyStartTimeRef.current = null;
    }
  }, [running, mode]);

  // Gestione principale del conto alla rovescia
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value > 1) return value - 1;

        // Il timer è scaduto: avvia suono e vibrazione
        playSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const nextMode = mode === "Studio" ? "Pausa" : "Studio";

        // Se si stava studiando, incrementa il contatore dei pomodori fatti
        if (mode === "Studio") {
          setCompletedPomodoros((count) => count + 1);
        }

        setMode(nextMode);

        // Ritorna i secondi giusti in base a cosa si deve fare dopo
        return nextMode === "Studio" ? STUDY_DURATION : BREAK_DURATION;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, mode]);

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
  }, [completedPomodoros, data?.sessions, selectedSessionId, upsert]);

  const handleConfirmReset = (save) => {
    if (save && selectedSessionId) {
      const session = data?.sessions?.find((s) => s.id === selectedSessionId);
      if (session) {
        const currentActual = parseInt(session.actualHours || "0", 10);
        const newActual = currentActual + minutesStudied;
        upsert("sessions", { ...session, actualHours: String(newActual) });
      }
    }
    studyStartTimeRef.current = null;
    setRunning(false);
    setMode(nextModeToSet);
    setSecondsLeft(
      nextModeToSet === "Studio" ? STUDY_DURATION : BREAK_DURATION
    );
    setIsResetModalVisible(false);
  };

  // Resetta il timer con eventuale alert se c'è tempo trascorso in Studio
  const reset = (nextMode = mode) => {
    // Se in modalità Studio e c'è tempo trascorso, mostra alert
    if (mode === "Studio" && (STUDY_DURATION - secondsLeft) > 0) {
      const mins = Math.round((STUDY_DURATION - secondsLeft) / 60);
      setMinutesStudied(mins);
      setNextModeToSet(nextMode);
      setIsResetModalVisible(true);
    } else {
      // Resetta normalmente se non c'è tempo trascorso o non siamo in Studio
      studyStartTimeRef.current = null;
      setRunning(false);
      setMode(nextMode);
      setSecondsLeft(
        nextMode === "Studio" ? STUDY_DURATION : BREAK_DURATION
      );
    }
  };

  // Formatta i secondi residui in formato minuti:secondi
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // -------- Cerchio tipo miccia (SVG) --------
  const totalSeconds = mode === "Studio" ? STUDY_DURATION : BREAK_DURATION;
  const fractionElapsed = (totalSeconds - secondsLeft) / totalSeconds; // da 0 a 1
  const strokeWidth = 6;

  // Raggio più grande per i 25 min, leggermente più grande anche per i 5 min
  const radius = mode === "Studio" ? 110 : 90;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference * fractionElapsed;

  // Studio (25 min) -> arancione, Pausa (5 min) -> verde
  const circleColor = mode === "Studio" ? "#FF9800" : "#4CAF50";
  const backgroundColor = mode === "Studio" ? "#FFE0B2" : "#C8E6C9";

  return (
    <View>
      <Text style={styles.sectionTitle}>Pomodoro Timer</Text>

      {/* Selezione dell'attività in corso */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          Associa il tempo a un&apos;attività di oggi:
        </Text>
        {availableSessions.length > 0 ? (
          <Segmented
            options={sessionOptions}
            labels={sessionLabels}
            value={selectedSessionId}
            onChange={setSelectedSessionId}
          />
        ) : (
          <Text style={styles.bodyText}>
            Non hai attività pianificate (o non completate) per oggi.
          </Text>
        )}
      </View>

      {/* Tasto switch posizionato in alto a destra, appena prima del riquadro del timer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 8,
        }}
      >
        <Pressable
          style={[
            styles.secondaryButton,
            mode === "Studio"
              ? styles.switchButtonStudio
              : styles.switchButtonPausa,
          ]}
          onPress={() => reset(mode === "Studio" ? "Pausa" : "Studio")}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              mode === "Studio"
                ? styles.switchButtonTextStudio
                : styles.switchButtonTextPausa,
            ]}
          >
            {mode === "Studio" ? "Pausa pomodoro" : "Studio"}
          </Text>
        </Pressable>
      </View>

      {/* Riquadro del timer */}
      <View
        style={[styles.timerPanel, mode === "Pausa" && styles.timerPanelPausa]}
      >
        <Text
          style={[
            styles.timerMode,
            mode === "Pausa" && styles.timerModePausa,
          ]}
        >
          {mode}
        </Text>

        {/* Cerchio SVG tipo miccia + minutaggio al centro */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: mode === "Studio" ? 24 : 16,
            marginBottom: 16,
          }}
        >
          <Svg width={radius * 2} height={radius * 2}>
            {/* Cerchio di sfondo */}
            <Circle
              stroke={backgroundColor}
              fill="none"
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              strokeWidth={strokeWidth}
            />
            {/* Miccia che si accorcia */}
            <Circle
              stroke={circleColor}
              fill="none"
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${radius}, ${radius}`}
            />
          </Svg>

          {/* Testo del timer sopra il cerchio */}
          <View
            style={{
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.timer}>{formatTimer(secondsLeft)}</Text>
          </View>
        </View>

        <Text style={styles.rowMeta}>
          Sessioni completate oggi: {completedPomodoros}
        </Text>

        <View style={styles.actionsCentered}>
          {/* Tasto play/pausa del conto alla rovescia */}
          <Pressable
            style={[
              styles.primaryButton,
              mode === "Pausa" && styles.primaryButtonPausa,
            ]}
            onPress={() => setRunning((v) => !v)}
          >
            <Text
              style={[
                styles.primaryButtonText,
                mode === "Pausa" && styles.primaryButtonTextPausa,
              ]}
            >
              {running ? "Pausa" : "Avvia"}
            </Text>
          </Pressable>

          {/* Tasto per resettare il ciclo corrente */}
          <Pressable
            style={[
              styles.secondaryButton,
              mode === "Pausa" && styles.secondaryButtonPausa,
            ]}
            onPress={() => reset(mode)}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                mode === "Pausa" && styles.secondaryButtonTextPausa,
              ]}
            >
              Ripristina
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sezione esplicativa */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Che cos&apos;è il Pomodoro Timer?</Text>
        <Text style={styles.bodyText}>
          Il Pomodoro Timer alterna continuativamente sessioni da 25 minuti di
          studio a pause da 5 minuti. Se selezioni un&apos;attività prima di
          iniziare, verranno aggiunti automaticamente 25 minuti allo &quot;svolto&quot; al
          termine di ogni timer di studio.
        </Text>
      </View>

      {/* Modale per salvare o scartare i minuti studiati */}
      <Modal visible={isResetModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scartare sessione?</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setIsResetModalVisible(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.bodyText}>
              Hai studiato {minutesStudied} minuti. Vuoi salvarli nel planner o
              scartarli?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <Pressable
                style={[styles.dangerButton, { flex: 1, marginRight: 8 }]}
                onPress={() => handleConfirmReset(false)}
              >
                <Text style={styles.dangerButtonText}>Scarta</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]}
                onPress={() => handleConfirmReset(true)}
              >
                <Text style={styles.primaryButtonText}>Salva</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}