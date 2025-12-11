
export type CycleId = "physics" | "chemistry";

export interface Subtopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  objectUrl: string; // Transient URL for current session
  analysis?: string; // AI Generated analysis
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description?: string;
  subtopics: Subtopic[];
  attachments: Attachment[]; // Not persisted deeply in LS, handled carefully
}

export interface Subject {
  id: string;
  courseCode: string;
  name: string;
  cycle: CycleId;
  credits: number;
  modules: Module[];
}

export interface CycleData {
  id: CycleId;
  name: string;
  subjects: Subject[];
}

// --- TIMER & ANALYTICS TYPES ---

export interface StudySession {
  id: string;
  subjectId?: string;
  moduleId?: string; // Optional, might just be subject level
  topicId?: string;  // For granular tracking
  durationMinutes: number;
  startedAt: string; // ISO
  endedAt: string;   // ISO
}

export type TimeRange = "today" | "week" | "month" | "all";

// --- PLANNER TYPES ---

export interface PlanTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  tasks: PlanTask[];
}

export interface PlannerState {
  dailyPlans: Record<string, DailyPlan>;
}

// --- AI MENTOR TYPES ---

export interface ModuleMentorFormula {
  expression: string;
  meaning: string;
  where_it_is_used: string;
  high_yield: boolean;
}

export interface ModuleMentorDerivation {
  title: string;
  main_result: string;
  steps_outline: string[];
  importance: "high" | "medium" | "low";
}

export interface ModuleMentorTopicWeight {
  topic: string;
  questions_count: number;
  approx_total_marks: number;
  importance_band: "S_TIER" | "A_TIER" | "B_TIER";
}

export interface ModuleMentorPriorityItem {
  band: "S_TIER" | "A_TIER" | "B_TIER";
  topic: string;
  reason: string;
}

export interface ModuleMentorData {
  module_overview: {
    summary: string;
    bullets: string[];
  };
  topic_tree?: {
    topic: string;
    short_summary: string;
    difficulty: "easy" | "medium" | "hard";
    coverage_from_slides: number;
    coverage_from_questions: number;
  }[];
  formulas: ModuleMentorFormula[];
  derivations: ModuleMentorDerivation[];
  question_weightage?: ModuleMentorTopicWeight[];
  priority: {
    priority_list: ModuleMentorPriorityItem[];
  };
  plan: string[];
  mistakes?: string[];
  practice_exercises?: {
    type: string;
    question: string;
    answer: string;
  }[];
}
