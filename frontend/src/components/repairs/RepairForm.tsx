import { useState, useEffect } from 'react'
import { Input, Textarea, Button, Select, SelectItem } from '@heroui/react'
import { FRENCH_LABELS, REPAIR_TYPES } from '@/utils/constants'
import { formatDateForInput } from '@/utils/dateUtils'
import type { Repair, Car, Garage, Accident, RepairType } from '@/types'
import type { CreateRepairRequest, UpdateRepairRequest } from '@/types'

interface RepairFormProps {
  repair?: Repair
  cars: Car[]
  garages: Garage[]
  accidents?: Accident[]
  onSubmit: (data: CreateRepairRequest | UpdateRepairRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function RepairForm({
  repair,
  cars,
  garages,
  accidents = [],
  onSubmit,
  onCancel,
  isLoading,
}: RepairFormProps) {
  const [formData, setFormData] = useState({
    carId: repair?.carId?.toString() || '',
    garageId: repair?.garageId?.toString() || '',
    accidentId: repair?.accidentId?.toString() || '',
    repairType: repair?.repairType || ('' as RepairType | ''),
    description: repair?.description || '',
    estimatedCost: repair?.estimatedCost?.toString() || '',
    actualCost: repair?.actualCost?.toString() || '',
    startDate: repair ? formatDateForInput(repair.startDate) : '',
    endDate: repair?.endDate ? formatDateForInput(repair.endDate) : '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (repair) {
      setFormData({
        carId: repair.carId.toString(),
        garageId: repair.garageId.toString(),
        accidentId: repair.accidentId?.toString() || '',
        repairType: repair.repairType,
        description: repair.description,
        estimatedCost: repair.estimatedCost?.toString() || '',
        actualCost: repair.actualCost?.toString() || '',
        startDate: formatDateForInput(repair.startDate),
        endDate: repair.endDate ? formatDateForInput(repair.endDate) : '',
      })
    }
  }, [repair])

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

    if (!formData.carId) {
      newErrors.carId = 'Le véhicule est requis'
    }

    if (!formData.garageId) {
      newErrors.garageId = 'Le garage est requis'
    }

    if (!formData.repairType) {
      newErrors.repairType = 'Le type de réparation est requis'
    }

    if (formData.repairType === 'accident' && !formData.accidentId) {
      newErrors.accidentId = 'L\'accident est requis pour une réparation suite à accident'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise'
    }

    if (formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        newErrors.endDate = 'La date de fin doit être postérieure à la date de début'
      }
    }

    if (formData.estimatedCost) {
      const cost = parseFloat(formData.estimatedCost)
      if (isNaN(cost) || cost < 0) {
        newErrors.estimatedCost = 'Le coût estimé doit être un nombre positif'
      }
    }

    if (formData.actualCost) {
      const cost = parseFloat(formData.actualCost)
      if (isNaN(cost) || cost < 0) {
        newErrors.actualCost = 'Le coût réel doit être un nombre positif'
      }
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
        carId: formData.carId,
        garageId: formData.garageId,
        accidentId: formData.accidentId || undefined,
        repairType: formData.repairType as RepairType,
        description: formData.description.trim(),
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      }
      
      await onSubmit(submitData)
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    }
  }

  const showAccidentField = formData.repairType === 'accident'

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
        isDisabled={!!repair}
      >
        {cars.map((car) => (
          <SelectItem key={car.id.toString()}>
            {car.brand} {car.model} - {car.licensePlate}
          </SelectItem>
        ))}
      </Select>

      <Select
        label={FRENCH_LABELS.garage}
        placeholder="Sélectionner un garage"
        selectedKeys={formData.garageId ? [formData.garageId] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0]
          handleChange('garageId', selected ? selected.toString() : '')
        }}
        isInvalid={!!errors.garageId}
        errorMessage={errors.garageId}
        isRequired
      >
        {garages.map((garage) => (
          <SelectItem key={garage.id.toString()}>
            {garage.name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label={FRENCH_LABELS.repairType}
        placeholder="Sélectionner un type"
        selectedKeys={formData.repairType ? [formData.repairType] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0]
          handleChange('repairType', selected ? selected.toString() : '')
          if (selected !== 'accident') {
            handleChange('accidentId', '')
          }
        }}
        isInvalid={!!errors.repairType}
        errorMessage={errors.repairType}
        isRequired
      >
        {REPAIR_TYPES.map((type) => (
          <SelectItem key={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </Select>

      {showAccidentField && (
        <Select
          label={FRENCH_LABELS.accident}
          placeholder="Sélectionner un accident"
          selectedKeys={formData.accidentId ? [formData.accidentId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0]
            handleChange('accidentId', selected ? selected.toString() : '')
          }}
          isInvalid={!!errors.accidentId}
          errorMessage={errors.accidentId}
          isRequired
        >
          {accidents.map((accident) => (
            <SelectItem key={accident.id.toString()}>
              {accident.location} - {accident.accidentDate}
            </SelectItem>
          ))}
        </Select>
      )}

      <Textarea
        label={FRENCH_LABELS.description}
        placeholder="Description détaillée de la réparation"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        isInvalid={!!errors.description}
        errorMessage={errors.description}
        isRequired
        minRows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={FRENCH_LABELS.estimatedCost}
          type="number"
          placeholder="0.00"
          value={formData.estimatedCost}
          onChange={(e) => handleChange('estimatedCost', e.target.value)}
          isInvalid={!!errors.estimatedCost}
          errorMessage={errors.estimatedCost}
          startContent={<span className="text-default-400 text-small">€</span>}
        />

        <Input
          label={FRENCH_LABELS.actualCost}
          type="number"
          placeholder="0.00"
          value={formData.actualCost}
          onChange={(e) => handleChange('actualCost', e.target.value)}
          isInvalid={!!errors.actualCost}
          errorMessage={errors.actualCost}
          startContent={<span className="text-default-400 text-small">€</span>}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={FRENCH_LABELS.startDate}
          type="date"
          value={formData.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          isInvalid={!!errors.startDate}
          errorMessage={errors.startDate}
          isRequired
        />

        <Input
          label={FRENCH_LABELS.endDate}
          type="date"
          value={formData.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
          isInvalid={!!errors.endDate}
          errorMessage={errors.endDate}
        />
      </div>

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
