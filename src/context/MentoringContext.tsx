import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MentoringProgram,
  MenteeApplication,
  WeeklyActivityLog,
  AdminSettlementRecord,
  CategoryType,
  RecruitmentType,
} from '../types';
import {
  INITIAL_PROGRAMS,
  INITIAL_APPLICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import { updateApplicationStatus } from '../utils/statusTransition';
import { generateSettlementRecords } from '../utils/adminAnalytics';

interface MentoringContextType {
  programs: MentoringProgram[];
  applications: MenteeApplication[];
  activityLogs: WeeklyActivityLog[];
  currentRole: 'STUDENT' | 'ADMIN';
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  setCurrentRole: (role: 'STUDENT' | 'ADMIN') => void;
  toggleRole: () => void;
  toggleRecruitmentType: (programId: string) => void;
  applyMentoring: (
    mentoringId: string,
    data: {
      applicantName: string;
      studentId: string;
      department: string;
      grade: number;
      phone: string;
      email: string;
      motivation: string;
    }
  ) => void;
  approveApplication: (applicationId: string) => void;
  rejectApplication: (applicationId: string) => void;
  submitActivityLog: (
    mentoringId: string,
    log: Omit<WeeklyActivityLog, 'id' | 'mentoringId' | 'submittedAt' | 'adminApproved'>
  ) => void;
  resetToInitialData: () => void;
  getSettlementRecords: () => AdminSettlementRecord[];
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
}

const MentoringContext = createContext<MentoringContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROGRAMS: 'swic_mentoring_programs_v9',
  APPLICATIONS: 'swic_mentoring_applications_v9',
  LOGS: 'swic_mentoring_logs_v9',
  ROLE: 'swic_mentoring_role_v9',
  HOURLY_RATE: 'swic_mentoring_rate_v9',
};

export const MentoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [programs, setPrograms] = useState<MentoringProgram[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });

  const [applications, setApplications] = useState<MenteeApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<WeeklyActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [currentRole, setCurrentRole] = useState<'STUDENT' | 'ADMIN'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as 'STUDENT' | 'ADMIN') || 'STUDENT';
  });

  const [hourlyRate, setHourlyRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOURLY_RATE);
    return saved ? parseInt(saved, 10) : 15000;
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOURLY_RATE, hourlyRate.toString());
  }, [hourlyRate]);

  const toggleRole = () => {
    setCurrentRole((prev) => (prev === 'STUDENT' ? 'ADMIN' : 'STUDENT'));
  };

  const toggleRecruitmentType = (programId: string) => {
    setPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id !== programId) return prog;
        const nextType: RecruitmentType =
          prog.recruitmentType === 'REGULAR' ? 'ADDITIONAL' : 'REGULAR';
        return {
          ...prog,
          recruitmentType: nextType,
          status: 'RECRUITING',
        };
      })
    );
  };

  const applyMentoring = (
    mentoringId: string,
    data: {
      applicantName: string;
      studentId: string;
      department: string;
      grade: number;
      phone: string;
      email: string;
      motivation: string;
    }
  ) => {
    const prog = programs.find((p) => p.id === mentoringId);
    const sem = prog?.semester || '2026-1';

    const newApp: MenteeApplication = {
      id: `app-${Date.now()}`,
      mentoringId,
      ...data,
      status: 'PENDING',
      appliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      semester: sem,
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const approveApplication = (applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const targetProgram = programs.find((p) => p.id === targetApp.mentoringId);
    if (!targetProgram) return;

    const { updatedProgram, updatedApplication } = updateApplicationStatus(
      targetProgram,
      targetApp,
      'APPROVED'
    );

    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? updatedApplication : app))
    );
    setPrograms((prev) =>
      prev.map((prog) => (prog.id === targetProgram.id ? updatedProgram : prog))
    );
  };

  const rejectApplication = (applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const targetProgram = programs.find((p) => p.id === targetApp.mentoringId);
    if (!targetProgram) return;

    const { updatedProgram, updatedApplication } = updateApplicationStatus(
      targetProgram,
      targetApp,
      'REJECTED'
    );

    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? updatedApplication : app))
    );
    setPrograms((prev) =>
      prev.map((prog) => (prog.id === targetProgram.id ? updatedProgram : prog))
    );
  };

  const submitActivityLog = (
    mentoringId: string,
    logInput: Omit<WeeklyActivityLog, 'id' | 'mentoringId' | 'submittedAt' | 'adminApproved'>
  ) => {
    const prog = programs.find((p) => p.id === mentoringId);
    const sem = prog?.semester || '2026-1';

    const newLog: WeeklyActivityLog = {
      id: `log-${Date.now()}`,
      mentoringId,
      ...logInput,
      semester: sem,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      adminApproved: true,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const resetToInitialData = () => {
    setPrograms(INITIAL_PROGRAMS);
    setApplications(INITIAL_APPLICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setHourlyRate(15000);
    localStorage.removeItem(STORAGE_KEYS.PROGRAMS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.HOURLY_RATE);
  };

  const getSettlementRecords = (): AdminSettlementRecord[] => {
    return generateSettlementRecords(activityLogs, programs, hourlyRate);
  };

  return (
    <MentoringContext.Provider
      value={{
        programs,
        applications,
        activityLogs,
        currentRole,
        selectedCategory,
        setSelectedCategory,
        searchKeyword,
        setSearchKeyword,
        setCurrentRole,
        toggleRole,
        toggleRecruitmentType,
        applyMentoring,
        approveApplication,
        rejectApplication,
        submitActivityLog,
        resetToInitialData,
        getSettlementRecords,
        hourlyRate,
        setHourlyRate,
      }}
    >
      {children}
    </MentoringContext.Provider>
  );
};

export const useMentoring = () => {
  const context = useContext(MentoringContext);
  if (!context) {
    throw new Error('useMentoring must be used within a MentoringProvider');
  }
  return context;
};
