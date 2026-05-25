const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

function addDays(isoDate, amount) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

export const seedData = {
  courses: [
    {
      id: "course-1",
      name: "Statistica Applicata",
      prefix: "Prof.",              
      teacher: "Addesso",
      semester: "2 semestre",
      credits: "6",
      status: "In corso",
      targetGrade: "28",
      actualGrade: "",
      materials: "Dispense, Script in linguaggio R, Appunti",
      notes: "Priorità alta: progetto e orale a fine sessione."
    },
    {
      id: "course-2",
      name: "Basi di Dati",
      prefix: "Prof.",
      teacher: "Gaeta",
      semester: "2 semestre",
      credits: "9",
      status: "In corso",
      targetGrade: "27",
      actualGrade: "",
      materials: "Slide SQL, Libro di testo, Dispense teoriche",
      notes: "Ripassare join, trigger e transazioni."
    },
    {
      id: "course-3",
      name: "Analisi Dei Segnali",
      prefix: "Prof.",
      teacher: "Restaino",
      semester: "1 semestre",
      credits: "9",
      status: "Completato",
      targetGrade: "28",
      actualGrade: "27",
      materials: "Dispense, Esercizi svolti, Casi di studio",
      notes: "Esame superato, conservare appunti di probabilità per Statistica Applicata."
    }
  ],

  exams: [
    {
      id: "exam-1",
      title: "Progetto Statistica Applicata",
      courseId: "course-1",
      date: "2026-07-20",
      type: "Consegna",
      priority: "Alta",
      status: "Futuro",
      notes: "Studiare la teoria e lavorare in team al progetto."
    },
    {
      id: "exam-2",
      title: "Prova scritta di Analisi dei Segnali",
      courseId: "course-3",
      date: "2025-02-17",
      type: "Prova Scritta",
      priority: "Media",
      status: "Completato",
      notes: "Fare tanti esercizi e simulazioni d'esame."
    },
    {
      id: "exam-3",
      title: "Prova scritta Basi di Dati",
      courseId: "course-2",
      date: "2026-07-02",
      type: "Prova Scritta",
      priority: "Alta",
      status: "Futuro",
      notes: "Simulare almeno tre prove complete."
    }
  ],

  sessions: [
    {
      id: "session-1",
      title: "Studiare Teoria della Stima",
      courseId: "course-1",
      examId: "exam-1",
      date: isoToday,
      kind: "Avanzamento sul progetto",
      plannedHours: "2",
      actualHours: "2",
      completed: true,
      notes: "Capire i concetti e le relative applicazioni."
    },
    {
      id: "session-2",
      title: "Ripasso SQL avanzato",
      courseId: "course-2",
      examId: "exam-3",
      date: addDays(isoToday, 1),
      kind: "Ripasso",
      plannedHours: "3",
      actualHours: "",
      completed: false,
      notes: "Join, group by, vincoli."
    },
    {
      id: "session-3",
      title: "Preparare relazione",
      courseId: "course-1",
      examId: "exam-1",
      date: addDays(isoToday, 3),
      kind: "Completamento di consegne",
      plannedHours: "2",
      actualHours: "",
      completed: false,
      notes: "Iniziare a coprire la prima parte del programma."
    }
  ],

  goals: [
  {
    id: "goal-1",
    title: "Avanzamento Statistica Applicata",
    description:
      "Arrivare a una buona conoscenza della teoria e ad un progetto quasi in ultimazione.",
    courseId: "course-1",

    
    periodStart: "Giugno",
    periodEnd: "Luglio",

    priority: "Media",
    completed: false,
    estimatedHours: "8",
    actualHours: "3",
    notes: "Avanzamento parallelo di studio individuale e progetto in gruppo."
  },
  {
    id: "goal-2",
    title: "Superare l'esame di Basi di Dati",
    description: "Dare il tutto per tutto.",
    courseId: "course-2",

    
    periodStart: "Luglio",
    periodEnd: "Settembre",

    priority: "Alta",
    completed: false,
    estimatedHours: "42",
    actualHours: "6",
    notes: "Esercitarsi con SQL."
  }
]

};