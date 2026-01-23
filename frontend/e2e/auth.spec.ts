import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /autoparc/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login')
    
    // Focus and blur email field to trigger validation
    await page.getByLabel(/email/i).click()
    await page.getByLabel(/mot de passe/i).click()
    
    // Click submit without filling fields
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Wait for validation errors to appear
    await page.waitForTimeout(500)
    await expect(page.getByText("L'email est requis")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Le mot de passe est requis')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/mot de passe/i).fill('somepassword')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    await page.waitForTimeout(500)
    await expect(page.getByText("Format d'email invalide")).toBeVisible({ timeout: 10000 })
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveURL(/\/login/)
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('admin@autoparc.fr')
    await page.getByLabel(/mot de passe/i).fill('Admin123!')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
    await expect(page.getByText(/bienvenue/i)).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@autoparc.fr')
    await page.getByLabel(/mot de passe/i).fill('Admin123!')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    await expect(page).toHaveURL('/')
    
    // Open user menu - NextUI dropdown trigger
    await page.locator('[data-slot="trigger"]').last().click()
    
    // Click logout
    await page.getByRole('menuitem', { name: /déconnexion/i }).click()
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/mot de passe/i).fill('wrongpassword')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should show error message - wait longer as it needs to make API call
    await page.waitForTimeout(1000)
    await expect(page.getByText(/invalid credentials|erreur/i)).toBeVisible({ timeout: 10000 })
  })
})