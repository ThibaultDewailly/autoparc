import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as insuranceService from './insuranceService'
import * as api from './api'

vi.mock('./api')

describe('insuranceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getInsuranceCompanies', () => {
    it('should fetch all insurance companies', async () => {
      const mockCompanies = [
        {
          id: '1',
          name: 'AXA Assurance',
          contact_person: 'Jean Dupont',
          phone: '0123456789',
          email: 'contact@axa.fr',
          policy_number: 'POL123',
          is_active: true,
        },
        {
          id: '2',
          name: 'Allianz France',
          contact_person: 'Marie Martin',
          phone: '0987654321',
          email: 'contact@allianz.fr',
          policy_number: 'POL456',
          is_active: true,
        },
      ]
      
      vi.mocked(api.apiGet).mockResolvedValue(mockCompanies)

      const result = await insuranceService.getInsuranceCompanies()

      expect(api.apiGet).toHaveBeenCalledWith('/insurance-companies')
      expect(result).toEqual(mockCompanies)
    })
  })
})
