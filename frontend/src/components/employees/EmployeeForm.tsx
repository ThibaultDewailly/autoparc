import { useState, useEffect } from 'react'
import { Input, Select, SelectItem, Button, Switch } from '@nextui-org/react'
import { FRENCH_LABELS } from '@/utils/constants'
import { validateEmployeeForm } from '@/utils/validators'
import type { Employee } from '@/types'
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types'

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    email: employee?.email || '',
    password: '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    role: employee?.role || 'admin',
    isActive: employee?.isActive ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData({
        email: employee.email,
        password: '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        isActive: employee.isActive,
      })
    }
  }, [employee])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    setGeneralError('')
    
    const validationErrors = validateEmployeeForm(formData, !!employee)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    
    try {
      if (employee) {
        const updateData: UpdateEmployeeRequest = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          isActive: formData.isActive,
        }
        await onSubmit(updateData)
      } else {
        const createData: CreateEmployeeRequest = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
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
        label={FRENCH_LABELS.email}
        type="email"
        placeholder="email@example.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        isInvalid={!!errors.email}
        errorMessage={errors.email}
        isRequired
      />

      {!employee && (
        <Input
          label={FRENCH_LABELS.password}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          isRequired
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />
      )}

      <Input
        label={FRENCH_LABELS.firstName}
        value={formData.firstName}
        onChange={(e) => handleChange('firstName', e.target.value)}
        isInvalid={!!errors.firstName}
        errorMessage={errors.firstName}
        isRequired
      />

      <Input
        label={FRENCH_LABELS.lastName}
        value={formData.lastName}
        onChange={(e) => handleChange('lastName', e.target.value)}
        isInvalid={!!errors.lastName}
        errorMessage={errors.lastName}
        isRequired
      />

      <Select
        label={FRENCH_LABELS.role}
        selectedKeys={[formData.role]}
        onChange={(e) => handleChange('role', e.target.value)}
        isInvalid={!!errors.role}
        errorMessage={errors.role}
        isRequired
      >
        <SelectItem key="admin" value="admin">
          Admin
        </SelectItem>
      </Select>

      {employee && (
        <Switch
          isSelected={formData.isActive}
          onValueChange={(value) => handleChange('isActive', value)}
        >
          {FRENCH_LABELS.active}
        </Switch>
      )}

      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {generalError}
        </div>
      )}

      <div className="flex gap-3 justify-end mt-4">
        <Button
          variant="flat"
          onPress={onCancel}
          isDisabled={isLoading}
        >
          {FRENCH_LABELS.cancel}
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
        >
          {FRENCH_LABELS.save}
        </Button>
      </div>
    </form>
  )
}
