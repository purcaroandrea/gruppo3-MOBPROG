import { useContext } from "react";
import { Dimensions, Pressable, Switch, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Metric from "../components/metric";
import Panel from "../components/panel";
import PriorityBadge from "../components/priority-badge";
import { formatDate } from "../helpers/date";

import { useStyles } from "../../hooks/useStyles";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Dashboard({ data, helpers, setActiveTab, addSuggestedSession }) {
  // Estraiamo gli stili e i colori attuali
  const { styles, themeColors } = useStyles();
  
  // Estraiamo il tema attivo e la funzione per cambiarlo
  const { activeTheme, toggleTheme } = useContext(ThemeContext);

  const upcoming = helpers.upcomingExams.slice(0, 3);
  const topCourses = helpers.studyByCourse.slice(0, 4);
  
  // Otteniamo la larghezza dello schermo per adattare il grafico al dispositivo
  const screenWidth = Dimensions.get("window").width;

  // Prepariamo i dati del grafico con un fallback di sicurezza
  const chartData = {
    labels: helpers.studyChartData?.labels || ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    datasets: [
      {
        data: helpers.studyChartData?.data || [0, 0, 0, 0, 0, 0, 0],
      }
    ]
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Panoramica</Text>

      {/* INTERRUTTORE MODALITÀ NOTTURNA */}
      <View style={[styles.panel, styles.filterRow, { marginBottom: 20 }]}>
        <Text style={styles.label}>Modalità Notturna 🌙</Text>
        <Switch 
          value={activeTheme === 'dark'} 
          onValueChange={toggleTheme} 
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor={themeColors.card}
        />
      </View>

      {/* METRICHE PRINCIPALI */}
      <View style={styles.metricGrid}>
  <Metric label="Corsi inseriti" value={data.courses.length} />
  <Metric label="Esami futuri" value={helpers.futureExams.length} />
  <Metric label="Attività da completare" value={helpers.openGoals + helpers.openSessions} />
  <Metric
    label="Ore svolte settimana"
    value={`${helpers.weekHours?.actual ?? 0}h`}
  />
</View>

      {/* GRAFICO ANDAMENTO STUDIO */}
      <Panel title="Andamento ultimi 7 giorni">
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <LineChart
            data={chartData}
            width={screenWidth - 64} // Larghezza schermo meno padding laterali
            height={220}
            chartConfig={{
              // COLORI DEL GRAFICO DINAMICI
              backgroundColor: themeColors.card,
              backgroundGradientFrom: themeColors.card,
              backgroundGradientTo: themeColors.card,
              decimalPlaces: 1, 
              color: (opacity = 1) => `rgba(226, 135, 67, ${opacity})`, // Linea arancione
              labelColor: (opacity = 1) => themeColors.textMuted, // Testo delle ascisse e ordinate
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: themeColors.primary // Contorno dei puntini
              }
            }}
            bezier 
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            yAxisSuffix="h" 
          />
        </View>
      </Panel>

      {/* ESAMI IMMINENTI */}
      <Panel title="Esami imminenti" action="Vedi esami" onAction={() => setActiveTab("Esami")}>
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

      {/* DISTRIBUZIONE ORE PER CORSO */}
      <Panel title="Distribuzione settimanale per corso">
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

      {/* SUGGERIMENTO AUTOMATICO */}
      {helpers.nextCriticalExam && (
        <Panel title="Suggerimento automatico">
          <Text style={styles.bodyText}>
            L&apos;esame più vicino con priorità alta è {helpers.nextCriticalExam.title}. Conviene pianificare un ripasso per domani.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => addSuggestedSession(helpers.nextCriticalExam)}
          >
            <Text style={styles.primaryButtonText}>Crea attività</Text>
          </Pressable>
        </Panel>
      )}
    </View>
  );
}