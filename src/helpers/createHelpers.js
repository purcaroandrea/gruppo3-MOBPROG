import { addDays, startOfWeek } from "./date.js";
import { toNumber, round1 } from "./format.js";

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

export function createHelpers(data) {
  const courseById = (id) =>
    data.courses.find((course) => course.id === id);

  // nuove
  const examById = (id) =>
  data.exams.find((exam) => exam.id === id);

 const goalById = (id) =>
  data.goals.find((goal) => goal.id === id);
  // chiusura

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
    planned: round1(
      weekSessions.reduce(
        (sum, session) => sum + toNumber(session.plannedHours),
        0
      )
    ),
    actual: round1(
      weekSessions.reduce(
        (sum, session) => sum + toNumber(session.actualHours),
        0
      )
    ),
  };

  const hoursForCourse = (courseId) =>
    round1(
      data.sessions
        .filter((session) => session.courseId === courseId)
        .reduce((sum, session) => sum + toNumber(session.plannedHours), 0)
    );

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
      upcomingExams.find((exam) => exam.priority === "Alta") ||
      upcomingExams[0],
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
    openSessions: data.sessions.filter((s) => !s.completed).length,
    openGoals: data.goals.filter((g) => !g.completed).length,
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
      .sort((a, b) => b.hours - a.hours),
  };
}