import { test, expect, type Page } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@autoparc.fr')
  await page.getByLabel(/mot de passe/i).fill('Admin123!')
  
  // Click login and wait for navigation to dashboard
  await page.getByRole('button', { name: /se connecter/i }).click()
  await page.waitForURL('/', { timeout: 10000 })
  
  // Verify we're on dashboard
  await expect(page).toHaveURL('/')
}

test.describe('Dashboard Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display dashboard with welcome message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /bienvenue/i })).toBeVisible()
    await expect(page.getByText(/gestion des véhicules/i)).toBeVisible()
  })

  test('should display three statistics cards', async ({ page }) => {
    // Wait for statistics to load
    await page.waitForTimeout(1000)
    
    // Should show total vehicles
    await expect(page.getByText(/total de véhicules/i)).toBeVisible()
    
    // Should show active vehicles
    await expect(page.getByText(/véhicules actifs/i)).toBeVisible()
    
    // Should show maintenance vehicles
    await expect(page.getByText(/véhicules en maintenance/i)).toBeVisible()
  })

  test('should display statistics with numbers', async ({ page }) => {
    // Wait for statistics to load
    await page.waitForTimeout(1000)
    
    // Check that statistics cards contain numbers (at least one digit)
    const statsCards = page.locator('p[class*="text-4xl"][class*="font-bold"]')
    const count = await statsCards.count()
    
    expect(count).toBeGreaterThanOrEqual(3)
    
    // Verify each card has a number
    for (let i = 0; i < count; i++) {
      const text = await statsCards.nth(i).textContent()
      expect(text).toMatch(/\d+/)
    }
  })

  test('should navigate to all cars when clicking total vehicles card', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Click on the total vehicles card
    await page.getByText(/total de véhicules/i).click()
    
    // Should navigate to cars page
    await expect(page).toHaveURL('/cars')
    
    // Should show cars list
    await expect(page.getByRole('heading', { name: /véhicules/i })).toBeVisible()
  })

  test('should navigate to active cars when clicking active vehicles card', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Click on the active vehicles card
    await page.getByText(/véhicules actifs/i).click()
    
    // Should navigate to cars page with active filter
    await page.waitForURL('/cars?status=active', { timeout: 5000 })
    await expect(page).toHaveURL('/cars?status=active')
  })

  test('should navigate to maintenance cars when clicking maintenance vehicles card', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Click on the maintenance vehicles card
    await page.getByText(/véhicules en maintenance/i).click()
    
    // Should navigate to cars page with maintenance filter
    await page.waitForURL('/cars?status=maintenance', { timeout: 5000 })
    await expect(page).toHaveURL('/cars?status=maintenance')
  })

  test('should have proper color styling for statistics cards', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Find all large bold numbers
    const numbers = page.locator('p[class*="text-4xl"][class*="font-bold"]')
    
    // Should have at least 3 statistics
    expect(await numbers.count()).toBeGreaterThanOrEqual(3)
    
    // Check that the first card has blue styling
    const totalNumber = numbers.first()
    await expect(totalNumber).toHaveClass(/text-blue-600/)
    
    // Check that the second card has green styling
    const activeNumber = numbers.nth(1)
    await expect(activeNumber).toHaveClass(/text-green-600/)
    
    // Check that the third card has orange styling
    const maintenanceNumber = numbers.nth(2)
    await expect(maintenanceNumber).toHaveClass(/text-orange-600/)
  })
})

test.describe('Dashboard Search', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display search bar', async ({ page }) => {
    await expect(page.getByPlaceholder(/rechercher/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /rechercher/i }).first()).toBeVisible()
  })

  test('should navigate to cars page with search query', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher/i)
    await searchInput.fill('AA-123-BB')
    
    // Click the search button in the search card (not navbar)
    const searchButtons = page.getByRole('button', { name: /rechercher/i })
    await searchButtons.first().click()
    
    // Should navigate to cars page with search parameter
    await page.waitForURL(/\/cars\?search=/, { timeout: 5000 })
    await expect(page.url()).toContain('search=AA-123-BB')
  })

  test('should have disabled search button when input is empty', async ({ page }) => {
    const searchButtons = page.getByRole('button', { name: /rechercher/i })
    const searchButton = searchButtons.first()
    
    // Button should be disabled when input is empty
    await expect(searchButton).toBeDisabled()
  })

  test('should enable search button when input has text', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher/i)
    const searchButtons = page.getByRole('button', { name: /rechercher/i })
    const searchButton = searchButtons.first()
    
    await searchInput.fill('test')
    
    // Button should be enabled
    await expect(searchButton).toBeEnabled()
  })
})

test.describe('Dashboard Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display "Voir tous les véhicules" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /voir tous les véhicules/i })).toBeVisible()
  })

  test('should navigate to cars page when clicking "Voir tous les véhicules"', async ({ page }) => {
    const viewAllButton = page.getByRole('button', { name: /voir tous les véhicules/i })
    await viewAllButton.click()
    
    // Should navigate to cars page
    await expect(page).toHaveURL('/cars')
  })
})

test.describe('Dashboard Layout and Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should have proper layout structure', async ({ page }) => {
    // Should have navbar
    await expect(page.getByText('AutoParc')).toBeVisible()
    
    // Should have main content area
    await expect(page.locator('main')).toBeVisible()
    
    // Should have welcome section
    await expect(page.getByRole('heading', { name: /bienvenue/i })).toBeVisible()
    
    // Should have statistics section
    await expect(page.getByText(/total de véhicules/i)).toBeVisible()
    
    // Should have search section
    await expect(page.getByPlaceholder(/rechercher/i)).toBeVisible()
    
    // Should have quick actions section
    await expect(page.getByText(/gérez votre flotte/i)).toBeVisible()
  })

  test('should display cards on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for page to adjust
    await page.waitForTimeout(500)
    
    // All statistics should still be visible
    await expect(page.getByText(/total de véhicules/i)).toBeVisible()
    await expect(page.getByText(/véhicules actifs/i)).toBeVisible()
    await expect(page.getByText(/véhicules en maintenance/i)).toBeVisible()
  })

  test('should display cards on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Wait for page to adjust
    await page.waitForTimeout(500)
    
    // All statistics should still be visible
    await expect(page.getByText(/total de véhicules/i)).toBeVisible()
    await expect(page.getByText(/véhicules actifs/i)).toBeVisible()
    await expect(page.getByText(/véhicules en maintenance/i)).toBeVisible()
  })
})
