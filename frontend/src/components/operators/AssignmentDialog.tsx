import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
} from '@heroui/react'
import { useOperators } from '@/hooks/useOperators'
import { FRENCH_LABELS } from '@/utils/constants'
import type { AssignOperatorRequest } from '@/types/operator'

interface AssignmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AssignOperatorRequest) => Promise<void>
  isLoading?: boolean
}

export function AssignmentDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: AssignmentDialogProps) {
  const [formData, setFormData] = useState({
    operator_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: operatorsData } = useOperators({ is_active: true })

  // Filter operators without current assignment
  const availableOperators =
    operatorsData?.data?.filter((op) => !op.current_car) || []

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

    if (!formData.operator_id) {
      errors.operator_id = 'Veuillez sélectionner un opérateur'
    }

    if (!formData.start_date) {
      errors.start_date = 'La date de début est requise'
    } else {
      const startDate = new Date(formData.start_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (startDate < today) {
        errors.start_date = 'La date de début ne peut pas être dans le passé'
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
        operator_id: formData.operator_id,
        start_date: formData.start_date,
        notes: formData.notes || undefined,
      })
      // Reset form on success
      setFormData({
        operator_id: '',
        start_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      onClose()
    } catch (error) {
      // Error will be handled by parent component
    }
  }

  function handleClose() {
    setFormData({
      operator_id: '',
      start_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{FRENCH_LABELS.assignOperator}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Select
                label={FRENCH_LABELS.operator}
                placeholder="Sélectionner un opérateur"
                selectedKeys={formData.operator_id ? [formData.operator_id] : []}
                onChange={(e) => handleChange('operator_id', e.target.value)}
                isInvalid={!!errors.operator_id}
                errorMessage={errors.operator_id}
                isRequired
              >
                {availableOperators.map((operator) => (
                  <SelectItem
                    key={operator.id}
                    className="text-foreground"
                  >
                    {operator.first_name} {operator.last_name} (
                    {operator.employee_number})
                  </SelectItem>
                ))}
              </Select>

              {availableOperators.length === 0 && (
                <p className="text-sm text-warning">
                  Aucun opérateur disponible. Tous les opérateurs actifs ont
                  déjà un véhicule attribué.
                </p>
              )}

              <Input
                type="date"
                label={FRENCH_LABELS.startDate}
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                isInvalid={!!errors.start_date}
                errorMessage={errors.start_date}
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
            <Button
              variant="flat"
              onClick={handleClose}
              isDisabled={isLoading}
            >
              {FRENCH_LABELS.cancel}
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              isDisabled={availableOperators.length === 0}
            >
              {FRENCH_LABELS.confirm}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
