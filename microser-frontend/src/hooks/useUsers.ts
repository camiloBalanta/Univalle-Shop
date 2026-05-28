import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { useAuthStore } from '../store/auth.store';

export function useUsers() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['users'],
    queryFn: usersService.listUsers,
    enabled: Boolean(session?.token),
  });
}
