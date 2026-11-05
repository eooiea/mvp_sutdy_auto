import { AdminSettlementRecord } from '../types';

/**
 * Generates official administrative CSV string formatted with UTF-8 BOM
 * for direct, uncorrupted opening in Korean Microsoft Excel.
 * Includes student bank and account numbers for immediate official disbursement.
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
    '지급예정액/마일리지',
    '입금은행',
    '계좌번호',
    '승인상태',
  ];

  const escapeCsv = (str: string | number) => {
    const val = String(str);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = records.map((r) => [
    escapeCsv(r.studentId),
    escapeCsv(r.name),
    escapeCsv(r.department),
    escapeCsv(r.role === 'MENTOR' ? '멘토' : '멘티'),
    escapeCsv(r.mentoringTitle),
    escapeCsv(r.semester || '2026-1'),
    escapeCsv(`${r.week}주차`),
    escapeCsv(r.activityDate),
    escapeCsv(`${r.durationHours}시간`),
    escapeCsv(r.attended ? '참석' : '결석'),
    escapeCsv(r.role === 'MENTOR' ? `${r.settlementAmount}원` : `${r.settlementAmount}점`),
    escapeCsv(r.bankName || '부산은행'),
    escapeCsv(r.accountNumber || '112-2104-5678-01'),
    escapeCsv(r.status === 'APPROVED' ? '승인' : '대기'),
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
