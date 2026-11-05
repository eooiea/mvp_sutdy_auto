import { AdminSettlementRecord, StudentUserSummary } from '../types';

/**
 * Escapes CSV special characters and quotes
 */
const escapeCsv = (str: string | number) => {
  const val = String(str);
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

/**
 * Generates official administrative CSV string formatted with UTF-8 BOM
 * for direct, uncorrupted opening in Korean Microsoft Excel.
 * Format 1: Audit Detail CSV (주차별 감사 증빙 상세 내역)
 * Contains pure numeric values for duration and amount to enable immediate Excel =SUM() calculations.
 */
export function generateSettlementCsv(records: AdminSettlementRecord[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '학번',
    '이름',
    '학과',
    '역할',
    '멘토링팀명',
    '학기',
    '회차(주차)',
    '활동일자',
    '활동시간(h)',
    '참석여부',
    '지급예정액(원)/마일리지(P)',
    '입금은행',
    '계좌번호',
    '승인상태',
  ];

  const rows = records.map((r) => [
    escapeCsv(r.studentId),
    escapeCsv(r.name),
    escapeCsv(r.department),
    escapeCsv(r.role === 'MENTOR' ? '멘토' : '멘티'),
    escapeCsv(r.mentoringTitle),
    escapeCsv(r.semester || '2026-1'),
    escapeCsv(`${r.week}주차`),
    escapeCsv(r.activityDate),
    escapeCsv(r.durationHours), // Pure number for Excel =SUM()
    escapeCsv(r.attended ? '참석' : '결석'),
    escapeCsv(r.settlementAmount), // Pure number for Excel =SUM()
    escapeCsv(r.role === 'MENTOR' ? (r.bankName || '부산은행') : '-'),
    escapeCsv(r.role === 'MENTOR' ? (r.accountNumber || '112-2104-5678-01') : '-'),
    escapeCsv(r.status === 'APPROVED' ? '승인' : '대기'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return BOM + csvContent;
}

/**
 * Generates student-level aggregated summary CSV (회계 품의 및 은행 펌뱅킹 이체용 학생별 총괄표)
 * Format 2: 1 student per row, aggregated hours and payout, bank account, pure numbers for direct KORUS/Excel processing.
 */
export function generateStudentSummaryCsv(summaries: StudentUserSummary[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '학번',
    '이름',
    '학과',
    '역할',
    '멘토링팀명',
    '학기',
    '총회차',
    '출석회차',
    '출석률(%)',
    '총인정시간(h)',
    '지급총액(원)/마일리지(P)',
    '입금은행',
    '계좌번호',
    '정산적격여부',
  ];

  const rows = summaries.map((s) => [
    escapeCsv(s.studentId),
    escapeCsv(s.name),
    escapeCsv(s.department),
    escapeCsv(s.role === 'MENTOR' ? '멘토' : '멘티'),
    escapeCsv(s.mentoringTitle),
    escapeCsv(s.semester || '2026-1'),
    escapeCsv(s.totalSessions),
    escapeCsv(s.attendedSessions),
    escapeCsv(s.attendanceRate),
    escapeCsv(s.totalHours), // Pure number for Excel =SUM()
    escapeCsv(s.totalSettlement), // Pure number for Excel =SUM()
    escapeCsv(s.role === 'MENTOR' ? (s.bankName || '부산은행') : '-'),
    escapeCsv(s.role === 'MENTOR' ? (s.accountNumber || '112-2104-5678-01') : '-'),
    escapeCsv(s.attendedSessions > 0 ? '지급적격' : '미달'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return BOM + csvContent;
}

/**
 * Generates mentee mileage registration CSV for Education Innovation Institute (교육혁신원 비교과 마일리지)
 * Strips out unnecessary financial information (bank name, account number).
 * Contains pure numeric values for learning hours and mileage points.
 */
export function generateMenteeMileageCsv(mentees: StudentUserSummary[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '학번',
    '이름',
    '학과',
    '소속멘토링프로그램',
    '학기',
    '총회차',
    '출석회차',
    '출석률(%)',
    '총학습시간(h)',
    '혁신원마일리지(P)',
    '수료여부',
  ];

  const rows = mentees.map((m) => [
    escapeCsv(m.studentId),
    escapeCsv(m.name),
    escapeCsv(m.department),
    escapeCsv(m.mentoringTitle),
    escapeCsv(m.semester || '2026-1'),
    escapeCsv(m.totalSessions),
    escapeCsv(m.attendedSessions),
    escapeCsv(m.attendanceRate),
    escapeCsv(m.totalHours), // Pure number for Excel
    escapeCsv(m.totalSettlement), // Pure number for Mileage points
    escapeCsv(m.attendanceRate >= 80 ? '수료' : '미달'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return BOM + csvContent;
}

/**
 * Generates mentor disbursement summary CSV for university financial accounting (KORUS 회계 품의 및 펌뱅킹 이체용)
 * Includes bank name and account number for cash stipend deposit with pure numbers.
 */
export function generateMentorDisbursementCsv(mentors: StudentUserSummary[]): string {
  const BOM = '\uFEFF';
  const headers = [
    '학번',
    '이름',
    '학과',
    '담당멘토링프로그램',
    '학기',
    '진행회차',
    '인정활동시간(h)',
    '지급총액(원)',
    '입금은행',
    '계좌번호',
    '지급적격여부',
  ];

  const rows = mentors.map((m) => [
    escapeCsv(m.studentId),
    escapeCsv(m.name),
    escapeCsv(m.department),
    escapeCsv(m.mentoringTitle),
    escapeCsv(m.semester || '2026-1'),
    escapeCsv(m.attendedSessions),
    escapeCsv(m.totalHours), // Pure number
    escapeCsv(m.totalSettlement), // Pure number
    escapeCsv(m.bankName || '부산은행'),
    escapeCsv(m.accountNumber || '112-2104-5678-01'),
    escapeCsv(m.attendedSessions > 0 ? '지급적격' : '미달'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return BOM + csvContent;
}

/**
 * Calculates total mentor scholarship payout and mentee mileage points
 */
export function calculateSettlementTotal(records: AdminSettlementRecord[]): {
  totalMentorScholarship: number;
  totalMenteeMileage: number;
} {
  let totalMentorScholarship = 0;
  let totalMenteeMileage = 0;

  for (const record of records) {
    if (record.attended && record.status === 'APPROVED') {
      if (record.role === 'MENTOR') {
        totalMentorScholarship += record.settlementAmount;
      } else {
        totalMenteeMileage += record.settlementAmount;
      }
    }
  }

  return { totalMentorScholarship, totalMenteeMileage };
}

/**
 * Triggers browser download of generated CSV file
 */
export function downloadCsvFile(content: string, filename: string = 'SWIC_멘토링_정산품의서.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
