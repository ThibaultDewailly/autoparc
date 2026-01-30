import { useNavigate, Link } from 'react-router-dom'
import { Card, CardBody } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { useCreateEmployee } from '@/hooks/useEmployees'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types'

export function EmployeeCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateEmployee()

  async function handleSubmit(data: CreateEmployeeRequest | UpdateEmployeeRequest) {
    await createMutation.mutateAsync(data as CreateEmployeeRequest)
    navigate(ROUTES.employees)
  }

  function handleCancel() {
    navigate(ROUTES.employees)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <nav className="text-sm mb-4">
          <Link to={ROUTES.employees} className="text-blue-600 hover:underline">
            {FRENCH_LABELS.employees}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{FRENCH_LABELS.newEmployee}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {FRENCH_LABELS.addEmployee}
        </h1>

        <Card>
          <CardBody>
            <EmployeeForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createMutation.isPending}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
