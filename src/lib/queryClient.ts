import { QueryClient } from '@tanstack/react-query';

export const STALE_TIMES = {
  static: Infinity,
  frequent: 5 * 60 * 1000,
  moderate: 10 * 60 * 1000,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: STALE_TIMES.frequent,
    },
  },
});
