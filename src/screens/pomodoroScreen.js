import React from "react";
import { View, Text, Pressable } from "react-native";
// INSERISCI QUESTA (aggiustando il percorso se necessario, ad es. "./hooks/useStyles" da App.js):
import { useStyles } from "../../hooks/useStyles";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Segmented from "../components/Segmented"; // Importiamo il selettore

export default function PomodoroScreen({ data, upsert }) {
  const { styles } = useStyles();
  const [mode, setMode] = React.useState("Studio");
  const [secondsLeft, setSecondsLeft] = React.useState(25 * 60);
  const [running, setRunning] = React.useState(false);
  
  // Usiamo questo contatore per triggerare il salvataggio automatico
  const [completedPomodoros, setCompletedPomodoros] = React.useState(0);
  
  // Stato per l'attività selezionata a cui aggiungere il tempo
  const [selectedSessionId, setSelectedSessionId] = React.useState("");

  const soundRef = React.useRef(null);

  // Filtriamo solo le attività di oggi non ancora completate
  const today = new Date().toISOString().slice(0, 10);
  const availableSessions = data?.sessions.filter(s => s.date === today && !s.completed) || [];
  
  const sessionOptions = ["", ...availableSessions.map((s) => s.id)];
  const sessionLabels = { "": "Nessuna attività" };
  availableSessions.forEach((s) => {
    sessionLabels[s.id] = s.title;
  });

  async function playSound() {
    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/images/pomodoro-end.mp3")   
      );
      soundRef.current = sound;
    }
    await soundRef.current.replayAsync();
  }

  // Effetto che gestisce il timer
  React.useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value > 1) return value - 1;

        // Il timer è arrivato a zero
        playSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const nextMode = mode === "Studio" ? "Pausa" : "Studio";
        
        // Se era un timer di studio, incrementiamo il contatore dei pomodori completati
        if (mode === "Studio") {
          setCompletedPomodoros((count) => count + 1);
        }

        setMode(nextMode);
        return nextMode === "Studio" ? 25 * 60 : 5 * 60;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, mode]);

  // 🔥 NUOVA LOGICA: Quando completi un pomodoro, salva 25 minuti sull'attività
  React.useEffect(() => {
    if (completedPomodoros > 0 && selectedSessionId) {
      const session = data.sessions.find(s => s.id === selectedSessionId);
      
      if (session) {
        const currentActual = parseInt(session.actualHours || "0", 10);
        const newActual = currentActual + 25; // Aggiunge 25 minuti
        
        upsert("sessions", { ...session, actualHours: String(newActual) });
      }
    }
  }, [completedPomodoros]); // Questo useEffect scatta solo quando il contatore si aggiorna

  const reset = (nextMode = mode) => {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(nextMode === "Studio" ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Pomodoro Timer</Text>

      {/* Selettore dell'attività */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Associa il tempo a un'attività di oggi:</Text>
        {availableSessions.length > 0 ? (
          <Segmented 
            options={sessionOptions} 
            labels={sessionLabels} 
            value={selectedSessionId} 
            onChange={setSelectedSessionId} 
          />
        ) : (
          <Text style={styles.bodyText}>Non hai attività pianificate (o non completate) per oggi.</Text>
        )}
      </View>

      <View style={[styles.timerPanel, mode === "Pausa" && styles.timerPanelPausa]}>
        
        <Text style={[styles.timerMode, mode === "Pausa" && styles.timerModePausa]}>{mode}</Text>
        <Text style={styles.timer}>{formatTimer(secondsLeft)}</Text>
        <Text style={styles.rowMeta}>Sessioni completate oggi: {completedPomodoros}</Text>

        <View style={styles.actionsCentered}>
          {/* Bottone principale */}
          <Pressable
            style={[styles.primaryButton, mode === "Pausa" && styles.primaryButtonPausa]}
            onPress={() => setRunning((v) => !v)}
          >
            <Text style={styles.primaryButtonText}>
              {running ? "Pausa" : "Avvia"}
            </Text>
          </Pressable>

          
          <Pressable
            style={[styles.secondaryButton, mode === "Pausa" && styles.secondaryButtonPausa]}
            onPress={() => reset("Studio")}
          >
            <Text style={[styles.secondaryButtonText, mode === "Pausa" && styles.secondaryButtonTextPausa]}>
              Ripristina
            </Text>
          </Pressable>

          
          <Pressable
            style={[styles.secondaryButton, mode === "Pausa" && styles.secondaryButtonPausa]}
            onPress={() => reset("Pausa")}
          >
            <Text style={[styles.secondaryButtonText, mode === "Pausa" && styles.secondaryButtonTextPausa]}>
              Pausa breve
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Che cos'è il Pomodoro Timer?</Text>
        <Text style={styles.bodyText}>
          Il Pomodoro Timer alterna continuativamente sessioni da 25 minuti di studio a pause da 5 minuti. 
          Se selezioni un'attività prima di iniziare, verranno aggiunti automaticamente 25 minuti allo "svolto" al termine di ogni timer di studio.
        </Text>
      </View>
    </View>
  );
}