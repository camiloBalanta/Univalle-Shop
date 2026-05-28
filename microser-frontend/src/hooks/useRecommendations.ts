import { useQuery } from '@tanstack/react-query';
import { recommendationsService } from '../services/recommendations.service';
import { useAuthStore } from '../store/auth.store';

export function useRecommendations() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['recommendations', session?.userId],
    queryFn: async () => {
      if (!session?.userId) {
        throw new Error('El usuario no está autenticado');
      }
      return recommendationsService.fetchByUser(session.userId);
    },
    enabled: Boolean(session?.token && session?.userId),
    staleTime: 1000 * 60 * 5,
  });
}
