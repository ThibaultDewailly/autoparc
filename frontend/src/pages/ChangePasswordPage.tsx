import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardBody, Spinner } from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { ChangePasswordForm } from '@/components/employees/ChangePasswordForm'
import { useEmployee, useChangePassword } from '@/hooks/useEmployees'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { ChangePasswordRequest } from '@/types'

export function ChangePasswordPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: employee, isLoading, error } = useEmployee(id!)
  const changePasswordMutation = useChangePassword()

  async function handleSubmit(data: ChangePasswordRequest) {
    if (id) {
      await changePasswordMutation.mutateAsync({ id, data })
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
          <span className="text-gray-600">{FRENCH_LABELS.changePassword}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {FRENCH_LABELS.changePassword}
        </h1>

        <Card>
          <CardBody>
            <ChangePasswordForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={changePasswordMutation.isPending}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
