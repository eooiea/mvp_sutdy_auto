import { describe, it, expect } from 'vitest';
import {
  calculateSubmissionRate,
  updateApplicationStatus,
  canApplyMentoring,
} from './statusTransition';
import { MentoringProgram, MenteeApplication } from '../types';

describe('Status Transitions & Calculation (TDD Red -> Green)', () => {
  const dummyProgram: MentoringProgram = {
    id: 'p1',
    title: '테스트 멘토링',
    subtitle: '테스트',
    category: 'MAJOR_STUDY',
    status: 'RECRUITING',
    semester: '2026-1',
    recruitmentType: 'REGULAR',
    mentor: {
      id: 'm1',
      name: '이명준',
      studentId: '20241234',
      department: '컴퓨터·인공지능공학부',
      grade: 3,
      bio: '테스트',
      expertise: ['알고리즘'],
    },
    targetAudience: '1~2학년',
    capacity: 4,
    currentEnrolled: 2,
    period: '2026.03 ~ 2026.06',
    meetingSchedule: '매주 화, 목',
    location: '공학1관 301호',
    curriculum: [],
    tags: ['알고리즘'],
    coverGradient: 'bg-slate-900',
    totalWeeks: 8,
  };

  const dummyApp: MenteeApplication = {
    id: 'app1',
    mentoringId: 'p1',
    applicantName: '홍길동',
    studentId: '20251111',
    department: '컴퓨터공학과',
    grade: 1,
    phone: '010-1234-5678',
    email: 'hong@pknu.ac.kr',
    motivation: '열심히 하겠습니다',
    status: 'PENDING',
    appliedAt: '2026-03-01',
    semester: '2026-1',
  };

  it('canApplyMentoring returns true when capacity is not reached and status is RECRUITING', () => {
    expect(canApplyMentoring(dummyProgram)).toBe(true);
  });

  it('canApplyMentoring returns false when capacity is reached', () => {
    const fullProgram = { ...dummyProgram, currentEnrolled: 4 };
    expect(canApplyMentoring(fullProgram)).toBe(false);
  });

  it('updateApplicationStatus updates status and program enrolled count', () => {
    const result = updateApplicationStatus(dummyProgram, dummyApp, 'APPROVED');
    expect(result.updatedApplication.status).toBe('APPROVED');
    expect(result.updatedProgram.currentEnrolled).toBe(3);
  });

  it('calculateSubmissionRate computes accurate percentage of submitted logs', () => {
    // 2 out of 4 teams submitted this week
    expect(calculateSubmissionRate(2, 4)).toBe(50);
    expect(calculateSubmissionRate(0, 0)).toBe(0);
    expect(calculateSubmissionRate(3, 3)).toBe(100);
  });
});

