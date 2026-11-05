import React, { useState, useMemo } from 'react';
import { useMentoring } from '../../context/MentoringContext';
import {
  generateSettlementCsv,
  downloadCsvFile,
} from '../../utils/settlementExport';
import {
  Calendar,
  CheckCircle2,
  Users,
  Download,
  FileSpreadsheet,
  Clock,
  Award,
} from 'lucide-react';

export const AdminCompletedArchive: React.FC = () => {
  const { programs, activityLogs, getSettlementRecords } = useMentoring();

  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');

  // Available completed semesters dynamically collected
  const availableCompletedSemesters = useMemo(() => {
    const sems = new Set<string>();
    programs.forEach((p) => {
      if ((p.status === 'COMPLETED' || p.semester !== '2026-1') && p.semester) {
        sems.add(p.semester);
      }
    });
    return Array.from(sems).sort().reverse();
  }, [programs]);

  // Programs that are completed or from past semesters
  const completedPrograms = useMemo(() => {
    return programs.filter((p) => {
      const isPastOrCompleted = p.status === 'COMPLETED' || p.semester === '2025-1';
      if (!isPastOrCompleted) return false;
      if (selectedSemester !== 'ALL' && p.semester !== selectedSemester) return false;
      return true;
    });
  }, [programs, selectedSemester]);

  const allSettlement = useMemo(() => getSettlementRecords(), [getSettlementRecords]);

  const handleDownloadCompletedCsv = () => {
    const records = allSettlement.filter((r) => {
      if (selectedSemester === 'ALL') return true;
      return r.semester === selectedSemester;
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    const sem = selectedSemester === 'ALL' ? '전체완료학기' : `${selectedSemester}학기_최종`;
    downloadCsvFile(generateSettlementCsv(records), `SWIC_멘토링_완료결과보고서_${sem}_${dateStr}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>학기별 수료 완료 사업단 공식 아카이브</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              학기별 완료 멘토링 및 실적 보관소
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              종료된 지난 학기의 멘토링 결과보고서, 출석부, 최종 장학금 지급 실적을 보관하고 열람합니다.
            </p>
          </div>

          <button
            onClick={handleDownloadCompletedCsv}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>수료 실적 엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {/* Semester Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 shrink-0">완료 학기 선택:</span>
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-colors shadow-2xs appearance-none"
            >
              <option value="ALL">전체 완료 학기 통합</option>
              {availableCompletedSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}학기 완료 실적
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          총 {completedPrograms.length}개 멘토링 수료 보관중
        </span>
      </div>

      {/* Completed Programs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {completedPrograms.map((prog) => {
          const logs = activityLogs.filter((l) => l.mentoringId === prog.id);
          const totalHours = logs.reduce((sum, l) => sum + l.durationHours, 0);

          return (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {prog.semester}학기
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    수료 완료
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{prog.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{prog.subtitle}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[11px] text-slate-400 block">책임 멘토</span>
                    <strong className="text-slate-800">{prog.mentor.name}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[11px] text-slate-400 block">수료 인원</span>
                    <strong className="text-slate-800">{prog.currentEnrolled}명 완주</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[11px] text-slate-400 block">총 활동시간</span>
                    <strong className="text-slate-800">{totalHours || prog.totalWeeks * 2}시간</strong>
                  </div>
                </div>

                {/* Sample submitted logs preview */}
                {logs.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      주요 등록 결과보고서:
                    </span>
                    <div className="text-xs text-slate-600 bg-slate-50/70 p-2 rounded-lg space-y-0.5">
                      {logs.slice(0, 2).map((l) => (
                        <div key={l.id} className="truncate">
                          • {l.week}주차: {l.topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">장학금 및 마일리지 정산 완료</span>
                <button
                  onClick={handleDownloadCompletedCsv}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>품의 내역 확인</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

