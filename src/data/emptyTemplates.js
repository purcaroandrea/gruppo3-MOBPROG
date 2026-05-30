const today = new Date();
const isoToday = today.toISOString().slice(0, 10);


export const emptyCourse = {
  id: undefined,
  name: "",
  prefix: "Prof.",                   
  teacher: "",              
  semester: "",
  credits: "",
  year: "",
  endDate: "",
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
  type: "Altro",
  priority: "Media",
  status: "Futuro",
  esito: "Da valutare",
  voto: "",
  isGradeForCourse: false,
  completed: false,
  notes: ""
};


export const emptySession = {
  id: undefined,
  title: "",
  examId: "",
  goalId: "",
  date: isoToday,
  endDate: isoToday,
  kind: "Altro",
  plannedHours: "",
  actualHours: "",
  completed: false,
  notes: ""
};



export const emptyGoal = {
  id: undefined,
  title: "",
  description: "",
  courseId: "",
  periodStart: "",   
  periodEnd: "",     
  priority: "Media",
  completed: false,
  estimatedHours: "",
  actualHours: "",
  notes: ""
};
