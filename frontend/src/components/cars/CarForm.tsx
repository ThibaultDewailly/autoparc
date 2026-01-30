import { useState, useEffect } from 'react'
import { Input, Select, SelectItem, Button } from '@heroui/react'
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
    licensePlate: car?.licensePlate || '',
    brand: car?.brand || '',
    model: car?.model || '',
    greyCardNumber: car?.greyCardNumber || '',
    insuranceCompanyId: car?.insuranceCompanyId || '',
    rentalStartDate: car
      ? formatDateForInput(car.rentalStartDate)
      : '',
    status: (car?.status || 'active') as CarStatus,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (car) {
      setFormData({
        licensePlate: car.licensePlate,
        brand: car.brand,
        model: car.model,
        greyCardNumber: car.greyCardNumber,
        insuranceCompanyId: car.insuranceCompanyId,
        rentalStartDate: formatDateForInput(car.rentalStartDate),
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
    
    const validationErrors = validateCarForm(formData, !!car)
    
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
          greyCardNumber: formData.greyCardNumber,
          insuranceCompanyId: formData.insuranceCompanyId,
          rentalStartDate: new Date(formData.rentalStartDate).toISOString(),
          status: formData.status,
        }
        await onSubmit(updateData)
      } else {
        const createData: CreateCarData = {
          licensePlate: formData.licensePlate.toUpperCase(),
          brand: formData.brand,
          model: formData.model,
          greyCardNumber: formData.greyCardNumber,
          insuranceCompanyId: formData.insuranceCompanyId,
          rentalStartDate: new Date(formData.rentalStartDate).toISOString(),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={FRENCH_LABELS.licensePlate}
        placeholder="AA-123-BB"
        value={formData.licensePlate}
        onChange={(e) => handleChange('licensePlate', e.target.value)}
        isInvalid={!!errors.licensePlate}
        errorMessage={errors.licensePlate}
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
        value={formData.greyCardNumber}
        onChange={(e) => handleChange('greyCardNumber', e.target.value)}
        isInvalid={!!errors.greyCardNumber}
        errorMessage={errors.greyCardNumber}
        isRequired
      />

      <Select
        label={FRENCH_LABELS.insuranceCompany}
        placeholder={FRENCH_LABELS.selectInsurance}
        selectedKeys={
          formData.insuranceCompanyId ? [formData.insuranceCompanyId] : []
        }
        onChange={(e) => handleChange('insuranceCompanyId', e.target.value)}
        isInvalid={!!errors.insuranceCompanyId}
        errorMessage={errors.insuranceCompanyId}
        isRequired
      >
        {(insuranceCompanies || []).map((insurance) => (
          <SelectItem key={insurance.id} className="text-foreground">
            {insurance.name}
          </SelectItem>
        ))}
      </Select>

      <Input
        type="date"
        label={FRENCH_LABELS.rentalStartDate}
        value={formData.rentalStartDate}
        onChange={(e) => handleChange('rentalStartDate', e.target.value)}
        isInvalid={!!errors.rentalStartDate}
        errorMessage={errors.rentalStartDate}
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
          <SelectItem key={status.value} className="text-foreground">
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
