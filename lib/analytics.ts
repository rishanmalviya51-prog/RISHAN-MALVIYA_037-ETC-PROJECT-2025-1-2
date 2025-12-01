
import { StudySession, Subject } from "../types";

// --- HELPERS ---

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const diffDays = (d1: Date, d2: Date) => {
  return Math.floor((d1.getTime() - d2.getTime()) / MS_PER_DAY);
};

const getUniqueDays = (sessions: StudySession[]) => {
  const days = new Set<string>();
  sessions.forEach(s => {
    days.add(new Date(s.startedAt).toDateString());
  });
  return days.size;
};

// =====================
// 1. CONSISTENCY SCORE
// =====================
// % of days studied in last 14 days
export const getConsistencyScore = (sessions: StudySession[]): number => {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * MS_PER_DAY);
  
  const recentSessions = sessions.filter(s => new Date(s.startedAt) >= twoWeeksAgo);
  const daysStudied = getUniqueDays(recentSessions);
  
  // Cap at 100%
  return Math.min(100, Math.round((daysStudied / 14) * 100));
};

// =====================
// 2. FOCUS QUALITY SCORE
// =====================
// Blend of Avg Session Length and Long Sessions (>25m)
export const getFocusQuality = (sessions: StudySession[]) => {
  if (sessions.length === 0) return { score: 0, rating: 'LOW', label: 'No Data' };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const avgDuration = totalMinutes / sessions.length;
  
  const longSessions = sessions.filter(s => s.durationMinutes >= 25).length;
  const longSessionRatio = longSessions / sessions.length;

  // Formula: 50% based on Avg Duration (target 45m), 50% based on Ratio (target 0.8)
  const durationScore = Math.min(100, (avgDuration / 45) * 100);
  const ratioScore = Math.min(100, (longSessionRatio / 0.8) * 100);
  
  const weightedScore = Math.round(durationScore * 0.6 + ratioScore * 0.4);

  let rating: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (weightedScore > 75) rating = 'HIGH';
  else if (weightedScore > 40) rating = 'MEDIUM';

  return { 
    score: weightedScore, 
    rating,
    label: rating === 'HIGH' ? 'Deep Work' : rating === 'MEDIUM' ? 'Balanced' : 'Fragmented'
  };
};

// =====================
// 3. EFFICIENCY INDEX
// =====================
// Completed topics per hour
export const getEfficiencyIndex = (sessions: StudySession[], subjects: Subject[]) => {
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  if (totalMinutes < 10) return 0; // Not enough data
  
  const totalHours = totalMinutes / 60;
  
  let completedTopics = 0;
  subjects.forEach(sub => {
    sub.modules.forEach(mod => {
      completedTopics += mod.subtopics.filter(t => t.completed).length;
    });
  });

  return parseFloat((completedTopics / totalHours).toFixed(1));
};

// =====================
// 4. MOMENTUM INDEX
// =====================
// Last 7 days mins vs Prev 7 days mins
export const getMomentumIndex = (sessions: StudySession[]) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * MS_PER_DAY);

  const currentPeriod = sessions.filter(s => {
    const d = new Date(s.startedAt);
    return d >= sevenDaysAgo && d <= now;
  });

  const prevPeriod = sessions.filter(s => {
    const d = new Date(s.startedAt);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const currMins = currentPeriod.reduce((acc, s) => acc + s.durationMinutes, 0);
  const prevMins = prevPeriod.reduce((acc, s) => acc + s.durationMinutes, 0);

  if (prevMins === 0) return { value: currMins > 0 ? 100 : 0, trend: 'stable' };

  const delta = ((currMins - prevMins) / prevMins) * 100;
  return {
    value: Math.round(Math.abs(delta)),
    trend: delta >= 0 ? 'up' : 'down'
  };
};

// =====================
// 5. BURN RISK DETECTOR
// =====================
export const getBurnRisk = (sessions: StudySession[]) => {
  const consistency = getConsistencyScore(sessions);
  const momentum = getMomentumIndex(sessions);
  
  // Logic: High consistency dropping fast
  if (consistency < 30 && momentum.trend === 'down' && momentum.value > 50) {
    return { status: 'RISK', reason: 'Crash Detected' };
  }
  
  if (momentum.trend === 'down' && momentum.value > 25) {
    return { status: 'WARNING', reason: 'Slowing Down' };
  }

  // Check for 0 days in last 3 days
  const now = new Date();
  const last3Days = sessions.filter(s => diffDays(now, new Date(s.startedAt)) <= 3);
  if (consistency > 80 && last3Days.length === 0) {
     return { status: 'WARNING', reason: 'Sudden Stop' };
  }

  return { status: 'SAFE', reason: 'Steady Pace' };
};

// =====================
// 6. WEAK MODULE DETECTOR
// =====================
// TimeSpent > Average BUT Completion < Average
export const getWeakModules = (sessions: StudySession[], subjects: Subject[]) => {
  // Map module IDs to minutes
  const moduleTime: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.moduleId) {
      moduleTime[s.moduleId] = (moduleTime[s.moduleId] || 0) + s.durationMinutes;
    }
  });

  const modulesData: { id: string, name: string, time: number, progress: number }[] = [];
  
  subjects.forEach(sub => {
    sub.modules.forEach(mod => {
      const time = moduleTime[mod.id] || 0;
      const total = mod.subtopics.length;
      const done = mod.subtopics.filter(t => t.completed).length;
      const progress = total > 0 ? done / total : 0;
      
      if (time > 0) {
          modulesData.push({ id: mod.id, name: mod.title, time, progress });
      }
    });
  });

  if (modulesData.length < 2) return [];

  const avgTime = modulesData.reduce((a, b) => a + b.time, 0) / modulesData.length;
  const avgProgress = modulesData.reduce((a, b) => a + b.progress, 0) / modulesData.length;

  return modulesData
    .filter(m => m.time > avgTime * 1.1 && m.progress < avgProgress * 0.9)
    .map(m => m.name);
};

