import { useQuery } from '@tanstack/react-query'
import * as insuranceService from '@/services/insuranceService'

export function useInsuranceCompanies() {
  return useQuery({
    queryKey: ['insurance-companies'],
    queryFn: insuranceService.getInsuranceCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
