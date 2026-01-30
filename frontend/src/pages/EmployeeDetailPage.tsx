import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { EmployeeDetail } from '@/components/employees/EmployeeDetail'
import { useEmployee, useDeleteEmployee } from '@/hooks/useEmployees'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: employee, isLoading, error } = useEmployee(id!)
  const deleteMutation = useDeleteEmployee()
  const { isOpen, onOpen, onClose } = useDisclosure()

  async function handleDelete() {
    if (id) {
      await deleteMutation.mutateAsync(id)
      onClose()
      navigate(ROUTES.employees)
    }
  }

  function handleEdit() {
    navigate(ROUTES.employeeEdit(id!))
  }

  function handleChangePassword() {
    navigate(ROUTES.employeeChangePassword(id!))
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
          <span className="text-gray-600">
            {employee.firstName} {employee.lastName}
          </span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {FRENCH_LABELS.employeeDetails}
        </h1>

        <EmployeeDetail
          employee={employee}
          onEdit={handleEdit}
          onDelete={onOpen}
          onChangePassword={handleChangePassword}
        />

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>{FRENCH_LABELS.deleteEmployee}</ModalHeader>
            <ModalBody>
              <p>
                Êtes-vous sûr de vouloir supprimer {employee.firstName} {employee.lastName} ?
              </p>
            </ModalBody>
            <ModalFooter>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                {FRENCH_LABELS.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Suppression...' : FRENCH_LABELS.delete}
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </div>
  )
}
