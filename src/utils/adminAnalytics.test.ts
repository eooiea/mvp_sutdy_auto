import { describe, it, expect } from 'vitest';
import {
  generateStudentSummaries,
  filterSettlementRecords,
  filterPrograms,
  getStudentParticipations,
  generateSettlementRecords,
} from './adminAnalytics';
import { WeeklyActivityLog, MentoringProgram, AdminSettlementRecord } from '../types';

describe('Admin Analytics & Multi-view Utilities (TDD Red -> Green)', () => {
  const dummyPrograms: MentoringProgram[] = [
    {
      id: 'p-2026-algo',
      title: 'PKNU 알고리즘 멘토링',
      subtitle: '알고리즘',
      category: 'MAJOR_STUDY',
      status: 'ACTIVE',
      semester: '2026-1',
      recruitmentType: 'REGULAR',
      mentor: {
        id: 'm1',
        name: '이명준',
        studentId: '20241001',
        department: '컴퓨터·인공지능공학부',
        grade: 3,
        expertise: ['C++'],
        bio: '',
      },
      targetAudience: '2~4학년',
      capacity: 6,
      currentEnrolled: 5,
      period: '2026.03 ~ 2026.06',
      meetingSchedule: '매주 화, 목',
      location: '공학1관 314호',
      curriculum: [],
      tags: ['C++'],
      coverGradient: 'bg-slate-900',
      totalWeeks: 10,
    },
    {
      id: 'p-2025-nan',
      title: 'NAN 기초 멘토링',
      subtitle: '기초',
      category: 'FRESHMAN_BASIC',
      status: 'RECRUITING',
      semester: '2025-1',
      recruitmentType: 'ADDITIONAL',
      mentor: {
        id: 'm2',
        name: '하승민',
        studentId: '20241002',
        department: '컴퓨터·인공지능공학부',
        grade: 3,
        expertise: ['C언어'],
        bio: '',
      },
      targetAudience: '1학년',
      capacity: 5,
      currentEnrolled: 3,
      period: '2025.03 ~ 2025.05',
      meetingSchedule: '매주 목',
      location: '미래관 402호',
      curriculum: [],
      tags: ['기초'],
      coverGradient: 'bg-slate-900',
      totalWeeks: 4,
    },
  ];

  const dummyLogs: WeeklyActivityLog[] = [
    {
      id: 'l1',
      mentoringId: 'p-2026-algo',
      semester: '2026-1',
      week: 1,
      activityDate: '2026-03-05',
      durationHours: 2,
      topic: 'Introduction',
      summary3Lines: ['1', '2', '3'],
      attendees: [
        { studentId: '20241001', name: '이명준', role: 'MENTOR', attended: true },
        { studentId: '20269999', name: '김멘티', role: 'MENTEE', attended: true },
        { studentId: '20268888', name: '박멘티', role: 'MENTEE', attended: false },
      ],
      photoUrls: ['url1'],
      submittedAt: '2026-03-05',
      adminApproved: true,
    },
    {
      id: 'l2',
      mentoringId: 'p-2026-algo',
      semester: '2026-1',
      week: 2,
      activityDate: '2026-03-12',
      durationHours: 2,
      topic: 'Data Structure',
      summary3Lines: ['1', '2', '3'],
      attendees: [
        { studentId: '20241001', name: '이명준', role: 'MENTOR', attended: true },
        { studentId: '20269999', name: '김멘티', role: 'MENTEE', attended: true },
        { studentId: '20268888', name: '박멘티', role: 'MENTEE', attended: true },
      ],
      photoUrls: ['url2'],
      submittedAt: '2026-03-12',
      adminApproved: true,
    },
  ];

  it('filters programs by semester and recruitment type (regular vs additional)', () => {
    const sem2026 = filterPrograms(dummyPrograms, { semester: '2026-1' });
    expect(sem2026.length).toBe(1);
    expect(sem2026[0].id).toBe('p-2026-algo');

    const additionalOnly = filterPrograms(dummyPrograms, { recruitmentType: 'ADDITIONAL' });
    expect(additionalOnly.length).toBe(1);
    expect(additionalOnly[0].id).toBe('p-2025-nan');
  });

  it('aggregates student user summaries accurately with attendance rates and total hours', () => {
    const summaries = generateStudentSummaries(dummyLogs, dummyPrograms, '2026-1');
    expect(summaries.length).toBe(3); // 이명준, 김멘티, 박멘티

    const mj = summaries.find((s) => s.studentId === '20241001');
    expect(mj).toBeDefined();
    expect(mj?.totalHours).toBe(4); // 2h * 2
    expect(mj?.attendanceRate).toBe(100);
    expect(mj?.totalSettlement).toBe(60000); // 4h * 15,000 KRW
    expect(mj?.bankName).toBeDefined();
    expect(mj?.accountNumber).toBeDefined();

    const park = summaries.find((s) => s.studentId === '20268888');
    expect(park).toBeDefined();
    expect(park?.attendedSessions).toBe(1);
    expect(park?.totalSessions).toBe(2);
    expect(park?.attendanceRate).toBe(50);
  });

  it('filters settlement records by semester', () => {
    const dummyRecords: AdminSettlementRecord[] = [
      {
        studentId: '20241001',
        name: '이명준',
        department: '컴공',
        role: 'MENTOR',
        mentoringTitle: '알고',
        semester: '2026-1',
        week: 1,
        activityDate: '2026-03-05',
        durationHours: 2,
        attended: true,
        settlementAmount: 30000,
        bankName: '부산은행',
        accountNumber: '112-2104-5678-01',
        status: 'APPROVED',
      },
      {
        studentId: '20241002',
        name: '하승민',
        department: '컴공',
        role: 'MENTOR',
        mentoringTitle: 'NAN',
        semester: '2025-1',
        week: 1,
        activityDate: '2025-03-20',
        durationHours: 2,
        attended: true,
        settlementAmount: 30000,
        bankName: '국민은행',
        accountNumber: '942801-04-123456',
        status: 'APPROVED',
      },
    ];

    const filtered = filterSettlementRecords(dummyRecords, '2026-1');
    expect(filtered.length).toBe(1);
    expect(filtered[0].studentId).toBe('20241001');

    const all = filterSettlementRecords(dummyRecords, 'ALL');
    expect(all.length).toBe(2);
  });

  it('retrieves student personal participation history distinguishing MENTOR vs MENTEE', () => {
    // 이명준 (멘토)
    const mentorParts = getStudentParticipations('20241001', dummyPrograms, dummyLogs);
    expect(mentorParts.length).toBe(1);
    expect(mentorParts[0].role).toBe('MENTOR');
    expect(mentorParts[0].totalHours).toBe(4);
    expect(mentorParts[0].attendedWeeks).toBe(2);

    // 김멘티 (멘티)
    const menteeParts = getStudentParticipations('20269999', dummyPrograms, dummyLogs);
    expect(menteeParts.length).toBe(1);
    expect(menteeParts[0].role).toBe('MENTEE');
  });

  it('generates settlement records with default 15000 KRW hourly rate, bank accounts, and supports variable rate', () => {
    // Default 15,000 KRW
    const records = generateSettlementRecords(dummyLogs, dummyPrograms, 15000);
    expect(records.length).toBeGreaterThan(0);
    const mentorRecord = records.find((r) => r.role === 'MENTOR' && r.studentId === '20241001');
    expect(mentorRecord).toBeDefined();
    expect(mentorRecord?.settlementAmount).toBe(30000); // 2 hours * 15,000
    expect(mentorRecord?.bankName).toBe('부산은행');
    expect(mentorRecord?.accountNumber).toBe('112-2104-5678-01');

    // Variable rate 18,000 KRW
    const records18k = generateSettlementRecords(dummyLogs, dummyPrograms, 18000);
    const mentorRecord18k = records18k.find((r) => r.role === 'MENTOR' && r.studentId === '20241001');
    expect(mentorRecord18k?.settlementAmount).toBe(36000); // 2 hours * 18,000

    // Mentee gets 10 mileage points and has bank info populated
    const menteeRecord = records.find((r) => r.role === 'MENTEE');
    expect(menteeRecord?.settlementAmount).toBe(10);
    expect(menteeRecord?.bankName).toBeDefined();
  });

  it('correctly filters completed mentoring programs across multiple past semesters (2025-1, 2025-2)', () => {
    const multiSemesterPrograms: MentoringProgram[] = [
      ...dummyPrograms,
      {
        id: 'p-2025-bigdata',
        title: '빅데이터 R 실무',
        subtitle: '공공데이터',
        category: 'MAJOR_STUDY',
        status: 'COMPLETED',
        semester: '2025-2',
        recruitmentType: 'REGULAR',
        mentor: {
          id: 'm-data1',
          name: '박세진',
          studentId: '20221401',
          department: '통계·데이터사이언스전공',
          grade: 4,
          expertise: ['R', 'Python'],
          bio: '',
          bankName: '국민은행',
          accountNumber: '921102-04-554433',
        },
        targetAudience: '전공생',
        capacity: 5,
        currentEnrolled: 5,
        period: '2025.09 ~ 2025.12',
        meetingSchedule: '매주 수',
        location: '자연관 201호',
        curriculum: [],
        tags: ['R', '빅데이터'],
        coverGradient: 'bg-slate-900',
        totalWeeks: 4,
      },
    ];

    const completed2025_2 = filterPrograms(multiSemesterPrograms, {
      semester: '2025-2',
      status: 'COMPLETED',
    });
    expect(completed2025_2.length).toBe(1);
    expect(completed2025_2[0].id).toBe('p-2025-bigdata');

    const allCompleted = filterPrograms(multiSemesterPrograms, {
      status: 'COMPLETED',
    });
    expect(allCompleted.length).toBe(1);
  });
});

