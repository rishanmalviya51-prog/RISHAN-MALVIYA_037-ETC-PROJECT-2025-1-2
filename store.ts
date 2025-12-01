
import { useState, useEffect } from 'react';
import { CycleData, Attachment, StudySession, PlannerState, DailyPlan, PlanTask } from './types';
import { INITIAL_DATA } from './data';

// Helper to save to local storage
const STORAGE_KEY = 'syllabus-tracker-v1';
const SESSIONS_KEY = 'syllabus-sessions-v1';
const PLANNER_KEY = 'syllabus-planner-v1';

export const useSyllabusStore = () => {
  const [data, setData] = useState<CycleData[]>(INITIAL_DATA);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [planner, setPlanner] = useState<PlannerState>({ dailyPlans: {} });
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hydrate from LS
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedSessions = localStorage.getItem(SESSIONS_KEY);
    const storedPlanner = localStorage.getItem(PLANNER_KEY);
    const access = localStorage.getItem('has_access');
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setData(parsed); 
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }

    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions);
        setSessions(parsedSessions);
      } catch (e) {
        console.error("Failed to parse stored sessions", e);
      }
    }

    if (storedPlanner) {
      try {
        const parsedPlanner = JSON.parse(storedPlanner);
        setPlanner(parsedPlanner);
      } catch (e) {
        console.error("Failed to parse stored planner", e);
      }
    }
    
    if (access === 'true') {
      setHasAccess(true);
    }
    setLoading(false);
  }, []);

  // Persist Data to LS
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loading]);

  // Persist Sessions to LS
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions, loading]);

  // Persist Planner to LS
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(PLANNER_KEY, JSON.stringify(planner));
    }
  }, [planner, loading]);

  const grantAccess = () => {
    setHasAccess(true);
    localStorage.setItem('has_access', 'true');
  };

  const revokeAccess = () => {
    setHasAccess(false);
    localStorage.removeItem('has_access');
  };

  // --- SYLLABUS ACTIONS ---

  const toggleSubtopic = (cycleId: string, subjectId: string, moduleId: string, subtopicId: string) => {
    setData(prev => prev.map(cycle => {
      if (cycle.id !== cycleId) return cycle;
      return {
        ...cycle,
        subjects: cycle.subjects.map(subj => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            modules: subj.modules.map(mod => {
              if (mod.id !== moduleId) return mod;
              return {
                ...mod,
                subtopics: mod.subtopics.map(topic => 
                  topic.id === subtopicId ? { ...topic, completed: !topic.completed } : topic
                )
              };
            })
          };
        })
      };
    }));
  };

  const addAttachment = (cycleId: string, subjectId: string, moduleId: string, file: File) => {
    const newAtt: Attachment = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
      objectUrl: URL.createObjectURL(file) 
    };

    setData(prev => prev.map(cycle => {
      if (cycle.id !== cycleId) return cycle;
      return {
        ...cycle,
        subjects: cycle.subjects.map(subj => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            modules: subj.modules.map(mod => {
              if (mod.id !== moduleId) return mod;
              return {
                ...mod,
                attachments: [...mod.attachments, newAtt]
              };
            })
          };
        })
      };
    }));
  };

  const removeAttachment = (cycleId: string, subjectId: string, moduleId: string, attachmentId: string) => {
    setData(prev => prev.map(cycle => {
      if (cycle.id !== cycleId) return cycle;
      return {
        ...cycle,
        subjects: cycle.subjects.map(subj => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            modules: subj.modules.map(mod => {
              if (mod.id !== moduleId) return mod;
              return {
                ...mod,
                attachments: mod.attachments.filter(a => a.id !== attachmentId)
              };
            })
          };
        })
      };
    }));
  };

  const addSubtopic = (cycleId: string, subjectId: string, moduleId: string, title: string) => {
    setData(prev => prev.map(cycle => {
      if (cycle.id !== cycleId) return cycle;
      return {
        ...cycle,
        subjects: cycle.subjects.map(subj => {
          if (subj.id !== subjectId) return subj;
          return {
            ...subj,
            modules: subj.modules.map(mod => {
              if (mod.id !== moduleId) return mod;
              return {
                ...mod,
                subtopics: [...mod.subtopics, { id: crypto.randomUUID(), title, completed: false }]
              };
            })
          };
        })
      };
    }));
  };

  // --- TIMER ACTIONS ---

  const addSession = (session: StudySession) => {
    setSessions(prev => [session, ...prev]);
  };

  // --- PLANNER ACTIONS ---

  const addTask = (date: string, title: string) => {
    setPlanner(prev => {
      const existingPlan = prev.dailyPlans[date] || { date, tasks: [] };
      const newTask: PlanTask = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        dailyPlans: {
          ...prev.dailyPlans,
          [date]: {
            ...existingPlan,
            tasks: [...existingPlan.tasks, newTask]
          }
        }
      };
    });
  };

  const toggleTask = (date: string, taskId: string) => {
    setPlanner(prev => {
      const existingPlan = prev.dailyPlans[date];
      if (!existingPlan) return prev;

      return {
        ...prev,
        dailyPlans: {
          ...prev.dailyPlans,
          [date]: {
            ...existingPlan,
            tasks: existingPlan.tasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
            )
          }
        }
      };
    });
  };

  const deleteTask = (date: string, taskId: string) => {
    setPlanner(prev => {
      const existingPlan = prev.dailyPlans[date];
      if (!existingPlan) return prev;

      return {
        ...prev,
        dailyPlans: {
          ...prev.dailyPlans,
          [date]: {
            ...existingPlan,
            tasks: existingPlan.tasks.filter(t => t.id !== taskId)
          }
        }
      };
    });
  };

  return {
    data,
    sessions,
    planner,
    hasAccess,
    loading,
    grantAccess,
    revokeAccess,
    toggleSubtopic,
    addAttachment,
    removeAttachment,
    addSubtopic,
    addSession,
    addTask,
    toggleTask,
    deleteTask
  };
};
