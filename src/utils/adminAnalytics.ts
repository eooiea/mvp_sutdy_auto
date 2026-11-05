import {
  MentoringProgram,
  WeeklyActivityLog,
  AdminSettlementRecord,
  StudentUserSummary,
  RecruitmentType,
} from '../types';

export interface FilterProgramsOptions {
  semester?: string;
  recruitmentType?: RecruitmentType | 'ALL';
  search?: string;
  status?: string;
}

export function filterPrograms(
  programs: MentoringProgram[],
  options: FilterProgramsOptions
): MentoringProgram[] {
  return programs.filter((p) => {
    if (options.semester && options.semester !== 'ALL' && p.semester !== options.semester) {
      return false;
    }
    if (
      options.recruitmentType &&
      options.recruitmentType !== 'ALL' &&
      p.recruitmentType !== options.recruitmentType
    ) {
      return false;
    }
    if (options.status && options.status !== 'ALL' && p.status !== options.status) {
      return false;
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.mentor.name.toLowerCase().includes(q) ||
        p.mentor.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function filterSettlementRecords(
  records: AdminSettlementRecord[],
  semesterFilter: string
): AdminSettlementRecord[] {
  if (!semesterFilter || semesterFilter === 'ALL') {
    return records;
  }
  return records.filter((r) => r.semester === semesterFilter);
}

// Dummy student bank accounts map for realism
const DUMMY_STUDENT_BANKS: Record<string, { bankName: string; accountNumber: string }> = {
  '20241001': { bankName: '부산은행', accountNumber: '112-2104-5678-01' },
  '20241002': { bankName: '국민은행', accountNumber: '942801-04-123456' },
  '20231003': { bankName: '신한은행', accountNumber: '110-345-678901' },
  '20241004': { bankName: '하나은행', accountNumber: '569-910012-34507' },
  '20241003': { bankName: '부산은행', accountNumber: '112-2200-9876-02' },
  '20241005': { bankName: '카카오뱅크', accountNumber: '3333-01-9876543' },
  '20251101': { bankName: '농협은행', accountNumber: '302-1234-5678-91' },
  '20251102': { bankName: '부산은행', accountNumber: '112-2055-1122-33' },
  '20251103': { bankName: '우리은행', accountNumber: '1002-123-456789' },
  '20261023': { bankName: '부산은행', accountNumber: '112-2300-4455-66' },
  '20251045': { bankName: '신한은행', accountNumber: '110-444-555666' },
  '20251333': { bankName: '국민은행', accountNumber: '942802-01-889900' },
  '20221401': { bankName: '국민은행', accountNumber: '921102-04-554433' },
  '20211508': { bankName: '부산은행', accountNumber: '112-2090-3344-01' },
  '20231209': { bankName: '신한은행', accountNumber: '110-443-887722' },
  '20231642': { bankName: '우리은행', accountNumber: '1002-841-239401' },
  '20231901': { bankName: '부산은행', accountNumber: '112-2098-7741-09' },
  '20232145': { bankName: '카카오뱅크', accountNumber: '3333-01-9876543' },
  '20231802': { bankName: '농협은행', accountNumber: '302-0012-4921-11' },
  '20241982': { bankName: '하나은행', accountNumber: '620-891023-45601' },
};

export function generateStudentSummaries(
  logs: WeeklyActivityLog[],
  programs: MentoringProgram[],
  semesterFilter: string = 'ALL',
  hourlyRate: number = 15000 // 기본 시급 15,000원 (사업단 표준 지침)
): StudentUserSummary[] {
  const filteredLogs =
    semesterFilter === 'ALL' ? logs : logs.filter((l) => l.semester === semesterFilter);

  const studentMap = new Map<
    string,
    {
      studentId: string;
      name: string;
      department: string;
      role: 'MENTOR' | 'MENTEE';
      mentoringTitle: string;
      semester: string;
      totalHours: number;
      attendedSessions: number;
      totalSessions: number;
      totalSettlement: number;
      bankName: string;
      accountNumber: string;
    }
  >();

  filteredLogs.forEach((log) => {
    const prog = programs.find((p) => p.id === log.mentoringId);
    const title = prog ? prog.title : '기타 멘토링';
    const dept = prog?.mentor.department || '참여학과';

    log.attendees.forEach((att) => {
      const key = `${att.studentId}-${log.mentoringId}`;
      const bankInfo = DUMMY_STUDENT_BANKS[att.studentId] || {
        bankName: '부산은행',
        accountNumber: `112-2104-${att.studentId.slice(-4)}-01`,
      };

      const existing = studentMap.get(key) || {
        studentId: att.studentId,
        name: att.name,
        department: dept,
        role: att.role,
        mentoringTitle: title,
        semester: log.semester,
        totalHours: 0,
        attendedSessions: 0,
        totalSessions: 0,
        totalSettlement: 0,
        bankName: bankInfo.bankName,
        accountNumber: bankInfo.accountNumber,
      };

      existing.totalSessions += 1;
      if (att.attended) {
        existing.attendedSessions += 1;
        existing.totalHours += log.durationHours;
        existing.totalSettlement += att.role === 'MENTOR' ? log.durationHours * hourlyRate : 10;
      }

      studentMap.set(key, existing);
    });
  });

  return Array.from(studentMap.values()).map((s) => ({
    ...s,
    attendanceRate:
      s.totalSessions > 0 ? Math.round((s.attendedSessions / s.totalSessions) * 100) : 0,
  }));
}

export function getStudentBankInfo(studentId: string, mentor?: MentoringProgram['mentor']): {
  bankName: string;
  accountNumber: string;
} {
  if (mentor && mentor.studentId === studentId && mentor.bankName && mentor.accountNumber) {
    return { bankName: mentor.bankName, accountNumber: mentor.accountNumber };
  }
  if (DUMMY_STUDENT_BANKS[studentId]) {
    return DUMMY_STUDENT_BANKS[studentId];
  }
  // Deterministic realistic dummy bank for demo so that no student ever has a blank account
  const banks = ['부산은행', '국민은행', '신한은행', '하나은행', '우리은행'];
  const bankIdx = parseInt(studentId.slice(-2) || '0', 10) % banks.length;
  return {
    bankName: banks[bankIdx],
    accountNumber: `112-${studentId.slice(0, 4)}-${studentId.slice(-4)}-01`,
  };
}

export function generateSettlementRecords(
  logs: WeeklyActivityLog[],
  programs: MentoringProgram[],
  hourlyRate: number = 15000
): AdminSettlementRecord[] {
  const records: AdminSettlementRecord[] = [];

  logs.forEach((log) => {
    const prog = programs.find((p) => p.id === log.mentoringId);
    const title = prog ? prog.title : '기타 멘토링';
    const sem = log.semester || prog?.semester || '2026-1';

    log.attendees.forEach((att) => {
      const bankInfo = getStudentBankInfo(att.studentId, prog?.mentor);
      const isMentor = att.role === 'MENTOR';
      const amount = isMentor
        ? (att.attended ? log.durationHours * hourlyRate : 0)
        : (att.attended ? 10 : 0);

      records.push({
        studentId: att.studentId,
        name: att.name,
        department:
          att.role === 'MENTOR'
            ? (prog?.mentor.department || '컴퓨터·인공지능공학부')
            : '참여학과',
        role: att.role,
        mentoringTitle: title,
        semester: sem,
        week: log.week,
        activityDate: log.activityDate,
        durationHours: log.durationHours,
        attended: att.attended,
        settlementAmount: amount,
        bankName: bankInfo.bankName,
        accountNumber: bankInfo.accountNumber,
        status: log.adminApproved ? 'APPROVED' : 'PENDING',
      });
    });
  });

  return records;
}

export interface StudentParticipationRecord {
  mentoringId: string;
  mentoringTitle: string;
  semester: string;
  role: 'MENTOR' | 'MENTEE';
  status: 'ACTIVE' | 'COMPLETED' | 'RECRUITING';
  totalWeeks: number;
  attendedWeeks: number;
  totalHours: number;
  logs: WeeklyActivityLog[];
}

export function getStudentParticipations(
  studentId: string,
  programs: MentoringProgram[],
  logs: WeeklyActivityLog[]
): StudentParticipationRecord[] {
  const result: StudentParticipationRecord[] = [];

  programs.forEach((prog) => {
    const isMentor =
      prog.mentor.studentId === studentId ||
      prog.coMentors?.some((c) => c.studentId === studentId);

    const progLogs = logs.filter((l) => l.mentoringId === prog.id);
    const myLogs = progLogs.filter((l) =>
      l.attendees.some((a) => a.studentId === studentId)
    );

    const isMentee = myLogs.some((l) =>
      l.attendees.some((a) => a.studentId === studentId && a.role === 'MENTEE')
    );

    if (isMentor || isMentee) {
      let attendedWeeks = 0;
      let totalHours = 0;

      progLogs.forEach((l) => {
        const att = l.attendees.find((a) => a.studentId === studentId);
        if (att && att.attended) {
          attendedWeeks += 1;
          totalHours += l.durationHours;
        }
      });

      result.push({
        mentoringId: prog.id,
        mentoringTitle: prog.title,
        semester: prog.semester,
        role: isMentor ? 'MENTOR' : 'MENTEE',
        status: prog.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
        totalWeeks: prog.totalWeeks,
        attendedWeeks,
        totalHours,
        logs: progLogs,
      });
    }
  });

  return result;
}
