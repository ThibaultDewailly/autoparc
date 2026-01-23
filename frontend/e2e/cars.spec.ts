import { test, expect, type Page } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@autoparc.fr')
  await page.getByLabel(/mot de passe/i).fill('admin123')
  await page.getByRole('button', { name: /se connecter/i }).click()
  await expect(page).toHaveURL('/')
}

test.describe('Car Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display cars list page', async ({ page }) => {
    await page.goto('/cars')
    
    await expect(page.getByRole('heading', { name: /véhicules/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /ajouter un véhicule/i })).toBeVisible()
  })

  test('should search for cars', async ({ page }) => {
    await page.goto('/cars')
    
    const searchInput = page.getByPlaceholder(/rechercher/i)
    await searchInput.fill('AA-123-BB')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Should show filtered results
    await expect(page.getByText('AA-123-BB')).toBeVisible()
  })

  test('should filter cars by status', async ({ page }) => {
    await page.goto('/cars')
    
    // Open status filter
    await page.getByLabel(/statut/i).click()
    
    // Select active status
    await page.getByRole('option', { name: /actif/i }).click()
    
    // Wait for filtered results
    await page.waitForTimeout(500)
  })

  test('should navigate through pagination', async ({ page }) => {
    await page.goto('/cars')
    
    const nextButton = page.getByRole('button', { name: /suivant/i })
    
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      await expect(page.getByText(/page 2/i)).toBeVisible()
      
      const previousButton = page.getByRole('button', { name: /précédent/i })
      await previousButton.click()
      await expect(page.getByText(/page 1/i)).toBeVisible()
    }
  })

  test('should create a new car', async ({ page }) => {
    await page.goto('/cars')
    
    await page.getByRole('button', { name: /ajouter un véhicule/i }).click()
    
    await expect(page).toHaveURL(/\/cars\/new/)
    await expect(page.getByRole('heading', { name: /nouveau véhicule/i })).toBeVisible()
    
    // Fill in the form
    await page.getByLabel(/plaque.*immatriculation/i).fill('ZZ-999-ZZ')
    await page.getByLabel(/marque/i).fill('Test Brand')
    await page.getByLabel(/modèle/i).fill('Test Model')
    await page.getByLabel(/numéro de carte grise/i).fill('GC999999')
    
    // Select insurance company
    await page.getByLabel(/compagnie.*assurance/i).click()
    await page.getByRole('option').first().click()
    
    // Set rental start date
    await page.getByLabel(/date de début/i).fill('2024-01-01')
    
    // Select status
    await page.getByLabel(/statut/i).click()
    await page.getByRole('option', { name: /actif/i }).click()
    
    // Submit form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Should redirect to car detail page
    await page.waitForURL(/\/cars\/[a-f0-9-]+$/)
    await expect(page.getByText('ZZ-999-ZZ')).toBeVisible()
  })

  test('should show validation error for invalid license plate', async ({ page }) => {
    await page.goto('/cars/new')
    
    await page.getByLabel(/plaque.*immatriculation/i).fill('INVALID')
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    await expect(page.getByText(/format invalide/i)).toBeVisible()
  })

  test('should view car details', async ({ page }) => {
    await page.goto('/cars')
    
    // Click on first view button
    await page.getByRole('button', { name: /voir/i }).first().click()
    
    // Should navigate to detail page
    await page.waitForURL(/\/cars\/[a-f0-9-]+$/)
    
    // Should show car details
    await expect(page.getByText(/marque/i)).toBeVisible()
    await expect(page.getByText(/modèle/i)).toBeVisible()
    await expect(page.getByText(/compagnie.*assurance/i)).toBeVisible()
  })

  test('should edit a car', async ({ page }) => {
    await page.goto('/cars')
    
    // Click on first edit button
    await page.getByRole('button', { name: /modifier/i }).first().click()
    
    // Should navigate to edit page
    await page.waitForURL(/\/cars\/[a-f0-9-]+\/edit$/)
    await expect(page.getByRole('heading', { name: /modifier le véhicule/i })).toBeVisible()
    
    // Modify brand
    const brandInput = page.getByLabel(/marque/i)
    await brandInput.clear()
    await brandInput.fill('Updated Brand')
    
    // Submit form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Should redirect back to detail page
    await page.waitForURL(/\/cars\/[a-f0-9-]+$/)
    await expect(page.getByText('Updated Brand')).toBeVisible()
  })

  test('should delete a car', async ({ page }) => {
    await page.goto('/cars')
    
    // Click on first delete button
    await page.getByRole('button', { name: /supprimer/i }).first().click()
    
    // Should show confirmation modal
    await expect(page.getByText(/êtes-vous sûr/i)).toBeVisible()
    
    // Confirm deletion
    await page.getByRole('button', { name: /supprimer/i }).last().click()
    
    // Should close modal and refresh list
    await page.waitForTimeout(500)
  })

  test('should cancel car deletion', async ({ page }) => {
    await page.goto('/cars')
    
    // Click on first delete button
    await page.getByRole('button', { name: /supprimer/i }).first().click()
    
    // Should show confirmation modal
    await expect(page.getByText(/êtes-vous sûr/i)).toBeVisible()
    
    // Cancel deletion
    await page.getByRole('button', { name: /annuler/i }).click()
    
    // Modal should close
    await expect(page.getByText(/êtes-vous sûr/i)).not.toBeVisible()
  })

  test('should navigate back from car detail', async ({ page }) => {
    await page.goto('/cars')
    await page.getByRole('button', { name: /voir/i }).first().click()
    await page.waitForURL(/\/cars\/[a-f0-9-]+$/)
    
    // Click back button
    await page.getByRole('button', { name: /retour/i }).click()
    
    // Should navigate back to cars list
    await expect(page).toHaveURL('/cars')
  })

  test('should navigate back from car form', async ({ page }) => {
    await page.goto('/cars/new')
    
    // Click back button
    await page.getByRole('button', { name: /retour/i }).click()
    
    // Should navigate back to cars list
    await expect(page).toHaveURL('/cars')
  })
})
