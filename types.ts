
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
