import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { SearchBar } from '@/components/common/SearchBar'
import { useCars } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: carsData } = useCars({ limit: 1 })

  function handleSearch() {
    if (searchQuery.trim()) {
      window.location.href = `${ROUTES.cars}?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const totalCars = carsData?.totalCount || carsData?.total || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {FRENCH_LABELS.welcome}
          </h1>
          <p className="text-lg text-gray-600">
            {FRENCH_LABELS.carManagement}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="text-center py-6">
              <p className="text-4xl font-bold text-primary mb-2">{totalCars}</p>
              <p className="text-gray-600">{FRENCH_LABELS.totalCars}</p>
            </CardBody>
          </Card>

          <Card className="md:col-span-2">
            <CardBody className="py-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">{FRENCH_LABELS.search}</h2>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                    />
                  </div>
                  <Button
                    color="primary"
                    onClick={handleSearch}
                    isDisabled={!searchQuery.trim()}
                  >
                    {FRENCH_LABELS.search}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{FRENCH_LABELS.cars}</h2>
              <Link to={ROUTES.cars}>
                <Button color="primary" variant="flat">
                  Voir tous les véhicules
                </Button>
              </Link>
            </div>
            <p className="text-gray-600">
              Gérez votre flotte de véhicules, ajoutez de nouveaux véhicules, 
              modifiez les informations existantes ou supprimez des véhicules.
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
