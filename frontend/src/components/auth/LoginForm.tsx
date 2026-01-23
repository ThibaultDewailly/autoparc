import { useState } from 'react'
import { Card, CardBody, CardHeader, Input, Button } from '@nextui-org/react'
import { FRENCH_LABELS } from '@/utils/constants'
import { validateLoginForm } from '@/utils/validators'
import type { LoginCredentials } from '@/types'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    setGeneralError('')
    
    const validationErrors = validateLoginForm({ email, password })
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    setIsLoading(true)
    
    try {
      await onSubmit({ email, password })
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col gap-1 items-start px-6 pt-6 pb-0">
        <h1 className="text-2xl font-bold">AutoParc</h1>
        <p className="text-sm text-default-500">{FRENCH_LABELS.carManagement}</p>
      </CardHeader>
      <CardBody className="px-6 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            type="email"
            label={FRENCH_LABELS.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
            autoComplete="email"
            isRequired
          />
          
          <Input
            type="password"
            label={FRENCH_LABELS.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
            autoComplete="current-password"
            isRequired
          />

          {generalError && (
            <div className="text-sm text-danger">{generalError}</div>
          )}

          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            className="w-full"
          >
            {FRENCH_LABELS.login}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
