import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardBody, Spinner } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { UpdateEmployeeRequest } from '@/types'

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: employee, isLoading, error } = useEmployee(id!)
  const updateMutation = useUpdateEmployee()

  async function handleSubmit(data: UpdateEmployeeRequest) {
    if (id) {
      await updateMutation.mutateAsync({ id, data })
      navigate(ROUTES.employeeDetail(id))
    }
  }

  function handleCancel() {
    if (id) {
      navigate(ROUTES.employeeDetail(id))
    } else {
      navigate(ROUTES.employees)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody>
              <p className="text-red-600">
                Employé introuvable
              </p>
              <Link to={ROUTES.employees} className="text-blue-600 hover:underline mt-4 inline-block">
                Retour à la liste
              </Link>
            </CardBody>
          </Card>
        </main>
      </div>
    )
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
          <Link to={ROUTES.employeeDetail(id!)} className="text-blue-600 hover:underline">
            {employee.firstName} {employee.lastName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{FRENCH_LABELS.edit}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {FRENCH_LABELS.editEmployee}
        </h1>

        <Card>
          <CardBody>
            <EmployeeForm
              employee={employee}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={updateMutation.isPending}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
