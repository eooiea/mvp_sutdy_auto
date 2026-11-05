import React, { useState } from 'react';
import { MentoringProgram } from '../../types';
import { useMentoring } from '../../context/MentoringContext';
import { validateActivityLog } from '../../utils/validation';
import {
  X,
  Camera,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Sparkles,
  FileUp,
} from 'lucide-react';

interface ActivityLogModalProps {
  program: MentoringProgram | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  program,
  isOpen,
  onClose,
}) => {
  const { submitActivityLog } = useMentoring();

  const [week, setWeek] = useState<number>(5);
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [durationHours, setDurationHours] = useState<number>(2);
  const [topic, setTopic] = useState<string>('');
  const [summary1, setSummary1] = useState<string>('');
  const [summary2, setSummary2] = useState<string>('');
  const [summary3, setSummary3] = useState<string>('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
  ]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Attendees list based on program mentor and default mentees
  const [attendees, setAttendees] = useState([
    { studentId: program?.mentor.studentId || '20241001', name: program?.mentor.name || '이명준', role: 'MENTOR' as const, attended: true },
    { studentId: '20241003', name: '김동현', role: 'MENTEE' as const, attended: true },
    { studentId: '20241004', name: '정유진', role: 'MENTEE' as const, attended: true },
    { studentId: '20241005', name: '송민호', role: 'MENTEE' as const, attended: true },
  ]);

  if (!isOpen || !program) return null;

  const handleQuickFill = () => {
    setWeek(5);
    setTopic('DP(동적 계획법) & 그리디 알고리즘 심화');
    setSummary1('메모이제이션(Top-Down)과 반복문(Bottom-Up) 차이점 설명 및 피보나치 수열 실습');
    setSummary2('백준 12865번(평범한 배낭) 2차원 DP 테이블 상태 전이 다이어그램 작성');
    setSummary3('그리디 알고리즘 최적 부분 구조(Optimal Substructure) 만족 조건 토론');
    setDurationHours(2);
    setPhotoUrls([
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
    ]);
  };

  const handleToggleAttendee = (index: number) => {
    setAttendees((prev) =>
      prev.map((att, i) => (i === index ? { ...att, attended: !att.attended } : att))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateActivityLog({
      topic,
      activityDate,
      durationHours,
      summary3Lines: [summary1, summary2, summary3],
      hasAttendees: attendees.some((a) => a.attended),
      hasPhoto: photoUrls.length > 0,
    });

    if (!validation.isValid) {
      setErrorMsg(validation.error || '입력값을 확인해주세요.');
      return;
    }

    submitActivityLog(program.id, {
      semester: program.semester || '2026-1',
      week,
      activityDate,
      durationHours,
      topic,
      summary3Lines: [summary1, summary2, summary3],
      attendees,
      photoUrls,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-950 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              모바일 현장 일지 작성
            </span>
            <span className="text-xs text-indigo-300">HWP 파일 작성·출력 불필요</span>
          </div>
          <h2 className="text-lg font-bold truncate pr-6">{program.title}</h2>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {week}주차 활동일지가 행정실에 제출되었습니다!
            </h3>
            <p className="text-xs text-slate-500">
              행정실 대시보드 현황 매트릭스에 즉시 반영되며, 장학금 정산 데이터로 연동됩니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
            {/* Quick Demo Fill */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                현장 모바일 3분 작성 양식
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>시연용 자동 완성</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Week & Date & Duration */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  진행 주차 *
                </label>
                <select
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium"
                >
                  {Array.from({ length: program.totalWeeks }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      {w}주차
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>활동 일자 *</span>
                </label>
                <input
                  type="date"
                  required
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>활동 시간 (h) *</span>
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                >
                  <option value={1}>1시간</option>
                  <option value={2}>2시간 (정규)</option>
                  <option value={3}>3시간</option>
                </select>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이번 주차 활동 주제 *
              </label>
              <input
                type="text"
                required
                placeholder="예: Recursion과 백트래킹 실습"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
              />
            </div>

            {/* Attendance Checkbox List */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>참석 인원 체크 (출석부) *</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {attendees.map((att, idx) => (
                  <label
                    key={att.studentId}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      att.attended
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={att.attended}
                      onChange={() => handleToggleAttendee(idx)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">
                      {att.name} ({att.role === 'MENTOR' ? '멘토' : '멘티'})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3-line Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                활동 내용 3줄 요약 (행정실 검수용) *
              </label>
              <input
                type="text"
                placeholder="1. 학습 내용: (예: 기저조건과 분할정복 알고리즘 원리 학습)"
                value={summary1}
                onChange={(e) => setSummary1(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
              />
              <input
                type="text"
                placeholder="2. 실습 진행: (예: 백준 N-Queen 백트래킹 코드 작성 및 1:1 디버깅)"
                value={summary2}
                onChange={(e) => setSummary2(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
              />
              <input
                type="text"
                placeholder="3. 차주 과제: (예: 동적 계획법 사전 자료 배포 및 3개 문제 예습 공지)"
                value={summary3}
                onChange={(e) => setSummary3(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
              />
            </div>

            {/* Photo Upload & Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>활동 증빙 사진 (1~2장) *</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  모바일 촬영 즉시 첨부
                </span>
              </label>

              <div className="flex gap-2 items-center">
                {photoUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group shadow-2xs"
                  >
                    <img src={url} alt="증빙" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrls((prev) => [
                      ...prev,
                      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60',
                    ])
                  }
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <FileUp className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">+ 사진 추가</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>일지 제출 완료 (행정실 자동 전송)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

