import React, { useState, useMemo } from 'react';
import { useMentoring } from '../../context/MentoringContext';
import { MentoringProgram, CategoryType, PARTICIPATING_DEPARTMENTS } from '../../types';
import { MentoringCard } from './MentoringCard';
import { Search, Filter, RotateCcw, GraduationCap } from 'lucide-react';

interface MentoringListProps {
  onApply: (program: MentoringProgram) => void;
  onSubmitLog: (program: MentoringProgram) => void;
  onViewCurriculum: (program: MentoringProgram) => void;
}

export const MentoringList: React.FC<MentoringListProps> = ({
  onApply,
  onSubmitLog,
  onViewCurriculum,
}) => {
  const { programs } = useMentoring();

  // Tier 1: Main Campus Lifecycle Category
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');

  // Tier 2: Search & Detailed Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECRUITING' | 'ADDITIONAL' | 'ACTIVE'>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');

  const categories: { key: CategoryType; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'FRESHMAN_BASIC', label: '새내기·비전공 첫걸음' },
    { key: 'MAJOR_STUDY', label: '전공 역량·학점 스터디' },
    { key: 'PROJECT_CONTEST', label: '공모전·융합 프로젝트' },
    { key: 'CAREER_CERT', label: '코테·취업·자격증' },
  ];

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      // Exclude COMPLETED programs from active student recruitment catalog
      if (p.status === 'COMPLETED') {
        return false;
      }

      // Category match
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Semester match
      if (selectedSemester !== 'ALL' && p.semester !== selectedSemester) {
        return false;
      }

      // Status match
      if (statusFilter === 'RECRUITING' && (p.status !== 'RECRUITING' || p.recruitmentType === 'ADDITIONAL')) {
        return false;
      }
      if (statusFilter === 'ADDITIONAL' && (p.status !== 'RECRUITING' || p.recruitmentType !== 'ADDITIONAL')) {
        return false;
      }
      if (statusFilter === 'ACTIVE' && p.status !== 'ACTIVE') {
        return false;
      }

      // Department filter match
      if (selectedDepartment !== 'ALL') {
        const matchesDept =
          p.targetAudience.includes(selectedDepartment) ||
          p.mentor.department.includes(selectedDepartment) ||
          p.tags.some((t) => t.includes(selectedDepartment));
        if (!matchesDept) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.mentor.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [programs, selectedCategory, selectedSemester, statusFilter, selectedDepartment, searchQuery]);

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    statusFilter !== 'ALL' ||
    selectedSemester !== 'ALL' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedDepartment('ALL');
    setStatusFilter('ALL');
    setSelectedSemester('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>SW중심대학 참여 22개 학과 전체 지원</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            선후배가 함께하는 대학생 멘토링
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            새내기 코딩 기초부터 전공 학점 스터디, 다학제 융합 공모전 및 취업 준비까지 수준별 멘토링을 탐색하고 간편하게 신청하세요.
          </p>
        </div>
      </div>

      {/* Scalable 2-Tier Filter Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Tier 1: Main Campus Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tier 2: Search & Detailed Sub-filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주제, 멘토 이름, 태그 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Right: Department Dropdown + Status Pills + Semester Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Dropdown (22 participating departments) */}
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">전체 추천학과 (22개 전공)</option>
                {PARTICIPATING_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">전체 학기</option>
              <option value="2026-1">2026-1학기</option>
              <option value="2025-1">2025-1학기</option>
            </select>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter('RECRUITING')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'RECRUITING'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                정기모집
              </button>
              <button
                onClick={() => setStatusFilter('ADDITIONAL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ADDITIONAL'
                    ? 'bg-white text-amber-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                추가모집
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                활동중
              </button>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="모든 필터 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrograms.map((prog) => (
            <MentoringCard
              key={prog.id}
              program={prog}
              onApply={onApply}
              onSubmitLog={onSubmitLog}
              onViewCurriculum={onViewCurriculum}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">해당 조건에 맞는 멘토링 공고가 없습니다.</p>
          <button
            onClick={handleResetFilters}
            className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
          >
            모든 필터 초기화
          </button>
        </div>
      )}
    </div>
  );
};
