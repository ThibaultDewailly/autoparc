import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from '@heroui/react'
import { FRENCH_LABELS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import type { UnassignOperatorRequest, CarOperatorAssignment } from '@/types/operator'

interface UnassignmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UnassignOperatorRequest) => Promise<void>
  currentAssignment?: CarOperatorAssignment
  isLoading?: boolean
}

export function UnassignmentDialog({
  isOpen,
  onClose,
  onSubmit,
  currentAssignment,
  isLoading,
}: UnassignmentDialogProps) {
  const [formData, setFormData] = useState({
    end_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    const errors: Record<string, string> = {}

    if (!formData.end_date) {
      errors.end_date = 'La date de fin est requise'
    } else if (currentAssignment) {
      const startDate = new Date(currentAssignment.start_date)
      const endDate = new Date(formData.end_date)
      
      // Remove time component for comparison
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      
      if (endDate < startDate) {
        errors.end_date = `La date de fin ne peut pas être antérieure à la date de début (${formatDate(currentAssignment.start_date)})`
      }
    }

    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    try {
      await onSubmit({
        end_date: formData.end_date,
        notes: formData.notes || undefined,
      })
      // Reset form on success
      setFormData({
        end_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      onClose()
    } catch (error) {
      // Error will be handled by parent component
    }
  }

  function handleClose() {
    setFormData({
      end_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{FRENCH_LABELS.unassignOperator}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {currentAssignment && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Attribution actuelle</h4>
                  <p className="text-sm">
                    <span className="text-gray-600">Date de début: </span>
                    {formatDate(currentAssignment.start_date)}
                  </p>
                  {currentAssignment.notes && (
                    <p className="text-sm mt-1">
                      <span className="text-gray-600">Notes: </span>
                      {currentAssignment.notes}
                    </p>
                  )}
                </div>
              )}

              <Input
                type="date"
                label={FRENCH_LABELS.endDate}
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                isInvalid={!!errors.end_date}
                errorMessage={errors.end_date}
                isRequired
              />

              <Textarea
                label={FRENCH_LABELS.notes}
                placeholder="Notes optionnelles..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={handleClose} isDisabled={isLoading}>
              {FRENCH_LABELS.cancel}
            </Button>
            <Button type="submit" color="warning" isLoading={isLoading}>
              {FRENCH_LABELS.confirm}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
