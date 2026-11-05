import React, { useState, useEffect } from 'react';
import { MentoringProvider, useMentoring } from './context/MentoringContext';
import { Header, NavType } from './components/Header';
import { MentoringList } from './components/student/MentoringList';
import { MentoringApplyModal } from './components/student/MentoringApplyModal';
import { ActivityLogModal } from './components/student/ActivityLogModal';
import { CurriculumModal } from './components/student/CurriculumModal';
import { MyActivityArchive } from './components/student/MyActivityArchive';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminCompletedArchive } from './components/admin/AdminCompletedArchive';
import { ExecutiveBriefingModal } from './components/common/ExecutiveBriefingModal';
import { MentoringProgram } from './types';

const MainAppContent: React.FC = () => {
  const { currentRole, setCurrentRole } = useMentoring();
  const [activeNav, setActiveNav] = useState<NavType>(
    currentRole === 'ADMIN' ? 'ADMIN' : 'CATALOG'
  );

  // Synchronize navigation on role change
  useEffect(() => {
    if (currentRole === 'ADMIN') {
      if (activeNav === 'MY_ARCHIVE') {
        setActiveNav('ADMIN');
      } else if (activeNav !== 'COMPLETED_ARCHIVE' && activeNav !== 'CATALOG') {
        setActiveNav('ADMIN');
      }
    } else {
      if (activeNav === 'ADMIN' || activeNav === 'COMPLETED_ARCHIVE') {
        setActiveNav('CATALOG');
      }
    }
  }, [currentRole]);

  // Modals state
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState(false);
  const [selectedProgramForApply, setSelectedProgramForApply] =
    useState<MentoringProgram | null>(null);
  const [selectedProgramForLog, setSelectedProgramForLog] =
    useState<MentoringProgram | null>(null);
  const [selectedProgramForCurriculum, setSelectedProgramForCurriculum] =
    useState<MentoringProgram | null>(null);

  const handleOpenAdminDemo = () => {
    setCurrentRole('ADMIN');
    setActiveNav('ADMIN');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Header
        onOpenExecutiveModal={() => setIsExecutiveModalOpen(true)}
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'ADMIN' || nav === 'COMPLETED_ARCHIVE') {
            setCurrentRole('ADMIN');
          } else if (nav === 'MY_ARCHIVE') {
            setCurrentRole('STUDENT');
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Student View: Mentoring Notices */}
        {activeNav === 'CATALOG' && (
          <MentoringList
            onApply={(p) => setSelectedProgramForApply(p)}
            onSubmitLog={(p) => setSelectedProgramForLog(p)}
            onViewCurriculum={(p) => setSelectedProgramForCurriculum(p)}
          />
        )}

        {/* Student View: My Activity & Certification Archive */}
        {activeNav === 'MY_ARCHIVE' && <MyActivityArchive />}

        {/* Admin View: Integrated Management Dashboard */}
        {activeNav === 'ADMIN' && <AdminDashboard />}

        {/* Admin View: Completed Mentoring by Semester */}
        {activeNav === 'COMPLETED_ARCHIVE' && <AdminCompletedArchive />}
      </main>

      {/* Floating Demo Role Indicator */}
      <div className="fixed bottom-4 right-4 z-30 max-w-sm hidden sm:block">
        <div className="bg-slate-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>
              현재 <strong>{currentRole === 'ADMIN' ? '행정실 관리자' : '학생'}</strong> 화면입니다.
            </span>
          </div>
          <button
            onClick={() => setIsExecutiveModalOpen(true)}
            className="text-amber-400 font-bold hover:underline shrink-0"
          >
            브리핑 보기
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            국립부경대학교 소프트웨어융합혁신원 · SW중심대학사업
          </p>
          <p>
            기획 및 프로토타입 구현: 컴퓨터·인공지능공학부 3학년 이명준 (운영지원 서포터즈)
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            기반 저장소:{' '}
            <a
              href="https://github.com/eooiea/PKNU_Algorithm_Study"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              PKNU_Algorithm_Study
            </a>{' '}
            ·{' '}
            <a
              href="https://github.com/eooiea/NAN_Study"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              NAN_Study
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <MentoringApplyModal
        program={selectedProgramForApply}
        isOpen={!!selectedProgramForApply}
        onClose={() => setSelectedProgramForApply(null)}
      />

      <ActivityLogModal
        program={selectedProgramForLog}
        isOpen={!!selectedProgramForLog}
        onClose={() => setSelectedProgramForLog(null)}
      />

      <CurriculumModal
        program={selectedProgramForCurriculum}
        isOpen={!!selectedProgramForCurriculum}
        onClose={() => setSelectedProgramForCurriculum(null)}
      />

      <ExecutiveBriefingModal
        isOpen={isExecutiveModalOpen}
        onClose={() => setIsExecutiveModalOpen(false)}
        onTryAdminDemo={handleOpenAdminDemo}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MentoringProvider>
      <MainAppContent />
    </MentoringProvider>
  );
};

export default App;
