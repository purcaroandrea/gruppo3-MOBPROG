import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useStyles } from "../../hooks/useStyles";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Segmented from "../components/Segmented";

export default function PomodoroScreen({ data, upsert }) {
  const { styles } = useStyles();
  const [mode, setMode] = useState("Studio");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  
  // Contatore per tenere traccia delle sessioni finite oggi
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Salva l'id dell'attività a cui aggiungere le ore studiate
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const soundRef = useRef(null);

  // Filtra le attività di oggi che non sono ancora state completate
  const today = new Date().toISOString().slice(0, 10);
  const availableSessions = data?.sessions.filter(s => s.date === today && !s.completed) || [];
  
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
        return nextMode === "Studio" ? 25 * 60 : 5 * 60;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, mode]);

  // Salva 25 minuti in automatico sull'attività selezionata
  useEffect(() => {
    if (completedPomodoros > 0 && selectedSessionId) {
      const session = data.sessions.find(s => s.id === selectedSessionId);
      
      if (session) {
        const currentActual = parseInt(session.actualHours || "0", 10);
        const newActual = currentActual + 25; 
        
        upsert("sessions", { ...session, actualHours: String(newActual) });
      }
    }
  }, [completedPomodoros]);

  // Resetta il timer e cambia modalità
  const reset = (nextMode = mode) => {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(nextMode === "Studio" ? 25 * 60 : 5 * 60);
  };

  // Formatta i secondi residui in formato minuti:secondi
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Pomodoro Timer</Text>

      {/* Selezione dell'attività in corso */}
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

      {/* Tasto switch posizionato in alto a destra, appena prima del riquadro del timer */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 }}>
        <Pressable
          style={[
            styles.secondaryButton, 
            mode === "Studio" ? styles.switchButtonStudio : styles.switchButtonPausa
          ]}
          onPress={() => reset(mode === "Studio" ? "Pausa" : "Studio")}
        >
          <Text style={[
            styles.secondaryButtonText, 
            mode === "Studio" ? styles.switchButtonTextStudio : styles.switchButtonTextPausa
          ]}>
            {mode === "Studio" ? "Pausa pomodoro" : "Studio"}
          </Text>
        </Pressable>
      </View>

      {/* Riquadro del timer */}
      <View style={[styles.timerPanel, mode === "Pausa" && styles.timerPanelPausa]}>
        
        <Text style={[styles.timerMode, mode === "Pausa" && styles.timerModePausa]}>{mode}</Text>
        <Text style={styles.timer}>{formatTimer(secondsLeft)}</Text>
        <Text style={styles.rowMeta}>Sessioni completate oggi: {completedPomodoros}</Text>

        <View style={styles.actionsCentered}>
          {/* Tasto play/pausa del conto alla rovescia */}
          <Pressable
            style={[styles.primaryButton, mode === "Pausa" && styles.primaryButtonPausa]}
            onPress={() => setRunning((v) => !v)}
          >
            {/* 🔥 Aggiunto primaryButtonTextPausa per invertire il colore del testo! */}
            <Text style={[styles.primaryButtonText, mode === "Pausa" && styles.primaryButtonTextPausa]}>
              {running ? "Pausa" : "Avvia"}
            </Text>
          </Pressable>

          {/* Tasto per resettare il ciclo corrente */}
          <Pressable
            style={[styles.secondaryButton, mode === "Pausa" && styles.secondaryButtonPausa]}
            onPress={() => reset(mode)}
          >
            <Text style={[styles.secondaryButtonText, mode === "Pausa" && styles.secondaryButtonTextPausa]}>
              Ripristina
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sezione esplicativa */}
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