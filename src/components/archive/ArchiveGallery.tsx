import React, { useState } from 'react';
import { useMentoring } from '../../context/MentoringContext';
import { WeeklyActivityLog } from '../../types';
import { Sparkles, Calendar, Users, Eye, X, Award, ExternalLink } from 'lucide-react';

export const ArchiveGallery: React.FC = () => {
  const { activityLogs, programs } = useMentoring();
  const [selectedLog, setSelectedLog] = useState<WeeklyActivityLog | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>우수 멘토링 활동 아카이브</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          학내 지식 자산으로 축적된 멘토링 보고서
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          기존에는 한글 파일로 수합되어 서랍 속에 잠자던 학생들의 우수 활동 일지를 온라인 갤러리로 아카이빙하여, 차기 참여 학생들과 후배들이 참고할 수 있는 영구적 지식 자산으로 전환합니다.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activityLogs.map((log) => {
          const prog = programs.find((p) => p.id === log.mentoringId);
          return (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src={log.photoUrls[0]}
                  alt={log.topic}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  {log.week}주차 리포트
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 mb-1">
                    {prog?.title}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {log.topic}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {log.summary3Lines[0]}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {log.activityDate}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Users className="w-3 h-3" />
                    {log.attendees.filter((a) => a.attended).length}명 출석
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-300">
                  {selectedLog.week}주차 우수 보고서 상세
                </span>
                <h3 className="text-base font-bold truncate pr-4">{selectedLog.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <img
                src={selectedLog.photoUrls[0]}
                alt="활동사진"
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />

              <div>
                <div className="font-semibold text-slate-800 mb-1.5">3줄 요약</div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-700">
                  {selectedLog.summary3Lines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-600">{idx + 1}.</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

