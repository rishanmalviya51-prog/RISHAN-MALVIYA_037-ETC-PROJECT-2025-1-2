import { CycleData, Subject, Module } from './types';

const createModule = (num: number, title: string, subtopicsList: string[] = []): Module => ({
  id: crypto.randomUUID(),
  number: num,
  title,
  subtopics: subtopicsList.map(t => ({ id: crypto.randomUUID(), title: t, completed: false })),
  attachments: []
});

// --- COMMON SUBJECTS (Maths) ---
const maths1: Subject = {
  id: "maths-1",
  courseCode: "25MAT11",
  name: "Applied Mathematics I",
  cycle: "physics", // technically common, but placed here for structure
  credits: 4,
  modules: [
    createModule(1, "Elements of Linear Algebra", ["Elementary transformations", "Rank of a Matrix", "Consistency of linear equations", "Gauss-Seidel method"]),
    createModule(2, "Applied Linear Algebra & Properties", ["Eigen values and Eigen vectors", "Rayleigh’s power method", "Diagonalization", "Homogeneous linear differential equations"]),
    createModule(3, "Differential Calculus", ["Polar coordinate system", "Curvature and radius of curvature", "Evolutes"]),
    createModule(4, "Multivariable Derivatives", ["Partial derivatives", "Total differentiation", "Jacobians", "Taylor's & Maclaurin's series"]),
    createModule(5, "Modular Arithmetic-1", ["GCD", "Linear Congruences", "Chinese Remainder Theorem"])
  ]
};

// --- PHYSICS CYCLE SUBJECTS ---
const physicsSub: Subject = {
  id: "physics",
  courseCode: "25PHY12",
  name: "Applied Physics",
  cycle: "physics",
  credits: 4,
  modules: [
    createModule(1, "Quantum Mechanics", ["Wave-Particle dualism", "Heisenberg's uncertainty principle", "Schrödinger wave equation"]),
    createModule(2, "Lasers & Fiber Optics", ["Einstein’s coefficient", "Quantum Dot Laser", "Optical fibers attenuation", "Numerical aperture"]),
    createModule(3, "Conductors & Semiconductors", ["Quantum free electron theory", "Fermi factor", "Hall Effect", "Superconductors", "Quantum Computing basics"]),
    createModule(4, "Sensors & Physics of Animation", ["Sensor characteristics", "Physics-based animation methods", "Motion graphs"]),
    createModule(5, "Quantum Computing", ["Qubits", "Bloch sphere", "Quantum gates (Pauli, Hadamard, CNOT)"])
  ]
};

const electronics: Subject = {
  id: "electronics",
  courseCode: "25ESC131",
  name: "Intro to Electronics & Comm.",
  cycle: "physics",
  credits: 3,
  modules: [
    createModule(1, "Semiconductor Diode", ["P-N Junction", "Rectifiers (Half/Full)", "Zener diode"]),
    createModule(2, "Transistors", ["BJT Operation", "Biasing", "JFET", "MOSFET"]),
    createModule(3, "Op-Amps & Oscillators", ["Inverting/Non-inverting Amplifiers", "Wein Bridge Oscillator"]),
    createModule(4, "Communication Systems", ["Amplitude Modulation", "Frequency Modulation", "Digital Modulation (ASK, FSK)"]),
    createModule(5, "Digital Logic", ["Number Systems", "Logic Gates", "Boolean Algebra", "Adders"])
  ]
};

const python: Subject = {
  id: "python",
  courseCode: "25CSE144",
  name: "Problem Solving Using Python",
  cycle: "physics",
  credits: 4,
  modules: [
    createModule(1, "Basics of Python", ["Variables & Data Types", "Operators", "Input/Output"]),
    createModule(2, "Loops & Functions", ["Control statements", "Lambda functions", "Recursion"]),
    createModule(3, "Strings & Exceptions", ["String manipulation", "Exception handling (try/except)"]),
    createModule(4, "Data Structures", ["Lists", "Tuples", "Sets", "Dictionaries"]),
    createModule(5, "Files & OOP", ["File handling", "Classes & Objects", "Inheritance"])
  ]
};

const aiIntro: Subject = {
  id: "ai-intro",
  courseCode: "25ETC15",
  name: "Intro to AI & Applications",
  cycle: "physics",
  credits: 3,
  modules: [
    createModule(1, "Intro to AI", ["Weak vs Strong AI", "Machine Intelligence"]),
    createModule(2, "Prompt Engineering", ["Types of Prompts", "LLM Communication"]),
    createModule(3, "Prompt Techniques", ["Zero/Few Shot", "ChatGPT Configuration"]),
    createModule(4, "Ethics & Trends", ["AI Bias", "AI as a Service", "AIoT"]),
    createModule(5, "Industrial Applications", ["AI in Healthcare", "AI in Finance", "Robotics"])
  ]
};

