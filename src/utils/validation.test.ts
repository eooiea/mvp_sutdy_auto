import { describe, it, expect } from 'vitest';
import { validateActivityLog } from './validation';

describe('Activity Log Validation (TDD Red -> Green)', () => {
  it('returns false if topic is empty or too short', () => {
    const result = validateActivityLog({
      topic: '',
      activityDate: '2026-04-10',
      durationHours: 2,
      summary3Lines: ['1', '2', '3'],
      hasAttendees: true,
      hasPhoto: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('주제를');
  });

  it('returns false if summary lines are empty', () => {
    const result = validateActivityLog({
      topic: '재귀함수와 완전탐색',
      activityDate: '2026-04-10',
      durationHours: 2,
      summary3Lines: ['', '', ''],
      hasAttendees: true,
      hasPhoto: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('3줄 요약');
  });

  it('returns false if no attendees selected', () => {
    const result = validateActivityLog({
      topic: '재귀함수와 완전탐색',
      activityDate: '2026-04-10',
      durationHours: 2,
      summary3Lines: ['1', '2', '3'],
      hasAttendees: false,
      hasPhoto: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('참석자');
  });

  it('returns true when all required fields are valid', () => {
    const result = validateActivityLog({
      topic: '재귀함수와 완전탐색',
      activityDate: '2026-04-10',
      durationHours: 2,
      summary3Lines: [
        '기저조건(Base Case) 설정 원리 학습',
        '백준 N-Queen 백트래킹 실습',
        '다음 주차 그래프 탐색 사전 과제 공지',
      ],
      hasAttendees: true,
      hasPhoto: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

