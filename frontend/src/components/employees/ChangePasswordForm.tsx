import { useState } from 'react'
import { Input, Button } from '@heroui/react'
import { FRENCH_LABELS } from '@/utils/constants'
import { validatePasswordChange } from '@/utils/validators'
import type { ChangePasswordRequest } from '@/types'

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ChangePasswordForm({ onSubmit, onCancel, isLoading }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

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
    
    const validationErrors = validatePasswordChange(formData)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    
    try {
      await onSubmit({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    }
  }

  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="focus:outline-none"
    >
      {show ? (
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
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={FRENCH_LABELS.currentPassword}
        type={showPasswords.current ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.currentPassword}
        onChange={(e) => handleChange('currentPassword', e.target.value)}
        isInvalid={!!errors.currentPassword}
        errorMessage={errors.currentPassword}
        isRequired
        endContent={
          <PasswordToggle
            show={showPasswords.current}
            onToggle={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
          />
        }
      />

      <Input
        label={FRENCH_LABELS.newPassword}
        type={showPasswords.new ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.newPassword}
        onChange={(e) => handleChange('newPassword', e.target.value)}
        isInvalid={!!errors.newPassword}
        errorMessage={errors.newPassword}
        isRequired
        description="Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"
        endContent={
          <PasswordToggle
            show={showPasswords.new}
            onToggle={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
          />
        }
      />

      <Input
        label={FRENCH_LABELS.confirmPassword}
        type={showPasswords.confirm ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={(e) => handleChange('confirmPassword', e.target.value)}
        isInvalid={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword}
        isRequired
        endContent={
          <PasswordToggle
            show={showPasswords.confirm}
            onToggle={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
          />
        }
      />

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
