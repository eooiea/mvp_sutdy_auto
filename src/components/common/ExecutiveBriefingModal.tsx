import React from 'react';
import {
  X,
  FileCheck2,
  Clock,
  ArrowRight,
  Database,
  Smartphone,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAdminDemo: () => void;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  onTryAdminDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>송하주 원장님 및 행정실 담당 선생님 보고용 브리핑</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            SWIC 멘토링 행정 자동화 MVP 기획 요약
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            컴퓨터·인공지능공학부 3학년 / 운영지원 서포터즈 이명준
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-sm">
          {/* Section: 핵심 철학 */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 text-base mb-1 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <span>MVP의 본질: “새로운 서비스가 아닌, 행정실의 수기 고통을 없애는 도구”</span>
            </h3>
            <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
              화려한 기능 대신 <strong>‘신청 접수 ➔ 주차별 일지·사진 검수 ➔ 장학금 엑셀 정산’</strong>의
              모든 수기 병목을 단일 웹 파이프라인으로 통합하여, 교직원의 단순 행정 리소스를{' '}
              <strong className="underline decoration-blue-500 underline-offset-2">80% 이상 절감</strong>하고
              학생 데이터를 영구 자산화합니다.
            </p>
          </div>

          {/* Section: Before vs After 비교표 */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              기존 수기 행정 절차 vs SWIC 멘토링 자동화 비교
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Before */}
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-2">
                  <Clock className="w-4 h-4" />
                  <span>기존 방식 (수기 서류 반복)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-red-900">
                  <li>• 포털 공고 후 hwp 신청서 이메일 접수 (학생 이탈)</li>
                  <li>• 직원이 엑셀에 학생 인적사항 수기 타이핑</li>
                  <li>• 단톡방 수동 개설 및 매주 hwp 일지/사진 압축 취합</li>
                  <li>• 월말마다 활동시간·마일리지 수기 엑셀 계산 (4~5시간 소요)</li>
                </ul>
              </div>

              {/* After */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>SWIC 멘토링 (100% 자동화)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  <li>• <strong>모바일 1분 간편 신청</strong> (hwp 불필요)</li>
                  <li>• <strong>클릭 한 번으로 승인/매칭</strong> 완료</li>
                  <li>• 현장에서 <strong>폰으로 사진 찍고 3줄 일지</strong> 즉시 제출</li>
                  <li>• <strong>‘정산용 엑셀(CSV) 1클릭 다운로드’</strong>로 공문 즉시 기안</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section: 핵심 구현 3단계 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              핵심 구현 3단계 흐름 (실제 작동 검증 완료)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold mx-auto flex items-center justify-center text-xs mb-2">
                  1
                </div>
                <div className="font-semibold text-slate-900 text-xs">멘토링 공고 & 1분 신청</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  모아동 스타일 카드에서 원클릭 접수
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold mx-auto flex items-center justify-center text-xs mb-2">
                  2
                </div>
                <div className="font-semibold text-slate-900 text-xs">주차별 일지 & 사진 업로드</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  모바일 현장 3줄 요약 + 사진 등록
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold mx-auto flex items-center justify-center text-xs mb-2">
                  3
                </div>
                <div className="font-semibold text-slate-900 text-xs">정산용 엑셀(CSV) 다운로드</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  행정실 원클릭 공문 정산표 추출
                </div>
              </div>
            </div>
          </div>

          {/* Section: 실제 부경대 데이터 탑재 */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 flex items-start gap-3">
            <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">실제 데이터 기반 시연 (외부 네트워크 독립): </strong>
              현재 부경대학교 컴퓨터·인공지능공학부에서 진행 중인{' '}
              <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-700 font-semibold">
                PKNU_Algorithm_Study
              </code>
              와{' '}
              <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-emerald-700 font-semibold">
                NAN_Study
              </code>
              의 실제 커리큘럼, 멘토진(이명준, 하승민, 임승호, 김인환), 주차별 일지 및 더미 계좌 정보가 완비되어
              시연 중 외부 API 장애 없이 100% 매끄럽게 시연 가능합니다.
            </div>
          </div>

          {/* Section: 교수님 & 행정실 예상 질의 4대 핵심 답변 가이드 */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-blue-300 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <span>시연 브리핑 핵심 대응 4가지 (교수님·행정실 질의 방어)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-0.5">1. “학교에 이미 웨일비가 있는데?”</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  웨일비는 학기말 마일리지 승인 시스템이며, 본 MVP는 학기 중 매주 카톡/HWP로 수기 취합되던 일지와 사진을 웨일비/코러스에 1초 만에 복사-붙여넣기 좋게 정제하는 <strong>현장 수합 자동화 도구</strong>입니다.
                </p>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-0.5">2. “시급 단가 기준은 얼마인가?”</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  단가는 사업단 기존 지침인 <strong>15,000원</strong>에 맞추었으며, 행정실 대시보드 상단에서 예산 규정에 따라 즉시 12,000~20,000원으로 <strong>가변 설정</strong> 가능합니다.
                </p>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-0.5">3. “원장 직인 위조 우려는 없는가?”</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  임의 직인 출력을 원천 배제하고, 명칭을 <strong>[학생 취업 포트폴리오용 상세 활동 리포트]</strong>로 규정하여 검수 텍스트 뱃지만 부여하므로 법적 위조 리스크가 없습니다.
                </p>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-0.5">4. “정산 엑셀에 계좌가 비어있지 않나?”</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  신청 단계에서 학생 계좌를 등록받아, 엑셀 출력 시 <strong>[학번-이름-인정시간-지급액-은행-계좌번호]</strong>가 100% 채워진 상태로 즉시 공문 기안 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span>노트북 로컬에서 인터넷 없이도 100% 정상 작동합니다.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                onClose();
                onTryAdminDemo();
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>행정실 대시보드 바로 체험</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

