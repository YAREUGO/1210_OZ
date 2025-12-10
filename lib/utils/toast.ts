/**
 * @file toast.ts
 * @description Toast 알림 유틸리티 함수
 *
 * sonner를 사용한 토스트 알림을 쉽게 사용할 수 있는 헬퍼 함수들
 *
 * 사용 예시:
 * ```tsx
 * import { toast } from '@/lib/utils/toast';
 *
 * toast.success('성공적으로 저장되었습니다!');
 * toast.error('오류가 발생했습니다.');
 * ```
 *
 * @dependencies
 * - sonner: toast 라이브러리
 */

import { toast as sonnerToast } from "sonner";

/**
 * 성공 토스트
 */
export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    return sonnerToast.success(message, options);
  },
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    return sonnerToast.error(message, options);
  },
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    return sonnerToast.info(message, options);
  },
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    return sonnerToast.warning(message, options);
  },
  loading: (message: string, options?: Parameters<typeof sonnerToast.loading>[1]) => {
    return sonnerToast.loading(message, options);
  },
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },
};

