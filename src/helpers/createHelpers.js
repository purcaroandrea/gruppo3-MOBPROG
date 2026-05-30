import { addDays, startOfWeek, weekday } from "./date.js";
import { toNumber, minutesToDecimalHours } from "./format.js";

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

export function createHelpers(data) {
  const courseById = (id) => data.courses.find((course) => course.id === id);
  const examById = (id) => data.exams.find((exam) => exam.id === id);
  const goalById = (id) => data.goals.find((goal) => goal.id === id);

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

  const weekSessions = data.sessions.filter(
    (session) => session.date >= weekStart && session.date <= weekEnd
  );

  const weekHours = {
    planned: minutesToDecimalHours(
      weekSessions.reduce(
        (sum, session) => sum + toNumber(session.plannedHours),
        0
      )
    ),
    actual: minutesToDecimalHours(
      weekSessions.reduce(
        (sum, session) => sum + toNumber(session.actualHours),
        0
      )
    ),
  };

  const hoursForCourse = (courseId) =>
    minutesToDecimalHours(
      data.sessions
        .filter((session) => session.courseId === courseId)
        .reduce((sum, session) => sum + toNumber(session.plannedHours), 0)
    );

  const maxCourseHours = Math.max(
    1,
    ...data.courses.map((course) => hoursForCourse(course.id))
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => addDays(isoToday, -6 + i));
  
  const studyChartData = {
    // Etichette asse X (es. "Dom", "Lun", "Mar")
    labels: last7Days.map(date => weekday(date)), 
    // Dati asse Y (somma dei minuti studiati per ogni giorno, convertiti in ore)
    data: last7Days.map(date => {
      const dailySessions = data.sessions.filter(s => s.date === date && s.completed);
      const totalDailyMinutes = dailySessions.reduce((sum, s) => sum + toNumber(s.actualHours), 0);
      return minutesToDecimalHours(totalDailyMinutes);
    })
  };

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
    openSessions: data.sessions.filter((s) => !s.completed).length,
    openGoals: data.goals.filter((g) => !g.completed).length,
    
    // Esportazione dei dati calcolati e del grafico
    weekHours,
    hoursForCourse,
    studyChartData,
    
    studyByCourse: data.courses
      .map((course) => {
        const hours = hoursForCourse(course.id);
        return {
          courseId: course.id,
          name: course.name,
          hours,
          percent: Math.max(
            5,
            Math.round((hours / maxCourseHours) * 100)
          ),
        };
      })
      .sort((a, b) => b.hours - a.hours), // Ordina i corsi dal più studiato al meno studiato
  };
}