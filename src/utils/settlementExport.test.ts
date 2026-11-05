import { describe, it, expect } from 'vitest';
import { generateSettlementCsv, calculateSettlementTotal } from './settlementExport';
import { AdminSettlementRecord } from '../types';

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

  it('should include UTF-8 BOM at the beginning to prevent Excel Korean encoding corruption', () => {
    const csv = generateSettlementCsv(sampleRecords);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('should generate official administrative column headers with bank and account number', () => {
    const csv = generateSettlementCsv(sampleRecords);
    const lines = csv.split('\n');
    const headerLine = lines[0].replace('\uFEFF', '');
    expect(headerLine).toBe(
      '학번,이름,학과,역할,멘토링팀명,학기,회차(주차),활동일자,활동시간(h),참석여부,지급예정액/마일리지,입금은행,계좌번호,승인상태'
    );
  });

  it('should format data rows correctly with bank account numbers included', () => {
    const csv = generateSettlementCsv(sampleRecords);
    const lines = csv.split('\n');
    expect(lines.length).toBe(4);
    expect(lines[1]).toContain(
      '20241234,이명준,컴퓨터·인공지능공학부,멘토,PKNU 알고리즘 중급/실전,2026-1,4주차,2026-04-10,2시간,참석,30000원,부산은행,112-2104-5678-01,승인'
    );
  });

  it('should calculate total mentor scholarship payout and total mentee mileage based on 15,000 KRW rate', () => {
    const totals = calculateSettlementTotal(sampleRecords);
    expect(totals.totalMentorScholarship).toBe(60000); // 30,000 + 30,000
    expect(totals.totalMenteeMileage).toBe(10);
  });
});
