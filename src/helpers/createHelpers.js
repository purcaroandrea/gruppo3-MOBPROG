import { addDays, startOfWeek, weekday, getSessionDaysCount, getOverlapDaysCount } from "./date.js";
import { toNumber, minutesToDecimalHours } from "./format.js";

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

export function createHelpers(data) {
  const courseById = (id) => data.courses.find((course) => course.id === id);
  const examById = (id) => data.exams.find((exam) => exam.id === id);
  const goalById = (id) => data.goals.find((goal) => goal.id === id);

  // Risolve il courseId di una sessione risalendo tramite esame o obiettivo
  const courseIdForSession = (session) => {
    if (session.courseId) return session.courseId;
    if (session.examId) {
      const exam = examById(session.examId);
      if (exam?.courseId) return exam.courseId;
    }
    if (session.goalId) {
      const goal = goalById(session.goalId);
      if (goal?.courseId) return goal.courseId;
    }
    return null;
  };

  const futureExams = data.exams.filter(
    (exam) =>
      exam.status !== "Completato" &&
      exam.status !== "Annullato" &&
      exam.date >= isoToday
  );

  const upcomingExams = [...futureExams].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const weekStart = startOfWeek(isoToday);
  const weekEnd = addDays(weekStart, 6);

  const weekSessions = data.sessions.filter((session) => {
    const start = session.date;
    const end = session.endDate || session.date;
    return start <= weekEnd && end >= weekStart;
  });

  const weekHours = {
    planned: minutesToDecimalHours(
      weekSessions.reduce((sum, session) => {
        const overlapDays = getOverlapDaysCount(session, weekStart, weekEnd);
        const totalDays = getSessionDaysCount(session);
        const portion = overlapDays / totalDays;
        return sum + (toNumber(session.plannedHours) * portion);
      }, 0)
    ),
    actual: minutesToDecimalHours(
      weekSessions.reduce((sum, session) => {
        const overlapDays = getOverlapDaysCount(session, weekStart, weekEnd);
        const totalDays = getSessionDaysCount(session);
        const portion = overlapDays / totalDays;
        return sum + (toNumber(session.actualHours) * portion);
      }, 0)
    ),
  };

  // Ore settimanali pianificate per corso (con sovrapposizione proporzionale sulla settimana corrente)
  const weekHoursForCourse = (courseId) => {
    return minutesToDecimalHours(
      weekSessions.reduce((sum, session) => {
        if (courseIdForSession(session) !== courseId) return sum;
        const overlapDays = getOverlapDaysCount(session, weekStart, weekEnd);
        const totalDays = getSessionDaysCount(session);
        const portion = overlapDays / totalDays;
        return sum + (toNumber(session.plannedHours) * portion);
      }, 0)
    );
  };

  const maxWeekCourseHours = Math.max(
    1,
    ...data.courses.map((course) => weekHoursForCourse(course.id))
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => addDays(isoToday, -6 + i));
  
  const studyChartData = {
    // Etichette asse X (es. "Dom", "Lun", "Mar")
    labels: last7Days.map(date => weekday(date)), 
    // Dati asse Y (somma dei minuti studiati per ogni giorno, convertiti in ore)
    data: last7Days.map(date => {
      const dailySessions = data.sessions.filter(s => {
        const start = s.date;
        const end = s.endDate || s.date;
        return start <= date && date <= end && s.completed;
      });
      const totalDailyMinutes = dailySessions.reduce((sum, s) => {
        const totalDays = getSessionDaysCount(s);
        const actual = toNumber(s.actualHours);
        return sum + (actual / totalDays);
      }, 0);
      return minutesToDecimalHours(totalDailyMinutes);
    })
  };

  // Attività aperte = sessioni non completate che NON sono interamente future
  // (cioè la data di fine è <= oggi, oppure la sessione è in corso oggi)
  const openSessions = data.sessions.filter((s) => {
    if (s.completed) return false;
    const end = s.endDate || s.date;
    return end <= isoToday; // scadute o in corso oggi
  }).length;

  // Helper: esame completato (superato, non superato, completato, annullato)
  const isExamDone = (e) =>
    e.completed || e.status === "Completato" || e.status === "Annullato" ||
    e.esito === "Superato" || e.esito === "Non superato";

  // Contatori per dashboard: esami da svolgere (non consegne), progetti in scadenza, progetti in ritardo
  const isConsegna = (e) => e.type === "Consegna";
  const futureExamsCount = data.exams.filter(
    (e) => !isConsegna(e) && e.date >= isoToday && !isExamDone(e)
  ).length;
  const deliverCount = data.exams.filter(
    (e) => isConsegna(e) && e.date >= isoToday && !isExamDone(e)
  ).length;
  const overdueCount = data.exams.filter(
    (e) => isConsegna(e) && e.date < isoToday && !isExamDone(e)
  ).length;

  return {
    courseById,
    examById,
    goalById,
    futureExams,
    upcomingExams,
    nextCriticalExam:
      upcomingExams.find((exam) => exam.priority === "Alta") || upcomingExams[0],
    
    // Generazione delle opzioni per i menu a tendina (Segmented/Picker)
    courseOptions: data.courses.map((course) => ({
      id: course.id,
      name: course.name,
    })),
    examOptions: data.exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
    })),
    goalOptions: data.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
    })),
    
    // Contatori per attività e obiettivi aperti
    openSessions,
    openGoals: data.goals.filter((g) => !g.completed).length,
    futureExamsCount,
    deliverCount,
    overdueCount,
    
    // Esportazione dei dati calcolati e del grafico
    weekHours,
    weekHoursForCourse,
    studyChartData,
    
    // Distribuzione ore pianificate per corso NELLA SETTIMANA CORRENTE (con overlap proporzionale)
    studyByCourse: data.courses
      .map((course) => {
        const hours = weekHoursForCourse(course.id);
        return {
          courseId: course.id,
          name: course.name,
          hours,
          percent: Math.max(
            5,
            Math.round((hours / maxWeekCourseHours) * 100)
          ),
        };
      })
      .filter((entry) => entry.hours > 0)
      .sort((a, b) => b.hours - a.hours),
  };
}