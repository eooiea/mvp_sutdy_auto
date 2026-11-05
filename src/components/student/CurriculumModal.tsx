import React from 'react';
import { MentoringProgram } from '../../types';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../common/Icons';

interface CurriculumModalProps {
  program: MentoringProgram | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  program,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              커리큘럼 & 주차별 실습 계획
            </span>
          </div>
          <h2 className="text-lg font-bold">{program.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            총 {program.totalWeeks}회차 과정 | 장소: {program.location}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
          {/* GitHub Repo Notice */}
          {program.githubRepoUrl && (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4 text-slate-700" />
                <span className="font-semibold text-slate-800 text-xs">
                  공식 스터디 GitHub 저장소
                </span>
              </div>
              <a
                href={program.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <span>저장소 방문하기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Curriculum Timeline */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>주차별 강의 및 실습 주제</span>
            </h4>
            <div className="space-y-2">
              {program.curriculum.map((item) => (
                <div
                  key={item.week}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    {item.week}주
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
