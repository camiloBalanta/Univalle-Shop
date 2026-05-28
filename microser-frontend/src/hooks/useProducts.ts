import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { searchService } from '../services/search.service';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: catalogService.listProducts,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogService.getProduct(id || ''),
    enabled: Boolean(id),
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.searchProducts({ q: query }),
  });
}
