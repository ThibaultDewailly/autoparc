import { useState, useEffect } from 'react'
import { Input, Button, Textarea } from '@nextui-org/react'
import { FRENCH_LABELS } from '@/utils/constants'
import type { Garage } from '@/types'
import type { CreateGarageRequest, UpdateGarageRequest } from '@/types'

interface GarageFormProps {
  garage?: Garage
  onSubmit: (data: CreateGarageRequest | UpdateGarageRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function GarageForm({ garage, onSubmit, onCancel, isLoading }: GarageFormProps) {
  const [formData, setFormData] = useState({
    name: garage?.name || '',
    contactPerson: garage?.contactPerson || '',
    phone: garage?.phone || '',
    email: garage?.email || '',
    address: garage?.address || '',
    specialization: garage?.specialization || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (garage) {
      setFormData({
        name: garage.name,
        contactPerson: garage.contactPerson || '',
        phone: garage.phone,
        email: garage.email || '',
        address: garage.address,
        specialization: garage.specialization || '',
      })
    }
  }, [garage])

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

  function validateForm(): Record<string, string> {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du garage est requis'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    } else if (!/^[0-9\s+()-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
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
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        specialization: formData.specialization.trim() || undefined,
      }
      
      await onSubmit(submitData)
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={FRENCH_LABELS.garageName}
        placeholder="Garage Auto Pro"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        isInvalid={!!errors.name}
        errorMessage={errors.name}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.phone}
        placeholder="01 23 45 67 89"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        isInvalid={!!errors.phone}
        errorMessage={errors.phone}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.email}
        type="email"
        placeholder="contact@garage.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        isInvalid={!!errors.email}
        errorMessage={errors.email}
      />

      <Input
        label={FRENCH_LABELS.contactPerson}
        placeholder="Jean Dupont"
        value={formData.contactPerson}
        onChange={(e) => handleChange('contactPerson', e.target.value)}
      />

      <Textarea
        label={FRENCH_LABELS.address}
        placeholder="123 Rue de la République, 75001 Paris"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        isInvalid={!!errors.address}
        errorMessage={errors.address}
        isRequired
        minRows={2}
      />

      <Input
        label={FRENCH_LABELS.specialization}
        placeholder="Carrosserie, Mécanique générale"
        value={formData.specialization}
        onChange={(e) => handleChange('specialization', e.target.value)}
      />

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
