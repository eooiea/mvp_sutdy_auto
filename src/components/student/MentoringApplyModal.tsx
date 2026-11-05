import React, { useState } from 'react';
import { MentoringProgram, PARTICIPATING_DEPARTMENTS } from '../../types';
import { useMentoring } from '../../context/MentoringContext';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';

interface MentoringApplyModalProps {
  program: MentoringProgram | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MentoringApplyModal: React.FC<MentoringApplyModalProps> = ({
  program,
  isOpen,
  onClose,
}) => {
  const { applyMentoring } = useMentoring();

  const [formData, setFormData] = useState({
    applicantName: '',
    studentId: '',
    department: '언론정보전공',
    grade: 1,
    phone: '',
    email: '',
    motivation: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !program) return null;

  const handleQuickFill = () => {
    setFormData({
      applicantName: '김부경',
      studentId: '20261199',
      department: '언론정보전공',
      grade: 1,
      phone: '010-9876-5432',
      email: 'pknu_media@pknu.ac.kr',
      motivation: '비전공자이지만 융합 멘토링을 통해 코딩과 데이터 기초를 탄탄히 다지고 싶어 지원했습니다!',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.studentId || !formData.phone) {
      alert('이름, 학번, 연락처는 필수 입력 항목입니다.');
      return;
    }

    applyMentoring(program.id, formData);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-1">
            간편 신청 폼 (22개 참여학과 공통)
          </span>
          <h2 className="text-lg font-bold truncate pr-6">{program.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            멘토: {program.mentor.name} ({program.mentor.department})
          </p>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">신청서가 정상 접수되었습니다!</h3>
            <p className="text-xs text-slate-500">
              행정실 및 멘토의 확인 후 승인 처리가 완료되면 카카오톡 알림톡이 전송됩니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            {/* Quick Demo Fill Button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-500">신청자 인적사항 입력</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>시연용 자동 입력</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학번 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 20261234"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  소속 참여학과 (22개 전공) *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                >
                  {PARTICIPATING_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학년 *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                >
                  <option value={1}>1학년</option>
                  <option value={2}>2학년</option>
                  <option value={3}>3학년</option>
                  <option value={4}>4학년</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  연락처 (휴대폰) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학교 웹메일
                </label>
                <input
                  type="email"
                  placeholder="id@pknu.ac.kr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                신청 각오 및 기대하는 점 (1~2줄)
              </label>
              <textarea
                rows={2}
                placeholder="배우고 싶은 내용이나 참여 각오를 간단히 적어주세요."
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-xs shadow-blue-500/20 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>1분 신청 완료하기</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
