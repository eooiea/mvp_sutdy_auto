import React, { useState } from 'react';
import { useMentoring } from '../../context/MentoringContext';
import { getStudentParticipations } from '../../utils/adminAnalytics';
import {
  FileText,
  Calendar,
  Clock,
  Printer,
  X,
  GraduationCap,
  Award,
  CheckCircle2,
} from 'lucide-react';

export const MyActivityArchive: React.FC = () => {
  const { programs, activityLogs } = useMentoring();

  // Selected student for demo viewing (defaults to Lee Myung-joon)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('20241001');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MENTOR' | 'MENTEE'>('ALL');
  const [certificateProgramId, setCertificateProgramId] = useState<string | null>(null);

  const studentProfiles = [
    {
      id: '20241001',
      name: '이명준',
      department: '컴퓨터·인공지능공학부',
      grade: 3,
      desc: '알고리즘 & NAN 멘토 (서포터즈)',
    },
    {
      id: '20241003',
      name: '김동현',
      department: '컴퓨터·인공지능공학부',
      grade: 2,
      desc: '2026-1 알고리즘 멘티',
    },
    {
      id: '20221401',
      name: '박세진',
      department: '통계·데이터사이언스전공',
      grade: 4,
      desc: '2025-2 빅데이터 분석 멘토',
    },
    {
      id: '20211508',
      name: '조현우',
      department: '위성정보융합공학전공',
      grade: 4,
      desc: '2025-2 위성AI 융합 멘토',
    },
    {
      id: '20251101',
      name: '윤하은',
      department: '인공지능공학과',
      grade: 1,
      desc: '2025-1 NAN 기초 코딩 멘티',
    },
    {
      id: '20231551',
      name: '장서현',
      department: '식품공학전공',
      grade: 3,
      desc: '2025-2 빅데이터 분석 멘티',
    },
  ];

  const currentProfile =
    studentProfiles.find((s) => s.id === selectedStudentId) || studentProfiles[0];

  const participations = getStudentParticipations(selectedStudentId, programs, activityLogs);

  const filteredParticipations = participations.filter((p) => {
    if (roleFilter === 'ALL') return true;
    return p.role === roleFilter;
  });

  const totalHours = participations.reduce((sum, p) => sum + p.totalHours, 0);
  const totalPrograms = participations.length;

  const certificateTarget = participations.find((p) => p.mentoringId === certificateProgramId);
  const certificateProg = programs.find((p) => p.id === certificateProgramId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Demo Student Switcher (공고 배너와 완전 동일한 크기/패딩) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 min-h-[190px] flex flex-col justify-center">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>학생 개인별 포트폴리오 및 공식 증빙 보관함</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              나의 멘토링 활동 이력 및 증빙
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              멘토 및 멘티로 참여한 모든 스터디의 주차별 일지와 활동시간이 기록되며, 장학금 신청이나 취업 포트폴리오용 활동 확인서를 즉시 발급받을 수 있습니다.
            </p>
          </div>

          {/* Quick Student Switcher for Demo */}
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 text-xs space-y-1.5 self-start md:self-auto min-w-[220px]">
            <span className="text-[11px] text-slate-400 font-semibold block">
              시연용 학생 계정 선택:
            </span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 text-white border border-slate-600 rounded-lg focus:outline-hidden font-medium"
            >
              {studentProfiles.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.id} · {st.desc})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">참여 학생 정보</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {currentProfile.name} ({currentProfile.id})
            </div>
            <div className="text-xs text-slate-500">{currentProfile.department} {currentProfile.grade}학년</div>
          </div>
          <GraduationCap className="w-8 h-8 text-blue-600" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">누적 멘토링 참여</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">총 {totalPrograms}개 프로그램</div>
            <div className="text-xs text-blue-600 font-semibold">
              멘토 {participations.filter((p) => p.role === 'MENTOR').length}개 · 멘티{' '}
              {participations.filter((p) => p.role === 'MENTEE').length}개
            </div>
          </div>
          <Award className="w-8 h-8 text-indigo-600" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">누적 인정 활동시간</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{totalHours}시간</div>
            <div className="text-xs text-emerald-600 font-semibold">혁신원 공인 수료 시간</div>
          </div>
          <Clock className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Filter Tabs: 전체 | 멘토 활동 | 멘티 활동 */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-600 pl-2">역할별 조회:</span>
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            roleFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          전체 활동 ({participations.length})
        </button>
        <button
          onClick={() => setRoleFilter('MENTOR')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            roleFilter === 'MENTOR'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          멘토로 활동한 내역 ({participations.filter((p) => p.role === 'MENTOR').length})
        </button>
        <button
          onClick={() => setRoleFilter('MENTEE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            roleFilter === 'MENTEE'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          멘티로 참여한 내역 ({participations.filter((p) => p.role === 'MENTEE').length})
        </button>
      </div>

      {/* Participated Mentoring Cards */}
      <div className="space-y-4">
        {filteredParticipations.length > 0 ? (
          filteredParticipations.map((part) => (
            <div
              key={part.mentoringId}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {part.role === 'MENTOR' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-2xs">
                        멘토 활동
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                        멘티 참여
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500">
                      {part.semester}학기
                    </span>
                    <span className="text-xs font-semibold text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-600">
                      {part.status === 'COMPLETED' ? '수료 완료' : '현재 활동중'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{part.mentoringTitle}</h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="text-right text-xs mr-2">
                    <span className="text-slate-400 block">출석 회차 / 활동시간</span>
                    <span className="font-bold text-slate-800">
                      {part.attendedWeeks}회 출석 · 총 {part.totalHours}시간
                    </span>
                  </div>
                  <button
                    onClick={() => setCertificateProgramId(part.mentoringId)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>포트폴리오 리포트 발급</span>
                  </button>
                </div>
              </div>

              {/* Weekly Activity Logs Grid (증빙 사진 및 3줄 요약) */}
              <div className="p-5">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>제출된 주차별 활동일지 및 증빙 사진 ({part.logs.length}건 등록)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {part.logs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        {log.photoUrls[0] && (
                          <img
                            src={log.photoUrls[0]}
                            alt="현장 증빙"
                            className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-100"
                          />
                        )}
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>{log.week}주차</span>
                          <span className="text-slate-400">{log.activityDate}</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">
                          {log.topic}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {log.summary3Lines[0]}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{log.durationHours}시간 활동</span>
                        <span className="text-emerald-600 font-semibold">승인 완료</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            선택된 조건에 해당하는 활동 이력이 없습니다.
          </div>
        )}
      </div>

      {/* Student Portfolio Activity Report Modal (학생 취업 포트폴리오용 상세 활동 리포트) */}
      {certificateTarget && certificateProg && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                학생 취업 포트폴리오용 상세 활동 리포트
              </span>
              <button
                onClick={() => setCertificateProgramId(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Portfolio Activity Report Paper View */}
            <div className="p-8 space-y-6 text-slate-800 bg-[#fdfdfd]">
              <div className="text-center space-y-2 pb-4 border-b-2 border-slate-900">
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Student Portfolio Mentoring Activity Report
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  멘토링 활동 상세 리포트
                </h2>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>행정실 검수 완료 / 인증코드: PKNU-SW-2026-01</span>
                  </span>
                </div>
              </div>

              {/* Student and Program Info Table */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-xs block">성명 / 학번</span>
                    <strong className="text-slate-900">
                      {currentProfile.name} ({currentProfile.id})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">소속 학과</span>
                    <strong className="text-slate-900">{currentProfile.department}</strong>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">프로그램명</span>
                    <span className="font-bold text-slate-900">
                      {certificateTarget.mentoringTitle}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">수행 역할</span>
                    <span className="font-bold text-blue-700">
                      {certificateTarget.role === 'MENTOR' ? '공인 멘토 (Mentor)' : '멘티 (Mentee)'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">활동 학기 / 기간</span>
                    <span className="text-slate-800">{certificateProg.period}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">총 인정 활동시간</span>
                    <span className="font-extrabold text-slate-900">
                      총 {certificateTarget.totalHours}시간 ({certificateTarget.attendedWeeks}회차 출석 완수)
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <p className="text-center text-xs sm:text-sm text-slate-600 pt-3 leading-relaxed">
                본 리포트는 국립부경대학교 소프트웨어융합혁신원 SW중심대학사업 멘토링 활동 관리 시스템에 등록된 주차별 출석 및 활동 내역을 바탕으로 전산 추출되었습니다.
              </p>

              {/* Legal Disclaimer Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 text-center leading-relaxed">
                ※ 본 문서는 학생 이력서, 취업 포트폴리오 및 GitHub 첨부용 상세 활동 내역서입니다. 법적 효력을 갖는 공식 증명서는 학기 종료 후 대학 포털(웨일비/통합학사정보시스템)을 통해 정식 발급됩니다.
              </div>

              {/* Date & System Verification Notice */}
              <div className="text-center pt-2 space-y-1">
                <div className="text-xs text-slate-400">
                  발급일시: {new Date().toISOString().slice(0, 10)} (전산 자동 발급)
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  국립부경대학교 소프트웨어융합혁신원 SW중심대학사업단
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                문서 확인번호: SWIC-2026-M{selectedStudentId.slice(-4)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCertificateProgramId(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  닫기
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄 / PDF 저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

