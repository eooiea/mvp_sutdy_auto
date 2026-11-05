import React from 'react';
import { useMentoring } from '../context/MentoringContext';
import {
  GraduationCap,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';

export type NavType = 'CATALOG' | 'ADMIN' | 'MY_ARCHIVE' | 'COMPLETED_ARCHIVE';

interface HeaderProps {
  onOpenExecutiveModal: () => void;
  activeNav: NavType;
  setActiveNav: (nav: NavType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExecutiveModal,
  activeNav,
  setActiveNav,
}) => {
  const { currentRole, toggleRole, resetToInitialData, applications } = useMentoring();
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  SWIC 멘토링 허브
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                국립부경대학교 소프트웨어융합혁신원 행정 간소화 파이프라인
              </p>
            </div>
          </div>

          {/* Navigation Pills (Role-dependent) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {currentRole === 'STUDENT' ? (
              <>
                {/* Student Nav 1: Mentoring Catalog */}
                <button
                  onClick={() => setActiveNav('CATALOG')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeNav === 'CATALOG'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>멘토링 공고</span>
                </button>

                {/* Student Nav 2: My Personal Portfolio & Activity Proof */}
                <button
                  onClick={() => setActiveNav('MY_ARCHIVE')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeNav === 'MY_ARCHIVE'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>나의 활동 증빙</span>
                </button>
              </>
            ) : (
              <>
                {/* Admin Nav 1: Admin Dashboard */}
                <button
                  onClick={() => setActiveNav('ADMIN')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                    activeNav === 'ADMIN'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>행정실 대시보드</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>

                {/* Admin Nav 2: Completed Programs by Semester */}
                <button
                  onClick={() => setActiveNav('COMPLETED_ARCHIVE')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeNav === 'COMPLETED_ARCHIVE'
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>학기별 완료 멘토링</span>
                </button>

                {/* Admin Nav 3: Student Notice Preview */}
                <button
                  onClick={() => setActiveNav('CATALOG')}
                  className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeNav === 'CATALOG'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>공고 미리보기</span>
                </button>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Executive Briefing Button */}
            <button
              onClick={onOpenExecutiveModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">원장님 건의 브리핑</span>
              <span className="sm:hidden">브리핑</span>
            </button>

            {/* Quick Role Switcher Toggle */}
            <button
              onClick={toggleRole}
              title="클릭하여 학생 화면과 행정실 관리자 화면을 전환합니다"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                currentRole === 'ADMIN'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">현재 모드:</span>
              <span className="font-bold">
                {currentRole === 'ADMIN' ? '행정실' : '학생'}
              </span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (confirm('시연용 데이터를 처음 상태로 복원하시겠습니까?')) {
                  resetToInitialData();
                }
              }}
              title="시연 데이터 초기화"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