// --- CHEMISTRY CYCLE SUBJECTS ---
const chemistry: Subject = {
  id: "chemistry",
  courseCode: "25CHE12",
  name: "Applied Chemistry",
  cycle: "chemistry",
  credits: 4,
  modules: [
    createModule(1, "Energy Conversion & Storage", ["Batteries (Li-ion)", "Fuel Cells", "Solar Cells"]),
    createModule(2, "Corrosion Science", ["Electrochemical theory", "Corrosion control", "Electroplating"]),
    createModule(3, "Nano Materials & Displays", ["Nanomaterials synthesis", "OLED/QLED Displays"]),
    createModule(4, "Pollution & Water Treatment", ["Air pollution control", "Water softening", "Desalination"]),
    createModule(5, "Sensors & E-Waste", ["Chemical Sensors", "E-Waste Management", "Metal Recovery"])
  ]
};

const electrical: Subject = {
  id: "electrical",
  courseCode: "25ESC132",
  name: "Intro to Electrical Eng.",
  cycle: "chemistry",
  credits: 3,
  modules: [
    createModule(1, "Power Plants & DC Circuits", ["Renewable energy", "KCL & KVL"]),
    createModule(2, "AC Circuits", ["Waveforms", "Three Phase Circuits"]),
    createModule(3, "Measurements & Wiring", ["Measuring instruments", "Domestic Wiring"]),
    createModule(4, "Electrical Machines", ["DC Generator/Motor", "Transformers"]),
    createModule(5, "Tariff & Safety", ["Energy conservation", "Electric Shock safety", "EV overview"])
  ]
};

const mechanical: Subject = {
  id: "mechanical",
  courseCode: "25ESC133",
  name: "Intro to Mechanical Eng.",
  cycle: "chemistry",
  credits: 3,
  modules: [
    createModule(1, "Energy Sources", ["Renewable sources", "Composite materials"]),
    createModule(2, "Refrigeration & IC Engines", ["Vapor Compression", "4-Stroke Engines", "EVs"]),
    createModule(3, "Machine Tools", ["Lathe", "Drilling", "3D Printing"]),
    createModule(4, "Robotics & Automation", ["Robot anatomy", "Industrial automation"]),
    createModule(5, "Future Mobility", ["Hybrid Vehicles", "Modern manufacturing"])
  ]
};

const cProgramming: Subject = {
  id: "c-prog",
  courseCode: "25PLC24",
  name: "Programming in C",
  cycle: "chemistry",
  credits: 3,
  modules: [
    createModule(1, "Basics of C", ["Data types", "Operators", "Branching & Looping"]),
    createModule(2, "Arrays & Strings", ["1D/2D Arrays", "String handling"]),
    createModule(3, "Functions & Pointers", ["Recursion", "Pointer arithmetic", "Pass by value/reference"]),
    createModule(4, "Structures & Union", ["Nested structures", "Memory allocation"]),
    createModule(5, "Sorting & Files", ["Bubble/Selection Sort", "File I/O"])
  ]
};

const cad: Subject = {
  id: "cad",
  courseCode: "25CAD15",
  name: "Computer Aided Drawing",
  cycle: "chemistry",
  credits: 3,
  modules: [
    createModule(1, "Projections of Points/Planes", ["Orthographic projection", "Plane surfaces"]),
    createModule(2, "Projections of Solids", ["Prisms", "Pyramids", "Cones"]),
    createModule(3, "Orthographic Projections", ["Conversion of pictorial views"]),
    createModule(4, "Isometric Projections", ["Isometric scale", "Simple solids"]),
    createModule(5, "3D Modelling", ["CAD Tools", "3D Printing basics"])
  ]
};

// Initial Seed Data
export const INITIAL_DATA: CycleData[] = [
  {
    id: "physics",
    name: "Physics Cycle",
    subjects: [maths1, physicsSub, electronics, python, aiIntro]
  },
  {
    id: "chemistry",
    name: "Chemistry Cycle",
    subjects: [
      {...maths1, id: "maths-1-chem", cycle: "chemistry"}, // Maths is common
      chemistry, electrical, mechanical, cProgramming, cad
    ]
  }
];
