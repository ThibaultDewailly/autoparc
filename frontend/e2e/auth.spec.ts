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
    
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    await expect(page.getByText(/email est requis/i)).toBeVisible()
    await expect(page.getByText(/mot de passe est requis/i)).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    await expect(page.getByText(/format.*email.*invalide/i)).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveURL(/\/login/)
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('admin@autoparc.fr')
    await page.getByLabel(/mot de passe/i).fill('admin123')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
    await expect(page.getByText(/bienvenue/i)).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@autoparc.fr')
    await page.getByLabel(/mot de passe/i).fill('admin123')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    await expect(page).toHaveURL('/')
    
    // Click user avatar/menu
    await page.getByRole('button', { name: /avatar/i }).click()
    
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
    
    // Should show error message
    await expect(page.getByText(/erreur/i)).toBeVisible()
  })
})
