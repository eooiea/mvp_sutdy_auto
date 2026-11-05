import { MentoringProgram, MenteeApplication, ApplicationStatus } from '../types';

export function canApplyMentoring(program: MentoringProgram): boolean {
  return program.status === 'RECRUITING' && program.currentEnrolled < program.capacity;
}

export function updateApplicationStatus(
  program: MentoringProgram,
  application: MenteeApplication,
  newStatus: ApplicationStatus
): {
  updatedProgram: MentoringProgram;
  updatedApplication: MenteeApplication;
} {
  const updatedApplication: MenteeApplication = {
    ...application,
    status: newStatus,
  };

  let newEnrolled = program.currentEnrolled;
  if (application.status !== 'APPROVED' && newStatus === 'APPROVED') {
    newEnrolled = Math.min(program.capacity, program.currentEnrolled + 1);
  } else if (application.status === 'APPROVED' && newStatus !== 'APPROVED') {
    newEnrolled = Math.max(0, program.currentEnrolled - 1);
  }

  const updatedProgram: MentoringProgram = {
    ...program,
    currentEnrolled: newEnrolled,
    status: newEnrolled >= program.capacity && program.status === 'RECRUITING' ? 'MATCHED' : program.status,
  };

  return { updatedProgram, updatedApplication };
}

export function calculateSubmissionRate(submittedCount: number, totalExpectedCount: number): number {
  if (totalExpectedCount <= 0) return 0;
  return Math.round((submittedCount / totalExpectedCount) * 100);
}

