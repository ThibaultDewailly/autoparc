import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, CardBody, Spinner } from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { OperatorForm } from '@/components/operators/OperatorForm'
import {
  useOperator,
  useCreateOperator,
  useUpdateOperator,
} from '@/hooks/useOperators'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateOperatorRequest, UpdateOperatorRequest } from '@/types/operator'

export function OperatorFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const { data: operator, isLoading: isLoadingOperator } = useOperator(id)
  const createMutation = useCreateOperator()
  const updateMutation = useUpdateOperator()

  async function handleSubmit(
    data: CreateOperatorRequest | UpdateOperatorRequest
  ) {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({
        id,
        data: data as UpdateOperatorRequest,
      })
      navigate(ROUTES.operatorDetail(id))
    } else {
      const newOperator = await createMutation.mutateAsync(
        data as CreateOperatorRequest
      )
      navigate(ROUTES.operatorDetail(newOperator.id))
    }
  }

  function handleCancel() {
    if (isEditMode && id) {
      navigate(ROUTES.operatorDetail(id))
    } else {
      navigate(ROUTES.operators)
    }
  }

  if (isEditMode && isLoadingOperator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="flat"
            onClick={handleCancel}
            startContent={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
          >
            {FRENCH_LABELS.back}
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isEditMode ? FRENCH_LABELS.editOperator : FRENCH_LABELS.newOperator}
        </h1>

        <Card>
          <CardBody>
            <OperatorForm
              operator={operator}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
