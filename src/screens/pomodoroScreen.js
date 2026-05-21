import { View, Text, Pressable } from "react-native";
import styles from "../styles/styles";

export default function PomodoroScreen() {
  const [mode, setMode] = React.useState("Studio");
  const [secondsLeft, setSecondsLeft] = React.useState(25 * 60);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;

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

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Pomodoro Timer</Text>

      <View style={styles.timerPanel}>
        <Text style={styles.timerMode}>{mode}</Text>
        <Text style={styles.timer}>{formatTimer(secondsLeft)}</Text>
        <Text style={styles.rowMeta}>Sessioni completate oggi: {sessions}</Text>

        <View style={styles.actionsCentered}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => setRunning((v) => !v)}
          >
            <Text style={styles.primaryButtonText}>
              {running ? "Pausa" : "Avvia"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => reset("Studio")}
          >
            <Text style={styles.secondaryButtonText}>Ripristina</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => reset("Pausa")}
          >
            <Text style={styles.secondaryButtonText}>Pausa breve</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Che cos'è il Pomodoro Timer?</Text>
        <Text style={styles.bodyText}>
          Il Pomodoro Timer alterna sessioni da 25 minuti di concentrazione a pause da 5 minuti.
          Le sessioni completate vengono registrate automaticamente.
        </Text>
      </View>
    </View>
  );
}