// =====================
// 7. TOPIC REVISIT RATE
// =====================
// Topics studied > once / Total topics studied
export const getTopicRevisitRate = (sessions: StudySession[]) => {
  const topicCounts: Record<string, number> = {};
  
  sessions.forEach(s => {
    if (s.topicId) {
      topicCounts[s.topicId] = (topicCounts[s.topicId] || 0) + 1;
    }
  });

  const topics = Object.keys(topicCounts);
  if (topics.length === 0) return 0;

  const revisited = topics.filter(t => topicCounts[t] > 1).length;
  return Math.round((revisited / topics.length) * 100);
};

// =====================
// 8. BALANCE SCORE
// =====================
// Variance of time across subjects (Low variance = High Score)
export const getBalanceScore = (sessions: StudySession[], subjects: Subject[]) => {
  const subjectTime: Record<string, number> = {};
  subjects.forEach(s => subjectTime[s.id] = 0);

  sessions.forEach(s => {
    const sid = s.subjectId;
    if (sid && subjectTime[sid] !== undefined) {
      subjectTime[sid] += s.durationMinutes;
    }
  });

  const times = Object.values(subjectTime);
  const max = Math.max(...times, 1);
  const min = Math.min(...times);
  
  // Simple Spread Ratio: Min / Max
  // 1.0 = Perfectly balanced, 0.0 = Imbalanced
  const balance = min / max;
  
  return Math.round(balance * 100);
};

// =====================
// 9. KNOWLEDGE CONFIDENCE
// =====================
// Blend: Completion + Revisit + Avg Session
export const getConfidenceScore = (sessions: StudySession[], subjects: Subject[]) => {
  let totalTopics = 0;
  let completedTopics = 0;
  
  subjects.forEach(s => {
    s.modules.forEach(m => {
      totalTopics += m.subtopics.length;
      completedTopics += m.subtopics.filter(t => t.completed).length;
    });
  });

  const completionPct = totalTopics === 0 ? 0 : (completedTopics / totalTopics) * 100;
  const focus = getFocusQuality(sessions).score;
  const revisit = getTopicRevisitRate(sessions);

  // Weighted Formula
  return Math.round((completionPct * 0.5) + (focus * 0.3) + (revisit * 0.2));
};

// =====================
// 10. SYLLABUS PREDICTION
// =====================
export const getSyllabusPrediction = (sessions: StudySession[], subjects: Subject[]) => {
  let totalTopics = 0;
  let completedTopics = 0;
  subjects.forEach(s => s.modules.forEach(m => {
    totalTopics += m.subtopics.length;
    completedTopics += m.subtopics.filter(t => t.completed).length;
  }));

  const remaining = totalTopics - completedTopics;
  if (remaining <= 0) return { daysLeft: 0, completionDate: new Date() };
  if (completedTopics === 0) return { daysLeft: 999, completionDate: null };

  // Calculate rate (topics per day since start)
  const sorted = [...sessions].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  if (sorted.length === 0) return { daysLeft: 999, completionDate: null };

  const firstDate = new Date(sorted[0].startedAt);
  const daysActive = Math.max(1, diffDays(new Date(), firstDate));
  
  const rate = completedTopics / daysActive; // topics per day
  const daysLeft = Math.ceil(remaining / rate);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysLeft);

  return { daysLeft, completionDate };
};

// =====================
// 11. TIME INTELLIGENCE
// =====================
export const getPeakStudyTime = (sessions: StudySession[]): string => {
  if (sessions.length === 0) return "N/A";
  
  const hourBuckets = new Array(24).fill(0);
  
  sessions.forEach(s => {
    const h = new Date(s.startedAt).getHours();
    hourBuckets[h] += s.durationMinutes;
  });

  const maxIdx = hourBuckets.indexOf(Math.max(...hourBuckets));
  
  if (maxIdx >= 5 && maxIdx < 12) return "Morning 🌅";
  if (maxIdx >= 12 && maxIdx < 17) return "Afternoon ☀️";
  if (maxIdx >= 17 && maxIdx < 22) return "Evening 🌇";
  return "Late Night 🦉";
};

// =====================
// 12. GRAPH LOGIC HELPER
// =====================
export const getWeekdayData = (sessions: StudySession[]) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals = Array(7).fill(0);

  sessions.forEach(s => {
    const d = new Date(s.startedAt);
    totals[d.getDay()] += s.durationMinutes;
  });

  // Reorder to Mon-Sun
  const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const orderedTotals = [totals[1], totals[2], totals[3], totals[4], totals[5], totals[6], totals[0]];

  const maxVal = Math.max(...orderedTotals, 60);
  return { days: orderedDays, totals: orderedTotals, maxVal };
};
