import { useState, useEffect } from 'react'
import { Input, Select, SelectItem, Button } from '@nextui-org/react'
import { FRENCH_LABELS, CAR_STATUSES } from '@/utils/constants'
import { validateCarForm } from '@/utils/validators'
import { formatDateForInput } from '@/utils/formatters'
import { useInsuranceCompanies } from '@/hooks/useInsuranceCompanies'
import type { Car, CarStatus } from '@/types'
import type { CreateCarData, UpdateCarData } from '@/services/carService'

interface CarFormProps {
  car?: Car
  onSubmit: (data: CreateCarData | UpdateCarData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CarForm({ car, onSubmit, onCancel, isLoading }: CarFormProps) {
  const { data: insuranceCompanies } = useInsuranceCompanies()
  const [formData, setFormData] = useState({
    license_plate: car?.license_plate || '',
    brand: car?.brand || '',
    model: car?.model || '',
    grey_card_number: car?.grey_card_number || '',
    insurance_company_id: car?.insurance_company_id || '',
    rental_start_date: car
      ? formatDateForInput(car.rental_start_date)
      : '',
    status: (car?.status || 'active') as CarStatus,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (car) {
      setFormData({
        license_plate: car.license_plate,
        brand: car.brand,
        model: car.model,
        grey_card_number: car.grey_card_number,
        insurance_company_id: car.insurance_company_id,
        rental_start_date: formatDateForInput(car.rental_start_date),
        status: car.status,
      })
    }
  }, [car])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    setGeneralError('')
    
    const validationErrors = validateCarForm(formData)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    
    try {
      if (car) {
        const updateData: UpdateCarData = {
          brand: formData.brand,
          model: formData.model,
          grey_card_number: formData.grey_card_number,
          insurance_company_id: formData.insurance_company_id,
          rental_start_date: formData.rental_start_date,
          status: formData.status,
        }
        await onSubmit(updateData)
      } else {
        const createData: CreateCarData = {
          license_plate: formData.license_plate.toUpperCase(),
          brand: formData.brand,
          model: formData.model,
          grey_card_number: formData.grey_card_number,
          insurance_company_id: formData.insurance_company_id,
          rental_start_date: formData.rental_start_date,
          status: formData.status,
        }
        await onSubmit(createData)
      }
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={FRENCH_LABELS.licensePlate}
        placeholder="AA-123-BB"
        value={formData.license_plate}
        onChange={(e) => handleChange('license_plate', e.target.value)}
        isInvalid={!!errors.license_plate}
        errorMessage={errors.license_plate}
        isDisabled={!!car}
        isRequired
        classNames={{
          input: 'font-mono',
        }}
      />

      <Input
        label={FRENCH_LABELS.brand}
        value={formData.brand}
        onChange={(e) => handleChange('brand', e.target.value)}
        isInvalid={!!errors.brand}
        errorMessage={errors.brand}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.model}
        value={formData.model}
        onChange={(e) => handleChange('model', e.target.value)}
        isInvalid={!!errors.model}
        errorMessage={errors.model}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.greyCardNumber}
        value={formData.grey_card_number}
        onChange={(e) => handleChange('grey_card_number', e.target.value)}
        isInvalid={!!errors.grey_card_number}
        errorMessage={errors.grey_card_number}
        isRequired
      />

      <Select
        label={FRENCH_LABELS.insuranceCompany}
        placeholder={FRENCH_LABELS.selectInsurance}
        selectedKeys={
          formData.insurance_company_id ? [formData.insurance_company_id] : []
        }
        onChange={(e) => handleChange('insurance_company_id', e.target.value)}
        isInvalid={!!errors.insurance_company_id}
        errorMessage={errors.insurance_company_id}
        isRequired
      >
        {(insuranceCompanies || []).map((insurance) => (
          <SelectItem key={insurance.id} value={insurance.id}>
            {insurance.name}
          </SelectItem>
        ))}
      </Select>

      <Input
        type="date"
        label={FRENCH_LABELS.rentalStartDate}
        value={formData.rental_start_date}
        onChange={(e) => handleChange('rental_start_date', e.target.value)}
        isInvalid={!!errors.rental_start_date}
        errorMessage={errors.rental_start_date}
        isRequired
      />

      <Select
        label={FRENCH_LABELS.status}
        placeholder={FRENCH_LABELS.selectStatus}
        selectedKeys={formData.status ? [formData.status] : []}
        onChange={(e) => handleChange('status', e.target.value)}
        isInvalid={!!errors.status}
        errorMessage={errors.status}
        isRequired
      >
        {CAR_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </Select>

      {generalError && (
        <div className="text-sm text-danger">{generalError}</div>
      )}

      <div className="flex gap-2 justify-end mt-4">
        <Button variant="flat" onClick={onCancel} isDisabled={isLoading}>
          {FRENCH_LABELS.cancel}
        </Button>
        <Button type="submit" color="primary" isLoading={isLoading}>
          {FRENCH_LABELS.save}
        </Button>
      </div>
    </form>
  )
}
