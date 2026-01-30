import { useState, useEffect } from 'react'
import { Input, Button, Switch } from '@heroui/react'
import { FRENCH_LABELS } from '@/utils/constants'
import type { CarOperator } from '@/types/operator'
import type { CreateOperatorRequest, UpdateOperatorRequest } from '@/types/operator'

interface OperatorFormProps {
  operator?: CarOperator
  onSubmit: (data: CreateOperatorRequest | UpdateOperatorRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function OperatorForm({
  operator,
  onSubmit,
  onCancel,
  isLoading,
}: OperatorFormProps) {
  const [formData, setFormData] = useState({
    employee_number: operator?.employee_number || '',
    first_name: operator?.first_name || '',
    last_name: operator?.last_name || '',
    email: operator?.email || '',
    phone: operator?.phone || '',
    department: operator?.department || '',
    is_active: operator?.is_active !== undefined ? operator.is_active : true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (operator) {
      setFormData({
        employee_number: operator.employee_number,
        first_name: operator.first_name,
        last_name: operator.last_name,
        email: operator.email || '',
        phone: operator.phone || '',
        department: operator.department || '',
        is_active: operator.is_active,
      })
    }
  }, [operator])

  function handleChange(field: string, value: string | boolean) {
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
    const errors: Record<string, string> = {}

    if (!formData.employee_number.trim()) {
      errors.employee_number = 'Le numéro d\'employé est requis'
    } else if (formData.employee_number.length > 50) {
      errors.employee_number = 'Le numéro d\'employé ne peut pas dépasser 50 caractères'
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis'
    } else if (formData.first_name.length > 100) {
      errors.first_name = 'Le prénom ne peut pas dépasser 100 caractères'
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom est requis'
    } else if (formData.last_name.length > 100) {
      errors.last_name = 'Le nom ne peut pas dépasser 100 caractères'
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email invalide'
      } else if (formData.email.length > 255) {
        errors.email = 'L\'email ne peut pas dépasser 255 caractères'
      }
    }

    if (formData.phone && formData.phone.length > 50) {
      errors.phone = 'Le téléphone ne peut pas dépasser 50 caractères'
    }

    if (formData.department && formData.department.length > 100) {
      errors.department = 'Le département ne peut pas dépasser 100 caractères'
    }

    return errors
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
      if (operator) {
        const updateData: UpdateOperatorRequest = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
          is_active: formData.is_active,
        }
        await onSubmit(updateData)
      } else {
        const createData: CreateOperatorRequest = {
          employee_number: formData.employee_number,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
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
        label={FRENCH_LABELS.employeeNumber}
        placeholder="EMP001"
        value={formData.employee_number}
        onChange={(e) => handleChange('employee_number', e.target.value)}
        isInvalid={!!errors.employee_number}
        errorMessage={errors.employee_number}
        isDisabled={!!operator}
        isRequired
        classNames={{
          input: 'font-mono',
        }}
      />

      <Input
        label={FRENCH_LABELS.firstName}
        value={formData.first_name}
        onChange={(e) => handleChange('first_name', e.target.value)}
        isInvalid={!!errors.first_name}
        errorMessage={errors.first_name}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.lastName}
        value={formData.last_name}
        onChange={(e) => handleChange('last_name', e.target.value)}
        isInvalid={!!errors.last_name}
        errorMessage={errors.last_name}
        isRequired
      />

      <Input
        type="email"
        label={FRENCH_LABELS.email}
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        isInvalid={!!errors.email}
        errorMessage={errors.email}
      />

      <Input
        label={FRENCH_LABELS.phone}
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        isInvalid={!!errors.phone}
        errorMessage={errors.phone}
      />

      <Input
        label={FRENCH_LABELS.department}
        value={formData.department}
        onChange={(e) => handleChange('department', e.target.value)}
        isInvalid={!!errors.department}
        errorMessage={errors.department}
      />

      {operator && (
        <Switch
          isSelected={formData.is_active}
          onValueChange={(value) => handleChange('is_active', value)}
        >
          {FRENCH_LABELS.active}
        </Switch>
      )}

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
