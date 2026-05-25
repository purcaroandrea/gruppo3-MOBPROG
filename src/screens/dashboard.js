import React from "react";
import { Pressable, Text, View } from "react-native";
import Metric from "../components/Metric";
import Panel from "../components/Panel";
import PriorityBadge from "../components/PriorityBadge";
import { formatDate } from "../helpers/date";
import styles from "../styles/styles";

export default function Dashboard({ data, helpers, setActiveTab, addSuggestedSession }) {
  const upcoming = helpers.upcomingExams.slice(0, 3);
  const topCourses = helpers.studyByCourse.slice(0, 4);

  return (
    <View>
      <Text style={styles.sectionTitle}>Panoramica</Text>

      <View style={styles.metricGrid}>
        <Metric label="Corsi inseriti" value={data.courses.length} />
        <Metric label="Esami futuri" value={helpers.futureExams.length} />
        <Metric label="Attività e Obiettivi da completare" value={helpers.openGoals + helpers.openSessions} />
        <Metric label="Ore svolte" value={`${helpers.weekHours.actual}h`} />
      </View>

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

      <Panel title="Ripartizione per corso delle ore settimanali">
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

      {helpers.nextCriticalExam && (
        <Panel title="Suggerimento automatico">
          <Text style={styles.bodyText}>
            L'esame più vicino con priorità alta è {helpers.nextCriticalExam.title}.  
            Conviene pianificare un ripasso per domani.
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