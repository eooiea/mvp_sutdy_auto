export interface ActivityLogInputValidation {
  topic: string;
  activityDate: string;
  durationHours: number;
  summary3Lines: [string, string, string];
  hasAttendees: boolean;
  hasPhoto: boolean;
}

export function validateActivityLog(input: ActivityLogInputValidation): {
  isValid: boolean;
  error?: string;
} {
  if (!input.topic || input.topic.trim().length < 2) {
    return { isValid: false, error: '활동 주제를 입력해주세요 (최소 2글자 이상).' };
  }

  if (!input.activityDate) {
    return { isValid: false, error: '활동 일자를 선택해주세요.' };
  }

  if (input.durationHours <= 0) {
    return { isValid: false, error: '활동 시간을 1시간 이상 입력해주세요.' };
  }

  if (
    !input.summary3Lines[0].trim() ||
    !input.summary3Lines[1].trim() ||
    !input.summary3Lines[2].trim()
  ) {
    return { isValid: false, error: '활동 내용 3줄 요약을 빠짐없이 입력해주세요.' };
  }

  if (!input.hasAttendees) {
    return { isValid: false, error: '최소 1명 이상의 참석자를 체크해주세요.' };
  }

  return { isValid: true };
}

