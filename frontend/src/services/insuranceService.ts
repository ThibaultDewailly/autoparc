import { apiGet } from './api'
import type { InsuranceCompany } from '@/types'

export async function getInsuranceCompanies(): Promise<InsuranceCompany[]> {
  return apiGet<InsuranceCompany[]>('/insurance-companies')
}
