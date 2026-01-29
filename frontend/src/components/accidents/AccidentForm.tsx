import { useState, useEffect } from 'react'
import { Input, Textarea, Button, Select, SelectItem } from '@nextui-org/react'
import { FRENCH_LABELS } from '@/utils/constants'
import { validateImage, resizeImage } from '@/utils/imageUtils'
import { formatDateForInput, isNotInFuture } from '@/utils/dateUtils'
import type { Accident, Car } from '@/types'
import type { CreateAccidentRequest, UpdateAccidentRequest } from '@/types'

interface AccidentFormProps {
  accident?: Accident
  cars: Car[]
  onSubmit: (data: CreateAccidentRequest | UpdateAccidentRequest, photos?: File[]) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AccidentForm({ accident, cars, onSubmit, onCancel, isLoading }: AccidentFormProps) {
  const [formData, setFormData] = useState({
    carId: accident?.carId?.toString() || '',
    accidentDate: accident ? formatDateForInput(accident.accidentDate) : '',
    location: accident?.location || '',
    description: accident?.description || '',
    damagesDescription: accident?.damagesDescription || '',
    responsibleParty: accident?.responsibleParty || '',
    policeReportNumber: accident?.policeReportNumber || '',
    insuranceClaimNumber: accident?.insuranceClaimNumber || '',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (accident) {
      setFormData({
        carId: accident.carId.toString(),
        accidentDate: formatDateForInput(accident.accidentDate),
        location: accident.location,
        description: accident.description,
        damagesDescription: accident.damagesDescription || '',
        responsibleParty: accident.responsibleParty || '',
        policeReportNumber: accident.policeReportNumber || '',
        insuranceClaimNumber: accident.insuranceClaimNumber || '',
      })
    }
  }, [accident])

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newErrors: Record<string, string> = {}
    const validFiles: File[] = []
    const previews: string[] = []

    for (const file of Array.from(files)) {
      const validation = validateImage(file)
      if (!validation.valid) {
        newErrors.photos = validation.error || 'Fichier invalide'
        continue
      }

      try {
        const resizedFile = await resizeImage(file, 1920, 1920)
        validFiles.push(resizedFile)
        
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result as string)
          if (previews.length === validFiles.length) {
            setPhotoPreviews((prev) => [...prev, ...previews])
          }
        }
        reader.readAsDataURL(resizedFile)
      } catch (error) {
        newErrors.photos = 'Erreur lors du traitement de l\'image'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }))
    } else if (errors.photos) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.photos
        return newErrors
      })
    }

    setPhotos((prev) => [...prev, ...validFiles])
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function validateForm(): Record<string, string> {
    const newErrors: Record<string, string> = {}

    if (!formData.carId) {
      newErrors.carId = 'Le véhicule est requis'
    }

    if (!formData.accidentDate) {
      newErrors.accidentDate = 'La date de l\'accident est requise'
    } else if (!isNotInFuture(formData.accidentDate)) {
      newErrors.accidentDate = 'La date ne peut pas être dans le futur'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    return newErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    setGeneralError('')
    
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    
    try {
      const submitData = {
        carId: parseInt(formData.carId, 10),
        accidentDate: formData.accidentDate,
        location: formData.location.trim(),
        description: formData.description.trim(),
        damagesDescription: formData.damagesDescription.trim() || undefined,
        responsibleParty: formData.responsibleParty.trim() || undefined,
        policeReportNumber: formData.policeReportNumber.trim() || undefined,
        insuranceClaimNumber: formData.insuranceClaimNumber.trim() || undefined,
      }
      
      await onSubmit(submitData, photos.length > 0 ? photos : undefined)
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Select
        label={FRENCH_LABELS.vehicle}
        placeholder="Sélectionner un véhicule"
        selectedKeys={formData.carId ? [formData.carId] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0]
          handleChange('carId', selected ? selected.toString() : '')
        }}
        isInvalid={!!errors.carId}
        errorMessage={errors.carId}
        isRequired
        isDisabled={!!accident}
      >
        {cars.map((car) => (
          <SelectItem key={car.id.toString()} value={car.id.toString()}>
            {car.brand} {car.model} - {car.licensePlate}
          </SelectItem>
        ))}
      </Select>

      <Input
        label={FRENCH_LABELS.accidentDate}
        type="date"
        value={formData.accidentDate}
        onChange={(e) => handleChange('accidentDate', e.target.value)}
        isInvalid={!!errors.accidentDate}
        errorMessage={errors.accidentDate}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.location}
        placeholder="Adresse ou lieu de l'accident"
        value={formData.location}
        onChange={(e) => handleChange('location', e.target.value)}
        isInvalid={!!errors.location}
        errorMessage={errors.location}
        isRequired
      />

      <Textarea
        label={FRENCH_LABELS.description}
        placeholder="Description détaillée de l'accident"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        isInvalid={!!errors.description}
        errorMessage={errors.description}
        isRequired
        minRows={3}
      />

      <Textarea
        label={FRENCH_LABELS.damagesDescription}
        placeholder="Description des dommages"
        value={formData.damagesDescription}
        onChange={(e) => handleChange('damagesDescription', e.target.value)}
        minRows={2}
      />

      <Input
        label={FRENCH_LABELS.responsibleParty}
        placeholder="Tiers responsable"
        value={formData.responsibleParty}
        onChange={(e) => handleChange('responsibleParty', e.target.value)}
      />

      <Input
        label={FRENCH_LABELS.policeReportNumber}
        placeholder="Numéro de constat"
        value={formData.policeReportNumber}
        onChange={(e) => handleChange('policeReportNumber', e.target.value)}
      />

      <Input
        label={FRENCH_LABELS.insuranceClaimNumber}
        placeholder="Numéro de sinistre"
        value={formData.insuranceClaimNumber}
        onChange={(e) => handleChange('insuranceClaimNumber', e.target.value)}
      />

      {!accident && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Photos</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handlePhotoSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          {errors.photos && (
            <div className="text-danger text-sm">{errors.photos}</div>
          )}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {generalError && (
        <div className="text-danger text-sm">{generalError}</div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          color="default"
          variant="flat"
          onPress={onCancel}
          isDisabled={isLoading}
        >
          {FRENCH_LABELS.cancel}
        </Button>
        <Button
          color="primary"
          type="submit"
          isLoading={isLoading}
        >
          {FRENCH_LABELS.save}
        </Button>
      </div>
    </form>
  )
}
