import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as accidentService from './accidentService'
import * as api from './api'

vi.mock('./api')

// Mock fetch globally
global.fetch = vi.fn()

describe('accidentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAccidents', () => {
    it('should fetch accidents without parameters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await accidentService.getAccidents()

      expect(api.apiGet).toHaveBeenCalledWith('/accidents')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch accidents with pagination', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 2, limit: 10 })

      await accidentService.getAccidents({ page: 2, limit: 10 })

      expect(api.apiGet).toHaveBeenCalledWith('/accidents?page=2&limit=10')
    })

    it('should fetch accidents with car filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await accidentService.getAccidents({ carId: 'car-123' })

      expect(api.apiGet).toHaveBeenCalledWith('/accidents?car_id=car-123')
    })

    it('should fetch accidents with status filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await accidentService.getAccidents({ status: 'declared' })

      expect(api.apiGet).toHaveBeenCalledWith('/accidents?status=declared')
    })

    it('should fetch accidents with date range', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await accidentService.getAccidents({ 
        startDate: '2026-01-01', 
        endDate: '2026-01-31' 
      })

      expect(api.apiGet).toHaveBeenCalledWith('/accidents?start_date=2026-01-01&end_date=2026-01-31')
    })

    it('should fetch accidents with all parameters', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await accidentService.getAccidents({ 
        page: 2, 
        limit: 15, 
        carId: 'car-123',
        status: 'under_review',
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      })

      expect(api.apiGet).toHaveBeenCalledWith('/accidents?page=2&limit=15&car_id=car-123&status=under_review&start_date=2026-01-01&end_date=2026-01-31')
    })
  })

  describe('getAccident', () => {
    it('should fetch a single accident by id', async () => {
      const mockAccident = {
        id: '123',
        carId: 'car-123',
        accidentDate: '2026-01-15T10:30:00Z',
        location: 'Paris',
        description: 'Accident description',
        status: 'declared' as const,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockAccident)

      const result = await accidentService.getAccident('123')

      expect(api.apiGet).toHaveBeenCalledWith('/accidents/123')
      expect(result).toEqual(mockAccident)
    })
  })

  describe('getAccidentsByCar', () => {
    it('should fetch accidents for a specific car', async () => {
      const mockAccidents = [
        { id: '1', carId: 'car-123', status: 'declared' },
        { id: '2', carId: 'car-123', status: 'approved' },
      ]
      
      vi.mocked(api.apiGet).mockResolvedValue({ data: mockAccidents, page: 1, limit: 20 })

      const result = await accidentService.getAccidentsByCar('car-123')

      expect(api.apiGet).toHaveBeenCalledWith('/accidents?car_id=car-123')
      expect(result).toEqual(mockAccidents)
    })

    it('should return empty array if no data', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ page: 1, limit: 20 })

      const result = await accidentService.getAccidentsByCar('car-123')

      expect(result).toEqual([])
    })
  })

  describe('createAccident', () => {
    it('should create a new accident', async () => {
      const accidentData = {
        carId: 'car-123',
        accidentDate: '2026-01-15T10:30:00Z',
        location: 'Paris',
        description: 'Collision avec un autre véhicule',
        damagesDescription: 'Pare-choc avant endommagé',
      }
      
      const mockCreatedAccident = {
        id: '123',
        ...accidentData,
        status: 'declared' as const,
        createdAt: '2026-01-29T10:00:00Z',
        updatedAt: '2026-01-29T10:00:00Z',
        createdBy: 'user-123',
      }
      
      vi.mocked(api.apiPost).mockResolvedValue(mockCreatedAccident)

      const result = await accidentService.createAccident(accidentData)

      expect(api.apiPost).toHaveBeenCalledWith('/accidents', accidentData)
      expect(result).toEqual(mockCreatedAccident)
    })
  })

  describe('updateAccident', () => {
    it('should update an accident', async () => {
      const updateData = {
        description: 'Updated description',
        damagesDescription: 'Updated damages',
      }
      
      vi.mocked(api.apiPut).mockResolvedValue({ id: '123', ...updateData })

      const result = await accidentService.updateAccident('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/accidents/123', updateData)
      expect(result).toEqual({ id: '123', ...updateData })
    })
  })

  describe('deleteAccident', () => {
    it('should delete an accident', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await accidentService.deleteAccident('123')

      expect(api.apiDelete).toHaveBeenCalledWith('/accidents/123')
    })
  })

  describe('updateAccidentStatus', () => {
    it('should update accident status', async () => {
      const mockUpdatedAccident = {
        id: '123',
        status: 'under_review' as const,
      }
      
      vi.mocked(api.apiPut).mockResolvedValue(mockUpdatedAccident)

      const result = await accidentService.updateAccidentStatus('123', 'under_review')

      expect(api.apiPut).toHaveBeenCalledWith('/accidents/123/status', { status: 'under_review' })
      expect(result).toEqual(mockUpdatedAccident)
    })
  })

  describe('uploadPhoto', () => {
    it('should upload a photo', async () => {
      const file = new File(['photo content'], 'photo.jpg', { type: 'image/jpeg' })
      const mockPhoto = {
        id: 'photo-123',
        accidentId: 'accident-123',
        filename: 'photo.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        uploadedAt: '2026-01-29T10:00:00Z',
        uploadedBy: 'user-123',
      }
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPhoto),
      }
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any)

      const result = await accidentService.uploadPhoto('accident-123', file, 'Test photo')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/accidents/accident-123/photos',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
      expect(result).toEqual(mockPhoto)
    })

    it('should handle upload error', async () => {
      const file = new File(['photo content'], 'photo.jpg', { type: 'image/jpeg' })
      
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Upload failed' }),
      }
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any)

      await expect(accidentService.uploadPhoto('accident-123', file)).rejects.toThrow('Upload failed')
    })
  })

  describe('getPhotos', () => {
    it('should fetch photos for an accident', async () => {
      const mockPhotos = [
        { id: 'photo-1', accidentId: 'accident-123', filename: 'photo1.jpg' },
        { id: 'photo-2', accidentId: 'accident-123', filename: 'photo2.jpg' },
      ]
      
      vi.mocked(api.apiGet).mockResolvedValue(mockPhotos)

      const result = await accidentService.getPhotos('accident-123')

      expect(api.apiGet).toHaveBeenCalledWith('/accidents/accident-123/photos')
      expect(result).toEqual(mockPhotos)
    })
  })

  describe('getPhoto', () => {
    it('should fetch a photo as blob', async () => {
      const mockBlob = new Blob(['photo data'], { type: 'image/jpeg' })
      
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      }
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any)

      const result = await accidentService.getPhoto('accident-123', 'photo-123')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/accidents/accident-123/photos/photo-123',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      )
      expect(result).toEqual(mockBlob)
    })

    it('should handle fetch error', async () => {
      const mockResponse = {
        ok: false,
      }
      
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as any)

      await expect(accidentService.getPhoto('accident-123', 'photo-123')).rejects.toThrow('Erreur lors du téléchargement de la photo')
    })
  })

  describe('deletePhoto', () => {
    it('should delete a photo', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await accidentService.deletePhoto('accident-123', 'photo-123')

      expect(api.apiDelete).toHaveBeenCalledWith('/accidents/accident-123/photos/photo-123')
    })
  })
})
