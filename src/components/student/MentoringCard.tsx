import React from 'react';
import { MentoringProgram } from '../../types';
import {
  Users,
  Calendar,
  MapPin,
  BookOpen,
  Send,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { GithubIcon } from '../common/Icons';

interface MentoringCardProps {
  program: MentoringProgram;
  onApply: (program: MentoringProgram) => void;
  onSubmitLog: (program: MentoringProgram) => void;
  onViewCurriculum: (program: MentoringProgram) => void;
}

export const MentoringCard: React.FC<MentoringCardProps> = ({
  program,
  onApply,
  onSubmitLog,
  onViewCurriculum,
}) => {
  const isFull = program.currentEnrolled >= program.capacity;
  const enrolledPercent = Math.round((program.currentEnrolled / program.capacity) * 100);

  const getCategoryLabel = () => {
    switch (program.category) {
      case 'FRESHMAN_BASIC':
        return '새내기·비전공 첫걸음';
      case 'MAJOR_STUDY':
        return '전공 역량·학점 스터디';
      case 'PROJECT_CONTEST':
        return '공모전·융합 프로젝트';
      case 'CAREER_CERT':
        return '코테·취업·자격증';
      default:
        return '멘토링 프로그램';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Unified Simple Card Header (심플 다크 네이비 헤더) */}
      <div className="h-20 bg-slate-900 p-4 flex flex-col justify-between relative border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-slate-200">
              {program.semester}학기
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/20">
              {getCategoryLabel()}
            </span>
          </div>

          {program.status === 'RECRUITING' && !isFull ? (
            program.recruitmentType === 'ADDITIONAL' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                추가모집
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                정기모집
              </span>
            )
          ) : program.status === 'ACTIVE' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              활동중 ({program.totalWeeks}주차)
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
              매칭완료
            </span>
          )}
        </div>

        {/* GitHub Link if available */}
        {program.githubRepoUrl && (
          <a
            href={program.githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="self-end inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] transition-colors"
          >
            <GithubIcon className="w-3 h-3" />
            <span>GitHub 저장소</span>
          </a>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {program.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {program.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {program.subtitle}
          </p>

          {/* Mentor Profile Section */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                {program.mentor.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    {program.mentor.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({program.mentor.department} {program.mentor.grade}학년)
                  </span>
                </div>
                {program.coMentors && program.coMentors.length > 0 && (
                  <p className="text-[10px] text-slate-400">
                    외 멘토 {program.coMentors.map((c) => c.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{program.meetingSchedule}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{program.location}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>모집 인원</span>
              </span>
              <span className="font-bold text-slate-800">
                {program.currentEnrolled} / {program.capacity}명 ({enrolledPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  enrolledPercent >= 100 ? 'bg-slate-400' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, enrolledPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewCurriculum(program)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>커리큘럼</span>
            </button>
            <button
              onClick={() => onSubmitLog(program)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>일지 작성</span>
            </button>
          </div>

          {program.status === 'RECRUITING' && !isFull ? (
            <button
              onClick={() => onApply(program)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>1분 간편 신청하기</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
            >
              모집이 마감되었습니다
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
