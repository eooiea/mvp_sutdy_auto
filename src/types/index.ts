export type CategoryType =
  | 'ALL'
  | 'FRESHMAN_BASIC'   // 새내기·비전공 첫걸음
  | 'MAJOR_STUDY'      // 전공 역량·학점 스터디
  | 'PROJECT_CONTEST'  // 공모전·융합 프로젝트
  | 'CAREER_CERT';     // 코테·취업·자격증

export const PARTICIPATING_DEPARTMENTS = [
  '컴퓨터·인공지능공학부',
  '언론정보전공',
  '미디어ICT공학전공',
  '빅데이터전공',
  '통계·데이터사이언스전공',
  '의공학전공',
  '의공학IT융합전공',
  '휴먼바이오융합전공',
  '해양스포츠전공',
  '전자공학전공',
  '정보통신공학전공',
  '식품영양학전공',
  '식품공학전공',
  '시각디자인전공',
  '위성정보융합공학전공',
  '조선해양시스템공학전공',
  '기계시스템공학전공',
  '제어계측공학전공',
  '디지털금융학과',
  '스마트모빌리티공학과',
  '산업경영공학전공',
  '기술·데이터공학전공',
] as const;

export type ParticipatingDepartment = (typeof PARTICIPATING_DEPARTMENTS)[number];

export type MentoringStatus = 'RECRUITING' | 'MATCHED' | 'ACTIVE' | 'COMPLETED';

export type RecruitmentType = 'REGULAR' | 'ADDITIONAL'; // 정기모집 vs 추가모집

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Mentor {
  id: string;
  name: string;
  studentId: string;
  department: string;
  grade: number;
  githubUrl?: string;
  bio: string;
  expertise: string[];
  bankName?: string;
  accountNumber?: string;
}

export interface MenteeApplication {
  id: string;
  mentoringId: string;
  applicantName: string;
  studentId: string;
  department: string;
  grade: number;
  phone: string;
  email: string;
  motivation: string;
  status: ApplicationStatus;
  appliedAt: string;
  semester: string;
  bankName?: string;
  accountNumber?: string;
}

export interface WeeklyActivityLog {
  id: string;
  mentoringId: string;
  semester: string;
  week: number;
  activityDate: string;
  durationHours: number;
  topic: string;
  summary3Lines: [string, string, string];
  attendees: {
    studentId: string;
    name: string;
    role: 'MENTOR' | 'MENTEE';
    attended: boolean;
  }[];
  photoUrls: string[];
  submittedAt: string;
  adminApproved: boolean;
  adminFeedback?: string;
}

export interface MentoringProgram {
  id: string;
  title: string;
  subtitle: string;
  category: CategoryType;
  status: MentoringStatus;
  semester: string;
  recruitmentType: RecruitmentType;
  mentor: Mentor;
  coMentors?: Mentor[];
  targetAudience: string;
  capacity: number;
  currentEnrolled: number;
  period: string;
  meetingSchedule: string;
  location: string;
  curriculum: {
    week: number;
    title: string;
    description: string;
    slidesUrl?: string;
  }[];
  githubRepoUrl?: string;
  tags: string[];
  coverGradient: string;
  totalWeeks: number;
}

export interface AdminSettlementRecord {
  studentId: string;
  name: string;
  department: string;
  role: 'MENTOR' | 'MENTEE';
  mentoringTitle: string;
  semester: string;
  week: number;
  activityDate: string;
  durationHours: number;
  attended: boolean;
  settlementAmount: number;
  bankName: string;
  accountNumber: string;
  status: 'APPROVED' | 'PENDING';
}

export interface StudentUserSummary {
  studentId: string;
  name: string;
  department: string;
  role: 'MENTOR' | 'MENTEE';
  mentoringTitle: string;
  semester: string;
  totalHours: number;
  attendedSessions: number;
  totalSessions: number;
  attendanceRate: number;
  totalSettlement: number;
  bankName: string;
  accountNumber: string;
}
