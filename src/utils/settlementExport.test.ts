import { describe, it, expect } from 'vitest';
import {
  generateSettlementCsv,
  generateStudentSummaryCsv,
  generateMenteeMileageCsv,
  generateMentorDisbursementCsv,
  calculateSettlementTotal,
} from './settlementExport';
import { AdminSettlementRecord, StudentUserSummary } from '../types';

describe('Settlement CSV Export (TDD Red -> Green)', () => {
  const sampleRecords: AdminSettlementRecord[] = [
    {
      studentId: '20241234',
      name: '이명준',
      department: '컴퓨터·인공지능공학부',
      role: 'MENTOR',
      mentoringTitle: 'PKNU 알고리즘 중급/실전',
      semester: '2026-1',
      week: 4,
      activityDate: '2026-04-10',
      durationHours: 2,
      attended: true,
      settlementAmount: 30000, // 15,000 KRW * 2h (사업단 표준 지침)
      bankName: '부산은행',
      accountNumber: '112-2104-5678-01',
      status: 'APPROVED',
    },
    {
      studentId: '20255678',
      name: '하승민',
      department: '컴퓨터공학과',
      role: 'MENTOR',
      mentoringTitle: '1학년 알고리즘 기초 멘토링 (NAN)',
      semester: '2025-1',
      week: 2,
      activityDate: '2025-03-24',
      durationHours: 2,
      attended: true,
      settlementAmount: 30000, // 15,000 KRW * 2h
      bankName: '국민은행',
      accountNumber: '942801-04-123456',
      status: 'APPROVED',
    },
    {
      studentId: '20269999',
      name: '김멘티',
      department: '인공지능공학과',
      role: 'MENTEE',
      mentoringTitle: '1학년 알고리즘 기초 멘토링 (NAN)',
      semester: '2025-1',
      week: 2,
      activityDate: '2025-03-24',
      durationHours: 2,
      attended: true,
      settlementAmount: 10, // 10 마일리지
      bankName: '부산은행',
      accountNumber: '112-2200-9876-02',
      status: 'APPROVED',
    },
  ];

  const sampleSummaries: StudentUserSummary[] = [
    {
      studentId: '20241234',
      name: '이명준',
      department: '컴퓨터·인공지능공학부',
      role: 'MENTOR',
      mentoringTitle: 'PKNU 알고리즘 중급/실전',
      semester: '2026-1',
      totalHours: 8,
      attendedSessions: 4,
      totalSessions: 4,
      attendanceRate: 100,
      totalSettlement: 120000,
      bankName: '부산은행',
      accountNumber: '112-2104-5678-01',
    },
    {
      studentId: '20269999',
      name: '김멘티',
      department: '인공지능공학과',
      role: 'MENTEE',
      mentoringTitle: '1학년 알고리즘 기초 멘토링 (NAN)',
      semester: '2025-1',
      totalHours: 4,
      attendedSessions: 2,
      totalSessions: 2,
      attendanceRate: 100,
      totalSettlement: 20,
      bankName: '국민은행',
      accountNumber: '942801-04-123456',
    },
  ];

  it('should include UTF-8 BOM at the beginning to prevent Excel Korean encoding corruption', () => {
    const csv = generateSettlementCsv(sampleRecords);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('should generate official administrative column headers with pure number label indicators and without bank/account info', () => {
    const csv = generateSettlementCsv(sampleRecords);
    const lines = csv.split('\n');
    const headerLine = lines[0].replace('\uFEFF', '');
    expect(headerLine).toBe(
      '학번,이름,학과,역할,멘토링팀명,학기,회차(주차),활동일자,활동시간(h),참석여부,지급예정액(원)/마일리지(P),승인상태'
    );
  });

  it('should format data rows correctly with pure numbers for duration and amount and without bank info', () => {
    const csv = generateSettlementCsv(sampleRecords);
    const lines = csv.split('\n');
    expect(lines.length).toBe(4);
    // Notice: pure numbers '2' and '30000' and no bank/account numbers
    expect(lines[1]).toBe(
      '20241234,이명준,컴퓨터·인공지능공학부,멘토,PKNU 알고리즘 중급/실전,2026-1,4주차,2026-04-10,2,참석,30000,승인'
    );
    expect(lines[1]).not.toContain('은행');
  });

  it('should calculate total mentor scholarship payout and total mentee mileage based on 15,000 KRW rate', () => {
    const totals = calculateSettlementTotal(sampleRecords);
    expect(totals.totalMentorScholarship).toBe(60000); // 30,000 + 30,000
    expect(totals.totalMenteeMileage).toBe(10);
  });

  it('should generate student summary CSV (1 row per student) with pure numbers and without bank info for privacy protection', () => {
    const csv = generateStudentSummaryCsv(sampleSummaries);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    const lines = csv.split('\n');
    expect(lines[0].replace('\uFEFF', '')).toBe(
      '학번,이름,학과,역할,멘토링팀명,학기,총회차,출석회차,출석률(%),총인정시간(h),지급총액(원)/마일리지(P),정산적격여부'
    );
    expect(lines.length).toBe(3);
    // Row 1: 1 student 1 row, pure numbers for calculation, no bank/account numbers
    expect(lines[1]).toBe(
      '20241234,이명준,컴퓨터·인공지능공학부,멘토,PKNU 알고리즘 중급/실전,2026-1,4,4,100,8,120000,지급적격'
    );
    expect(lines[1]).not.toContain('은행');
  });

  it('should generate mentee mileage CSV without bank and account numbers for Education Innovation Institute', () => {
    const mentees = sampleSummaries.filter((s) => s.role === 'MENTEE');
    const csv = generateMenteeMileageCsv(mentees);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    const lines = csv.split('\n');
    expect(lines[0].replace('\uFEFF', '')).toBe(
      '학번,이름,학과,소속멘토링프로그램,학기,총회차,출석회차,출석률(%),총학습시간(h),혁신원마일리지(P),수료여부'
    );
    // Mentee row must NOT contain any bank name or account number
    expect(lines[1]).toBe(
      '20269999,김멘티,인공지능공학과,1학년 알고리즘 기초 멘토링 (NAN),2025-1,2,2,100,4,20,수료'
    );
    expect(lines[1]).not.toContain('은행');
    expect(lines[1]).not.toContain('123456');
  });

  it('should generate mentor disbursement CSV with amounts and without bank info for privacy safety', () => {
    const mentors = sampleSummaries.filter((s) => s.role === 'MENTOR');
    const csv = generateMentorDisbursementCsv(mentors);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    const lines = csv.split('\n');
    expect(lines[0].replace('\uFEFF', '')).toBe(
      '학번,이름,학과,담당멘토링프로그램,학기,진행회차,인정활동시간(h),지급총액(원),지급적격여부'
    );
    expect(lines[1]).toBe(
      '20241234,이명준,컴퓨터·인공지능공학부,PKNU 알고리즘 중급/실전,2026-1,4,8,120000,지급적격'
    );
    expect(lines[1]).not.toContain('은행');
  });
});
