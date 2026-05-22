const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

export const emptyCourse = {
  id: undefined,
  name: "",
  teacher: "",
  semester: "",
  credits: "",
  status: "Da iniziare",
  targetGrade: "",
  actualGrade: "",
  materials: "",
  notes: ""
};

export const emptyExam = {
  id: undefined,
  title: "",
  courseId: "",
  date: isoToday,
  type: "Esame",
  priority: "Media",
  status: "Futuro",
  result: "",
  notes: ""
};

/*
export const emptySession = {
  id: undefined,
  title: "",
  courseId: "",
  examId: "",
  date: isoToday,
  kind: "Studio",
  plannedHours: "1",
  actualHours: "",
  completed: false,
  notes: ""
};
*/
export const emptySession = {
  id: undefined,
  title: "",
  courseId: "",
  examId: "",
  date: isoToday,
  startTime: "09:00",
  endTime: "10:00",
  kind: "Studio",
  plannedHours: "1",
  actualHours: "",
  completed: false,
  notes: ""
};


export const emptyGoal = {
  id: undefined,
  title: "",
  description: "",
  courseId: "",
  period: "",
  priority: "Media",
  completed: false,
  estimatedHours: "",
  actualHours: "",
  notes: ""
};