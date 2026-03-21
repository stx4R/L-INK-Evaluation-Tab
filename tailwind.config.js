@tailwind base;
@tailwind components;
@tailwind utilities;

/* 폰트 및 기본 스타일 설정 */
@layer base {
  body {
    @apply antialiased text-slate-900 bg-slate-50;
    /* 토스 느낌의 깔끔한 폰트 설정 */
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
}

/* 토스 스타일의 부드러운 컴포넌트 공통 스타일 */
@layer components {
  .toss-card {
    @apply bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8;
  }
  
  .toss-button {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-sm;
  }

  .toss-input {
    @apply w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all;
  }
}

/* 스크롤바 커스텀 (가독성을 위해 슬림하게) */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-200 dark:bg-slate-700 rounded-full;
}