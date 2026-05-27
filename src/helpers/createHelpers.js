import { addDays, startOfWeek } from "./date.js";
import { toNumber, minutesToDecimalHours } from "./format.js";

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

export function createHelpers(data) {
  // Helpers di base per recuperare entità tramite ID
  const courseById = (id) => data.courses.find((course) => course.id === id);
  const examById = (id) => data.exams.find((exam) => exam.id === id);
  const goalById = (id) => data.goals.find((goal) => goal.id === id);

  // Filtraggio esami futuri e imminenti
  const futureExams = data.exams.filter(
    (exam) =>
      exam.status !== "Completato" &&
      exam.status !== "Annullato" &&
      exam.date >= isoToday
  );

  const upcomingExams = [...futureExams].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Calcolo delle date per la settimana corrente
  const weekStart = startOfWeek(isoToday);
  const weekEnd = addDays(weekStart, 6);

  const weekSessions = data.sessions.filter(
    (session) => session.date >= weekStart && session.date <= weekEnd
  );

  // 🔥 Calcolo delle ore settimanali (somma i minuti e li converte in ore decimali per l'UI)
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

  // 🔥 Calcolo delle ore totali per singolo corso (converte i minuti in ore decimali)
  const hoursForCourse = (courseId) =>
    minutesToDecimalHours(
      data.sessions
        .filter((session) => session.courseId === courseId)
        .reduce((sum, session) => sum + toNumber(session.plannedHours), 0)
    );

  // Trova il valore massimo di ore tra tutti i corsi (per scalare le progress bar)
  const maxCourseHours = Math.max(
    1,
    ...data.courses.map((course) => hoursForCourse(course.id))
  );

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
    
    // Contatori per attività in sospeso
    openSessions: data.sessions.filter((s) => !s.completed).length,
    openGoals: data.goals.filter((g) => !g.completed).length,
    
    // Esportazione dei dati calcolati
    weekHours,
    hoursForCourse,
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