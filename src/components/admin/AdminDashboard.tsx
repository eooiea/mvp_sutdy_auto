import React, { useState, useMemo } from 'react';
import { useMentoring } from '../../context/MentoringContext';
import { WeeklyActivityLog, RecruitmentType } from '../../types';
import {
  generateSettlementCsv,
  generateStudentSummaryCsv,
  generateMenteeMileageCsv,
  generateMentorDisbursementCsv,
  downloadCsvFile,
  calculateSettlementTotal,
} from '../../utils/settlementExport';
import {
  generateStudentSummaries,
  filterSettlementRecords,
  filterPrograms,
  filterStudentSummariesByRole,
  calculateRoleTotals,
} from '../../utils/adminAnalytics';
import { calculateSubmissionRate } from '../../utils/statusTransition';
import {
  FileSpreadsheet,
  Check,
  X,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  Layers,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowRightLeft,
  GraduationCap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    programs,
    applications,
    activityLogs,
    approveApplication,
    rejectApplication,
    toggleRecruitmentType,
    getSettlementRecords,
    hourlyRate,
    setHourlyRate,
  } = useMentoring();

  // View Mode: 'BY_PROJECT' | 'BY_USER' | 'BY_SETTLEMENT' | 'BY_APPLICATION'
  const [adminViewMode, setAdminViewMode] = useState<
    'BY_PROJECT' | 'BY_USER' | 'BY_SETTLEMENT' | 'BY_APPLICATION'
  >('BY_PROJECT');

  // Global Filters
  const [selectedSemester, setSelectedSemester] = useState<string>('2026-1');
  const [selectedRecruitmentType, setSelectedRecruitmentType] = useState<
    RecruitmentType | 'ALL'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<WeeklyActivityLog | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [settlementSubTab, setSettlementSubTab] = useState<'SUMMARY' | 'LOGS'>('SUMMARY');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'MENTOR' | 'MENTEE'>('ALL');
  const [settlementRoleFilter, setSettlementRoleFilter] = useState<'ALL' | 'MENTOR' | 'MENTEE'>('ALL');

  // Available semesters dynamically collected from data
  const availableSemesters = useMemo(() => {
    const sems = new Set<string>();
    programs.forEach((p) => p.semester && sems.add(p.semester));
    activityLogs.forEach((l) => l.semester && sems.add(l.semester));
    return Array.from(sems).sort().reverse();
  }, [programs, activityLogs]);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return filterPrograms(programs, {
      semester: selectedSemester,
      recruitmentType: selectedRecruitmentType,
      search: searchQuery,
    });
  }, [programs, selectedSemester, selectedRecruitmentType, searchQuery]);

  // Filtered Settlement Records
  const allSettlementRecords = useMemo(() => getSettlementRecords(), [getSettlementRecords]);
  const filteredSettlementRecords = useMemo(() => {
    return filterSettlementRecords(allSettlementRecords, selectedSemester).filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.studentId.includes(q) ||
        r.mentoringTitle.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [allSettlementRecords, selectedSemester, searchQuery]);

  // Student User Summaries (사용자별 종합 데이터)
  const studentSummaries = useMemo(() => {
    return generateStudentSummaries(activityLogs, programs, selectedSemester, hourlyRate).filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentId.includes(q) ||
        s.mentoringTitle.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    });
  }, [activityLogs, programs, selectedSemester, searchQuery]);

  // Pending Applications
  const pendingApplications = applications.filter((a) => {
    const matchSem = selectedSemester === 'ALL' || a.semester === selectedSemester;
    return matchSem && a.status === 'PENDING';
  });

  const totals = calculateSettlementTotal(filteredSettlementRecords);

  // Split into mentors and mentees
  const mentorSummaries = useMemo(
    () => studentSummaries.filter((s) => s.role === 'MENTOR'),
    [studentSummaries]
  );
  const menteeSummaries = useMemo(
    () => studentSummaries.filter((s) => s.role === 'MENTEE'),
    [studentSummaries]
  );
  const roleTotals = useMemo(
    () => calculateRoleTotals(studentSummaries),
    [studentSummaries]
  );

  const handleDownloadMentorOnlyCsv = () => {
    const csvData = generateMentorDisbursementCsv(mentorSummaries);
    const dateStr = new Date().toISOString().slice(0, 10);
    const semName = selectedSemester === 'ALL' ? '전체학기' : `${selectedSemester}학기`;
    downloadCsvFile(csvData, `SWIC_회계품의_멘토_장학금총괄표_${semName}_${dateStr}.csv`);
    setDownloadSuccessMessage(
      `[멘토 활동비 품의 총괄표] ${semName} (${mentorSummaries.length}명, ${roleTotals.totalMentorScholarship.toLocaleString()}원, 계좌정보 포함) 파일이 다운로드되었습니다.`
    );
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleDownloadMenteeOnlyCsv = () => {
    const csvData = generateMenteeMileageCsv(menteeSummaries);
    const dateStr = new Date().toISOString().slice(0, 10);
    const semName = selectedSemester === 'ALL' ? '전체학기' : `${selectedSemester}학기`;
    downloadCsvFile(csvData, `SWIC_교육혁신원_멘티_마일리지등록_${semName}_${dateStr}.csv`);
    setDownloadSuccessMessage(
      `[교육혁신원 멘티 마일리지 등록표] ${semName} (${menteeSummaries.length}명, ${roleTotals.totalMenteeMileage}P, 불필요한 계좌 제외) 파일이 다운로드되었습니다.`
    );
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleDownloadSummaryCsv = () => {
    const csvData = generateStudentSummaryCsv(studentSummaries);
    const dateStr = new Date().toISOString().slice(0, 10);
    const semName = selectedSemester === 'ALL' ? '전체학기' : `${selectedSemester}학기`;
    downloadCsvFile(csvData, `SWIC_회계품의_학생별_정산총괄표_${semName}_${dateStr}.csv`);
    setDownloadSuccessMessage(
      `[회계 품의용 학생별 총괄표] ${semName} 파일이 UTF-8 BOM(1인 1행, 순수 숫자 계산 가능)으로 다운로드되었습니다.`
    );
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleDownloadAuditLogCsv = () => {
    const csvData = generateSettlementCsv(filteredSettlementRecords);
    const dateStr = new Date().toISOString().slice(0, 10);
    const semName = selectedSemester === 'ALL' ? '전체학기' : `${selectedSemester}학기`;
    downloadCsvFile(csvData, `SWIC_감사증빙_주차별_상세내역_${semName}_${dateStr}.csv`);
    setDownloadSuccessMessage(
      `[감사 증빙용 주차별 상세내역] ${semName} 파일이 UTF-8 BOM(국비 감사 대조용)으로 다운로드되었습니다.`
    );
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Semester Indicator (공고 배너와 완전 동일한 크기/패딩) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 min-h-[190px] flex flex-col justify-center">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                행정실 통합 관제 포털
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                현재 조회: {selectedSemester === 'ALL' ? '전체 학기' : `${selectedSemester}학기`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              멘토링 통합 관리 대시보드
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              학기 기간별, 프로젝트별, 참여 학생(사용자)별로 데이터를 체계적으로 필터링하고 공문 정산용 엑셀을 1클릭 추출합니다.
            </p>
          </div>

          {/* Dedicated Dual Download Buttons (Option A) */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleDownloadSummaryCsv}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
              title="회계 품의 및 은행 계좌 이체용 (1인 1행, 순수 숫자 계산 가능)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>회계 품의용 총괄표 (엑셀)</span>
            </button>
            <button
              onClick={handleDownloadAuditLogCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all"
              title="국비 감사 증빙용 주차별 출석 및 활동 일지 상세내역"
            >
              <Download className="w-4 h-4" />
              <span>감사 증빙용 상세내역 (엑셀)</span>
            </button>
          </div>
        </div>

        {downloadSuccessMessage && (
          <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>다운로드 성공:</strong> {downloadSuccessMessage}
            </span>
          </div>
        )}
      </div>

      {/* 부경대학교 비교과 통합플랫폼(웨일비) 연계 안내 배너 */}
      <div className="bg-slate-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                부경대학교 비교과 통합플랫폼(웨일비 · Whalebee) 연계 안내
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                수합·검수 전용 도구
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              웨일비는 학기 말 마일리지 등록 및 최종 결과 등록 시스템입니다. 본 시스템은 학기 중 매주 카카오톡과 한글(HWP) 파일로 분산되던 출석·사진·일지를 단일 웹 파이프라인으로 모아 웨일비/KORUS에 즉시 등록 가능하도록 1클릭 엑셀로 정제해 주는 <strong>현장 수합·검수 자동화 도구</strong>입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Global Filter Bar (학기 기간별 & 모집 구분 & 검색) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Semester Selector Dropdown (Scalable & Infinite Semesters) */}
            <div className="flex items-center gap-2 shrink-0">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 shrink-0">학기(기간):</span>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-colors shadow-2xs appearance-none"
                >
                  <option value="ALL">전체 학기 통합 조회</option>
                  {availableSemesters.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}학기 {sem === '2026-1' ? '(현재 학기)' : ''}
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

            {/* Recruitment Type Selector (정기모집 vs 추가모집) Segmented Control */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-700 shrink-0">모집 구분:</span>
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRecruitmentType('ALL')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedRecruitmentType === 'ALL'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecruitmentType('REGULAR')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedRecruitmentType === 'REGULAR'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  정기모집
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecruitmentType('ADDITIONAL')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedRecruitmentType === 'ADDITIONAL'
                      ? 'bg-white text-amber-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  추가모집
                </button>
              </div>
            </div>

            {/* Variable Hourly Wage Setting (가변 시급 설정) */}
            <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 shrink-0">지급 기준:</span>
              <select
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-md px-2 py-0.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={12000}>시급 12,000원 (최저시급 기준)</option>
                <option value={15000}>시급 15,000원 (사업단 표준 지침)</option>
                <option value={18000}>시급 18,000원 (전공 심화 가산)</option>
                <option value={20000}>시급 20,000원 (고급 프로젝트 지원)</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-60 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 학번, 멘토링명 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 4 View Tabs (정밀 균등 분할 그리드 & 레이아웃 안정화) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setAdminViewMode('BY_PROJECT')}
            className={`flex items-center justify-center gap-2 h-11 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors w-full text-center ${
              adminViewMode === 'BY_PROJECT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">프로젝트(팀)별 현황 ({filteredPrograms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewMode('BY_USER')}
            className={`flex items-center justify-center gap-2 h-11 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors w-full text-center ${
              adminViewMode === 'BY_USER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">학생(사용자)별 활동 이력 ({studentSummaries.length}명)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewMode('BY_SETTLEMENT')}
            className={`flex items-center justify-center gap-2 h-11 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors w-full text-center ${
              adminViewMode === 'BY_SETTLEMENT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">기간별 정산·품의 추출 ({filteredSettlementRecords.length}건)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewMode('BY_APPLICATION')}
            className={`flex items-center justify-center gap-2 h-11 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors w-full text-center relative ${
              adminViewMode === 'BY_APPLICATION'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">신규 신청서 승인 ({pendingApplications.length}건 대기)</span>
            {pendingApplications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: 프로젝트(팀)별 조회 */}
      {adminViewMode === 'BY_PROJECT' && (
        <div className="space-y-6 min-h-[460px]">
          {/* Projects Table with Additional Recruitment Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedSemester === 'ALL' ? '전체 학기' : `${selectedSemester}학기`} 멘토링 팀 현황
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  학기 중 결원이 생기거나 인원을 추가 모집해야 하는 경우 우측 버튼으로 즉시 추가모집 상태로 전환할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold">
                    <th className="p-3.5">멘토링 팀명 (학기)</th>
                    <th className="p-3.5">대표 멘토</th>
                    <th className="p-3.5">모집 구분</th>
                    <th className="p-3.5">참여 현황</th>
                    <th className="p-3.5">운영 주차</th>
                    <th className="p-3.5 text-center">추가모집 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPrograms.map((prog) => (
                    <tr key={prog.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{prog.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {prog.semester}학기 · {prog.subtitle}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        {prog.mentor.name}
                        <span className="text-[11px] text-slate-400 block">
                          {prog.mentor.department}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {prog.recruitmentType === 'ADDITIONAL' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            추가모집
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            정기모집
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">
                          {prog.currentEnrolled} / {prog.capacity}명
                        </span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((prog.currentEnrolled / prog.capacity) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5 text-xs font-medium text-slate-600">
                        총 {prog.totalWeeks}주차 과정 (1학기 단위)
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleRecruitmentType(prog.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 mx-auto transition-colors"
                          title="정기모집 ⇄ 추가모집 상태 전환"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                          <span>
                            {prog.recruitmentType === 'ADDITIONAL'
                              ? '정기로 전환'
                              : '추가모집 열기'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 주차별 일지 제출 현황 매트릭스 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>1학기 정규 주차별 활동일지 제출 현황 매트릭스</span>
                  <span className="text-xs font-normal text-slate-500">
                    (초록색 셀 클릭 시 제출된 일지·사진 검수)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  1학기(최대 10주차) 단위로 각 팀의 주차별 보고서 제출 여부를 즉각 식별합니다.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="p-3 text-left min-w-[220px]">멘토링 팀명 (멘토)</th>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => (
                      <th key={w} className="p-2 min-w-[65px]">
                        {w}주차
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPrograms.map((prog) => (
                    <tr key={prog.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-left font-semibold text-slate-800">
                        <div>{prog.title}</div>
                        <div className="text-[11px] font-normal text-slate-400">
                          {prog.mentor.name} 멘토 ({prog.semester}학기 · {prog.currentEnrolled}명)
                        </div>
                      </td>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => {
                        const log = activityLogs.find(
                          (l) => l.mentoringId === prog.id && l.week === w
                        );
                        const isFuture = w > prog.totalWeeks;

                        if (isFuture) {
                          return (
                            <td key={w} className="p-2 text-slate-300">
                              -
                            </td>
                          );
                        }

                        if (log) {
                          return (
                            <td key={w} className="p-2">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="w-full py-1 px-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>제출</span>
                              </button>
                            </td>
                          );
                        }

                        return (
                          <td key={w} className="p-2">
                            <span className="inline-block py-0.5 px-1.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                              미제출
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 사용자(학생)별 활동·출석 이력 (멘토/멘티 완벽 분리 뷰) */}
      {adminViewMode === 'BY_USER' && (
        <div className="space-y-5 min-h-[460px]">
          {/* Top Control & Role Segmented Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>참여 학생(사용자)별 영구 누적 데이터 조회</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  멘토(장학금·활동비 지급 대상)와 멘티(비교과 마일리지 적립 대상)를 명확히 분리하여 대학 행정 품의 및 웨일비/KORUS 등록을 지원합니다.
                </p>
              </div>

              {/* Dedicated Role-specific Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadMentorOnlyCsv}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  title="멘토 장학금·활동비 품의용 엑셀 다운로드 (순수 숫자)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>멘토 품의표 ({mentorSummaries.length}명)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMenteeOnlyCsv}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  title="멘티 비교과 마일리지 웨일비 등록용 엑셀 다운로드 (순수 숫자)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>멘티 마일리지표 ({menteeSummaries.length}명)</span>
                </button>
              </div>
            </div>

            {/* Role Filter Tabs (Segmented Control) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체 분리 보기 ({studentSummaries.length}명)
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('MENTOR')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'MENTOR'
                      ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  멘토만 보기 ({mentorSummaries.length}명 · {roleTotals.totalMentorScholarship.toLocaleString()}원)
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('MENTEE')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'MENTEE'
                      ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  멘티만 보기 ({menteeSummaries.length}명 · {roleTotals.totalMenteeMileage}P)
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span>멘토 활동비 합계: <strong className="text-blue-700">{roleTotals.totalMentorScholarship.toLocaleString()}원</strong></span>
                <span className="text-slate-300">|</span>
                <span>멘티 마일리지 합계: <strong className="text-indigo-700">{roleTotals.totalMenteeMileage}P</strong></span>
              </div>
            </div>
          </div>

          {/* SECTION 1: 책임 멘토 장학금/활동비 지급 명단 */}
          {(userRoleFilter === 'ALL' || userRoleFilter === 'MENTOR') && (
            <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    멘토
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        책임 멘토 명단 (장학금·활동비 지급 대상)
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                        {mentorSummaries.length}명
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      지급 기준: 시급 {hourlyRate.toLocaleString()}원 · 인정 시간 기준 KORUS 지출결의 서식
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[11px]">총 인정시간 / 지급총액</span>
                    <strong className="text-blue-900 font-extrabold">
                      {roleTotals.totalMentorHours}시간 / {roleTotals.totalMentorScholarship.toLocaleString()}원
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadMentorOnlyCsv}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>품의 엑셀</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold">
                      <th className="p-3.5">학번</th>
                      <th className="p-3.5">이름</th>
                      <th className="p-3.5">학과</th>
                      <th className="p-3.5">담당 멘토링 프로그램</th>
                      <th className="p-3.5">학기</th>
                      <th className="p-3.5 text-center">진행 회차</th>
                      <th className="p-3.5 text-center">인정 활동시간</th>
                      <th className="p-3.5 text-center">출석률</th>
                      <th className="p-3.5 text-right text-blue-900 font-bold">지급 장학금 (원)</th>
                      <th className="p-3.5">입금 은행</th>
                      <th className="p-3.5">계좌번호</th>
                      <th className="p-3.5 text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {mentorSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-slate-400">
                          조회된 멘토 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      mentorSummaries.map((st, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-3.5 font-mono text-slate-500">{st.studentId}</td>
                          <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                          <td className="p-3.5">{st.department}</td>
                          <td className="p-3.5 font-medium text-slate-800">{st.mentoringTitle}</td>
                          <td className="p-3.5 text-slate-500">{st.semester}학기</td>
                          <td className="p-3.5 text-center text-slate-600 font-medium">
                            {st.attendedSessions} / {st.totalSessions}회
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-900">
                            {st.totalHours}시간
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="font-bold text-blue-700">{st.attendanceRate}%</span>
                          </td>
                          <td className="p-3.5 text-right font-extrabold text-blue-700">
                            {st.totalSettlement.toLocaleString()}원
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">{st.bankName || '부산은행'}</td>
                          <td className="p-3.5 font-mono text-xs text-slate-600">{st.accountNumber}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              지급적격
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: 참여 멘티 비교과 마일리지(교육혁신원) 적립 명단 */}
          {(userRoleFilter === 'ALL' || userRoleFilter === 'MENTEE') && (
            <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/30 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    멘티
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        참여 멘티 명단 (비교과 마일리지·교육혁신원 등록 대상)
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {menteeSummaries.length}명
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      부여 기준: 회차당 10점(P) 적립 · 교육혁신원 자체 비교과 마일리지 일괄 등록 서식 (불필요한 금융 계좌정보 제외)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[11px]">총 학습시간 / 마일리지</span>
                    <strong className="text-indigo-900 font-extrabold">
                      {roleTotals.totalMenteeHours}시간 / {roleTotals.totalMenteeMileage}P
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadMenteeOnlyCsv}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="교육혁신원 마일리지 일괄 등록 서식 다운로드 (계좌번호 제외)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>혁신원 마일리지 엑셀</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold">
                      <th className="p-3.5">학번</th>
                      <th className="p-3.5">이름</th>
                      <th className="p-3.5">학과</th>
                      <th className="p-3.5">소속 멘토링 프로그램</th>
                      <th className="p-3.5">학기</th>
                      <th className="p-3.5 text-center">출석 회차</th>
                      <th className="p-3.5 text-center">누적 학습시간</th>
                      <th className="p-3.5 text-center">출석률</th>
                      <th className="p-3.5 text-right text-indigo-900 font-bold">혁신원 마일리지 (P)</th>
                      <th className="p-3.5 text-center">80% 수료 판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {menteeSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400">
                          조회된 멘티 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      menteeSummaries.map((st, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="p-3.5 font-mono text-slate-500">{st.studentId}</td>
                          <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                          <td className="p-3.5">{st.department}</td>
                          <td className="p-3.5 font-medium text-slate-800">{st.mentoringTitle}</td>
                          <td className="p-3.5 text-slate-500">{st.semester}학기</td>
                          <td className="p-3.5 text-center text-slate-600 font-medium">
                            {st.attendedSessions} / {st.totalSessions}회
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-900">
                            {st.totalHours}시간
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`font-bold ${
                                st.attendanceRate >= 80
                                  ? 'text-emerald-600'
                                  : st.attendanceRate >= 60
                                  ? 'text-amber-600'
                                  : 'text-rose-500'
                              }`}
                            >
                              {st.attendanceRate}%
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-extrabold text-indigo-700">
                            {st.totalSettlement}P
                          </td>
                          <td className="p-3.5 text-center">
                            {st.attendanceRate >= 80 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                80% 수료
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                이수중
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: 기간별 정산·품의 엑셀 추출 */}
      {adminViewMode === 'BY_SETTLEMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[460px]">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>
                  {selectedSemester === 'ALL' ? '전체 학기' : `${selectedSemester}학기`} 정산 품의
                  데이터 ({filteredSettlementRecords.length}건)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                지정된 학기의 멘토 활동비({totals.totalMentorScholarship.toLocaleString()}원 / 시급 {hourlyRate.toLocaleString()}원 기준)와 멘티
                마일리지({totals.totalMenteeMileage}P) 품의 서식을 다운로드합니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadSummaryCsv}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                title="대학 회계 품의 및 은행 펌뱅킹 이체용 (1인 1행, 순수 숫자 계산 가능)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>회계 품의용 총괄표 (.csv)</span>
              </button>
              <button
                onClick={handleDownloadAuditLogCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                title="국비 감사 증빙용 주차별 출석 및 활동 일지 상세내역"
              >
                <Download className="w-3.5 h-3.5" />
                <span>감사 증빙용 상세내역 (.csv)</span>
              </button>
            </div>
          </div>

          {/* Sub Tab Switcher (Option A: 2원화 실시간 뷰 전환) */}
          <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="inline-flex items-center p-1 bg-slate-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => setSettlementSubTab('SUMMARY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settlementSubTab === 'SUMMARY'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. 학생별 최종 정산 총괄표 ({studentSummaries.length}명)
              </button>
              <button
                type="button"
                onClick={() => setSettlementSubTab('LOGS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settlementSubTab === 'LOGS'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. 주차별 감사 상세내역 ({filteredSettlementRecords.length}건)
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {settlementSubTab === 'SUMMARY'
                ? '대학 행정·회계 지출결의(KORUS) 복사 및 엑셀 수식(=SUM) 즉시 계산 서식'
                : 'IITP / SW중심대학 국비 감사 대비 주차별 증빙 로그 서식'}
            </span>
          </div>

          {/* Table Container */}
          {settlementSubTab === 'SUMMARY' && (
            <div className="bg-slate-50/70 px-5 py-2 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1">대상 구분:</span>
                <button
                  type="button"
                  onClick={() => setSettlementRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    settlementRoleFilter === 'ALL'
                      ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  전체 ({studentSummaries.length}명)
                </button>
                <button
                  type="button"
                  onClick={() => setSettlementRoleFilter('MENTOR')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    settlementRoleFilter === 'MENTOR'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  멘토 장학금 ({mentorSummaries.length}명 · {roleTotals.totalMentorScholarship.toLocaleString()}원)
                </button>
                <button
                  type="button"
                  onClick={() => setSettlementRoleFilter('MENTEE')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    settlementRoleFilter === 'MENTEE'
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  멘티 마일리지 ({menteeSummaries.length}명 · {roleTotals.totalMenteeMileage}P)
                </button>
              </div>

              {settlementRoleFilter === 'MENTOR' && (
                <button
                  type="button"
                  onClick={handleDownloadMentorOnlyCsv}
                  className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 border border-blue-200"
                >
                  <Download className="w-3 h-3" />
                  <span>멘토 전용 품의 엑셀</span>
                </button>
              )}
              {settlementRoleFilter === 'MENTEE' && (
                <button
                  type="button"
                  onClick={handleDownloadMenteeOnlyCsv}
                  className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 border border-indigo-200"
                >
                  <Download className="w-3 h-3" />
                  <span>멘티 전용 마일리지 엑셀</span>
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            {settlementSubTab === 'SUMMARY' ? (
              <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold shadow-2xs">
                  <tr>
                    <th className="p-3">학번</th>
                    <th className="p-3">이름</th>
                    <th className="p-3">학과</th>
                    <th className="p-3">역할</th>
                    <th className="p-3">멘토링팀명</th>
                    <th className="p-3">학기</th>
                    <th className="p-3 text-center">회차(출석/총)</th>
                    <th className="p-3 text-center">출석률</th>
                    <th className="p-3 text-right">총 인정시간</th>
                    <th className="p-3 text-right">지급총액 / 마일리지</th>
                    <th className="p-3">입금은행</th>
                    <th className="p-3">계좌번호</th>
                    <th className="p-3 text-center">적격여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filterStudentSummariesByRole(studentSummaries, settlementRoleFilter).length === 0 ? (
                    <tr>
                      <td colSpan={13} className="p-8 text-center text-slate-400">
                        선택된 대상 구분에 해당하는 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filterStudentSummariesByRole(studentSummaries, settlementRoleFilter).map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-semibold text-slate-900">{s.studentId}</td>
                        <td className="p-3 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3">{s.department}</td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.role === 'MENTOR'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.role === 'MENTOR' ? '멘토' : '멘티'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{s.mentoringTitle}</td>
                        <td className="p-3 text-slate-500">{s.semester || '2026-1'}학기</td>
                        <td className="p-3 text-center">
                          {s.attendedSessions} / {s.totalSessions}회
                        </td>
                        <td className="p-3 text-center font-semibold">
                          <span
                            className={
                              s.attendanceRate >= 80
                                ? 'text-emerald-600'
                                : s.attendanceRate >= 60
                                ? 'text-amber-600'
                                : 'text-rose-500'
                            }
                          >
                            {s.attendanceRate}%
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {s.totalHours}시간
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          {s.role === 'MENTOR'
                            ? `${s.totalSettlement.toLocaleString()}원`
                            : `${s.totalSettlement}P`}
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {s.role === 'MENTOR' ? (s.bankName || '부산은행') : '-'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {s.role === 'MENTOR' ? (s.accountNumber || '112-2104-5678-01') : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {s.role === 'MENTOR' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              지급적격
                            </span>
                          ) : s.attendanceRate >= 80 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              80% 수료
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              이수중
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold shadow-2xs">
                  <tr>
                    <th className="p-3">학번</th>
                    <th className="p-3">이름</th>
                    <th className="p-3">학과</th>
                    <th className="p-3">역할</th>
                    <th className="p-3">멘토링팀명</th>
                    <th className="p-3">학기</th>
                    <th className="p-3">회차</th>
                    <th className="p-3">활동일자</th>
                    <th className="p-3">시간</th>
                    <th className="p-3">출석</th>
                    <th className="p-3 text-right">지급액/마일리지</th>
                    <th className="p-3">입금은행</th>
                    <th className="p-3">계좌번호</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredSettlementRecords.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="p-8 text-center text-slate-400">
                        조회된 감사 상세 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredSettlementRecords.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono">{r.studentId}</td>
                        <td className="p-3 font-bold text-slate-800">{r.name}</td>
                        <td className="p-3">{r.department}</td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.role === 'MENTOR'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.role === 'MENTOR' ? '멘토' : '멘티'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{r.mentoringTitle}</td>
                        <td className="p-3 text-slate-500">{r.semester}학기</td>
                        <td className="p-3">{r.week}주차</td>
                        <td className="p-3 text-slate-400">{r.activityDate}</td>
                        <td className="p-3">{r.durationHours}h</td>
                        <td className="p-3">
                          {r.attended ? (
                            <span className="text-emerald-600 font-semibold">참석</span>
                          ) : (
                            <span className="text-rose-500 font-semibold">결석</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {r.role === 'MENTOR'
                            ? `${r.settlementAmount.toLocaleString()}원`
                            : `${r.settlementAmount}점`}
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {r.role === 'MENTOR' ? (r.bankName || '부산은행') : '-'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {r.role === 'MENTOR' ? (r.accountNumber || '112-2104-5678-01') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: 신규 신청서 승인/반려 관리 */}
      {adminViewMode === 'BY_APPLICATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[460px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>신규 멘티 신청서 승인 및 매칭</span>
                {pendingApplications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {pendingApplications.length}건 대기
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                정기모집 및 학기 중 추가모집으로 접수된 학생 신청서를 원클릭으로 승인/반려합니다.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {applications.length > 0 ? (
              <table className="w-full min-w-[850px] text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold">
                    <th className="p-3.5">신청자 정보</th>
                    <th className="p-3.5">지망 멘토링 (학기)</th>
                    <th className="p-3.5">신청 동기</th>
                    <th className="p-3.5">연락처</th>
                    <th className="p-3.5">신청일시</th>
                    <th className="p-3.5">상태</th>
                    <th className="p-3.5 text-center">관리 조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {applications.map((app) => {
                    const targetProg = programs.find((p) => p.id === app.mentoringId);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{app.applicantName}</div>
                          <div className="text-[11px] text-slate-400">
                            {app.studentId} · {app.department} {app.grade}학년
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {targetProg ? targetProg.title : '기타 멘토링'}
                          <span className="text-[11px] text-slate-400 block">
                            {app.semester || targetProg?.semester || '2026-1'}학기
                          </span>
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-xs text-slate-600">
                          {app.motivation || '-'}
                        </td>
                        <td className="p-3.5 text-xs text-slate-500">{app.phone}</td>
                        <td className="p-3.5 text-xs text-slate-400">{app.appliedAt}</td>
                        <td className="p-3.5">
                          {app.status === 'PENDING' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              승인 대기
                            </span>
                          )}
                          {app.status === 'APPROVED' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              승인 완료
                            </span>
                          )}
                          {app.status === 'REJECTED' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              반려됨
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {app.status === 'PENDING' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => approveApplication(app.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>승인</span>
                              </button>
                              <button
                                onClick={() => rejectApplication(app.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                <span>반려</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                접수된 신청 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Log Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400">
                  {selectedLog.semester}학기 · {selectedLog.week}주차 활동일지 검수
                </span>
                <h3 className="text-base font-bold">{selectedLog.topic}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  활동일: {selectedLog.activityDate} ({selectedLog.durationHours}시간) · 제출:{' '}
                  {selectedLog.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <div className="font-semibold text-slate-800 mb-2">현장 증빙 사진</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedLog.photoUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="현장 증빙"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-800 mb-2">활동 내용 3줄 요약</div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  {selectedLog.summary3Lines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-indigo-600">{idx + 1}.</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-800 mb-2">참석자 명단</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLog.attendees.map((att) => (
                    <span
                      key={att.studentId}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        att.attended
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                      }`}
                    >
                      {att.name} ({att.role === 'MENTOR' ? '멘토' : '멘티'})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
              >
                검수 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
