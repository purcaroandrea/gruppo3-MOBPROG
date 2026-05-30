import React from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Metric from "../components/metric";
import Panel from "../components/panel";
import PriorityBadge from "../components/priority-badge";
import { formatDate } from "../helpers/date";

import { useStyles } from "../../hooks/useStyles";

export default function Dashboard({ data, helpers, setActiveTab, addSuggestedSession }) {
  const { styles, themeColors } = useStyles();

  const upcoming = helpers.upcomingExams.slice(0, 3);
  const screenWidth = Dimensions.get("window").width;

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

      {/* METRICHE PRINCIPALI */}
      <View style={styles.metricGrid}>
        <Metric label="Corsi inseriti" value={data.courses.length} />
        <Metric label="Esami superati" value={data.exams.filter(e => e.esito === "Superato").length} />
        <Metric label="Esami da svolgere" value={helpers.futureExamsCount} />
        <Metric label="Progetti in scadenza" value={helpers.deliverCount} />
        <Metric
          label="Progetti in ritardo"
          value={helpers.overdueCount}
          valueColor={helpers.overdueCount > 0 ? themeColors.dangerText : undefined}
        />
        <Metric
          label="Obiettivi completati"
          value={`${data.goals.filter(g => g.completed).length} / ${data.goals.length}`}
        />
        <Metric
          label="Ore svolte (Settimana)"
          value={`${helpers.weekHours?.actual ?? 0}h`}
        />
        <Metric
          label="Ore previste (Settimana)"
          value={`${helpers.weekHours?.planned ?? 0}h`}
        />
      </View>

      {/* GRAFICO ANDAMENTO STUDIO */}
      <Panel title="Andamento ultimi 7 giorni">
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              // COLORI DEL GRAFICO DINAMICI
              backgroundColor: themeColors.card,
              backgroundGradientFrom: themeColors.card,
              backgroundGradientTo: themeColors.card,
              decimalPlaces: 1, 
              color: (opacity = 1) => `rgba(226, 135, 67, ${opacity})`,
              labelColor: (opacity = 1) => themeColors.textMuted,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: themeColors.primary
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

      {/* DISTRIBUZIONE ORE PER CORSO (settimana corrente) */}
      <Panel title="Distribuzione settimanale per corso">
        {helpers.studyByCourse.length > 0 ? (
          helpers.studyByCourse.slice(0, 4).map((entry) => (
            <View key={entry.courseId} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{entry.name}</Text>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, { width: `${entry.percent}%` }]} />
              </View>
              <Text style={styles.chartValue}>{entry.hours}h</Text>
            </View>
          ))
        ) : (
          <Text style={styles.bodyText}>Nessuna attività pianificata questa settimana.</Text>
        )}
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