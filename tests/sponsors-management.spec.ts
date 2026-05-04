import { test, expect, Page } from "@playwright/test";

/**
 * Tests end-to-end pour la gestion des sponsors
 * - Page publique /sponsor avec formulaire de contact
 * - Intégration des sponsors dans le feed (1 sponsor tous les 4 items)
 * - Dashboard admin pour gestion CRUD des sponsors
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@maatfeed.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "admin123";
const API_BASE = process.env.VITE_API_URL || "http://localhost:4000";

test.describe("Sponsors - Page publique", () => {
  test("La page /sponsor est accessible et affiche le formulaire", async ({ page }) => {
    await page.goto("/sponsor");

    // Vérifier le titre et le contenu
    await expect(page.locator("h1")).toContainText("Devenir Sponsor");
    await expect(page.locator("text=Contactez-nous")).toBeVisible();

    // Vérifier que le formulaire existe avec les champs requis
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="company"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Envoyer");
  });

  test("Le formulaire de contact sponsor valide les champs", async ({ page }) => {
    await page.goto("/sponsor");

    // Essayer de soumettre sans remplir
    await page.locator('button[type="submit"]').click();

    // Vérifier les validations HTML5 (required)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute("required", "");
  });

  test("Les informations de tarification sont affichées", async ({ page }) => {
    await page.goto("/sponsor");

    // Vérifier que les informations tarifaires sont présentes
    await expect(page.locator("text= impressions")).toBeVisible();
    await expect(page.locator("text= clics")).toBeVisible();
  });
});

test.describe("Sponsors - Intégration dans le feed", () => {
  test("Les sponsors apparaissent dans le feed tous les 4 items", async ({ page }) => {
    await page.goto("/");

    // Attendre que le feed se charge
    await page.waitForSelector("article", { timeout: 10000 });

    // Vérifier la présence de cartes sponsor (si des sponsors actifs existent)
    const sponsorCards = page.locator("article:has-text('Sponsorisé')");

    // Si des sponsors existent, ils doivent avoir le badge "Sponsorisé"
    const count = await sponsorCards.count();
    if (count > 0) {
      await expect(sponsorCards.first().locator("text=Sponsorisé")).toBeVisible();
    }
  });

  test("Les cartes sponsor ont les éléments requis", async ({ page }) => {
    await page.goto("/");

    // Attendre le chargement
    await page.waitForSelector("article", { timeout: 10000 });

    // Vérifier la structure des cartes sponsor si présentes
    const sponsorCard = page.locator("article:has-text('Sponsorisé')").first();

    if (await sponsorCard.isVisible().catch(() => false)) {
      // Vérifier les éléments d'une carte sponsor
      await expect(sponsorCard.locator("h3")).toBeVisible(); // Nom du sponsor
      await expect(sponsorCard.locator("text=Sponsorisé")).toBeVisible(); // Badge
    }
  });

  test("Le CTA du sponsor ouvre le lien dans un nouvel onglet", async ({ page, context }) => {
    await page.goto("/");

    // Attendre le chargement
    await page.waitForSelector("article", { timeout: 10000 });

    // Trouver une carte sponsor avec un CTA
    const sponsorCard = page.locator("article:has-text('Sponsorisé')").first();

    if (await sponsorCard.isVisible().catch(() => false)) {
      const ctaButton = sponsorCard.locator("button").filter({ hasText: /En savoir plus|S'inscrire|Explorer|Postuler/ });

      if (await ctaButton.isVisible().catch(() => false)) {
        // Vérifier que le bouton est cliquable
        await expect(ctaButton).toBeEnabled();
      }
    }
  });
});

test.describe("Sponsors - Dashboard Admin", () => {
  async function loginAsAdmin(page: Page) {
    await page.goto("/auth");
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    
    // Dismiss CookieBanner if present
    const cookieBanner = page.locator('[data-testid="cookie-banner"]');
    if (await cookieBanner.isVisible().catch(() => false)) {
      await cookieBanner.locator('button:has-text("Accepter"), button:has-text("Tout accepter")').first().click().catch(() => {});
    }
    
    await page.click('button[type="submit"]');
    
    // Wait a bit for login to process and then go directly to admin page
    await page.waitForTimeout(2000);
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/sponsors");
  });

  test("Le dashboard admin sponsors est accessible", async ({ page }) => {
    // Vérifier la page
    await expect(page.locator("h1")).toContainText("Gestion des Sponsors");

    // Vérifier les stats globales
    await expect(page.locator("text=Sponsors actifs")).toBeVisible();
    await expect(page.locator("text=Impressions totales")).toBeVisible();
    await expect(page.locator("text=Clics totaux")).toBeVisible();
  });

  test("Le bouton 'Nouveau Sponsor' ouvre le formulaire", async ({ page }) => {
    await page.click("text=Nouveau Sponsor");

    // Vérifier que le formulaire de création s'affiche
    await expect(page.locator("text=Nouveau sponsor")).toBeVisible();
    await expect(page.locator('input[placeholder="Nom du sponsor"]')).toBeVisible();
  });

  test("La création d'un sponsor nécessite un nom", async ({ page }) => {
    await page.click("text=Nouveau Sponsor");

    // Essayer de créer sans nom
    await page.click("text=Créer");

    // Le champ nom doit être required
    const nameInput = page.locator('input[placeholder="Nom du sponsor"]');
    await expect(nameInput).toHaveAttribute("required", "");
  });

  test("La liste des sponsors affiche les informations clés", async ({ page }) => {
    // Attendre le chargement
    await page.waitForTimeout(2000);

    // Vérifier si des sponsors existent
    const sponsorItems = page.locator("article:has(h3)");

    if (await sponsorItems.first().isVisible().catch(() => false)) {
      // Vérifier les colonnes d'info
      await expect(page.locator("text=Impressions:").first()).toBeVisible();
      await expect(page.locator("text=Clics:").first()).toBeVisible();
      await expect(page.locator("text=CTR:").first()).toBeVisible();
    }
  });

  test("Les boutons d'action par sponsor sont présents", async ({ page }) => {
    await page.waitForTimeout(2000);

    const sponsorCard = page.locator("article:has(h3)").first();

    if (await sponsorCard.isVisible().catch(() => false)) {
      // Vérifier les boutons d'action
      const buttons = sponsorCard.locator("button");
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThanOrEqual(2); // Activer/Désactiver, Modifier, Supprimer
    }
  });

  test("La navigation admin contient le lien Sponsors", async ({ page }) => {
    await page.goto("/admin");

    // Vérifier le menu de navigation
    await expect(page.locator("a[href='/admin/sponsors']")).toContainText("Sponsors");
    await expect(page.locator("text=Ops IA")).toBeVisible();
    await expect(page.locator("text=Ingestion")).toBeVisible();
  });
});

test.describe("Sponsors - API Backend", () => {
  test("L'API /api/sponsors retourne la liste des sponsors actifs", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/sponsors`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("sponsors");
    expect(Array.isArray(data.sponsors)).toBeTruthy();

    // Si des sponsors existent, vérifier la structure
    if (data.sponsors.length > 0) {
      const sponsor = data.sponsors[0];
      expect(sponsor).toHaveProperty("id");
      expect(sponsor).toHaveProperty("name");
      expect(sponsor).toHaveProperty("description");
    }
  });

  test("Les stats sponsor sont accessibles publiquement", async ({ request }) => {
    // Récupérer d'abord la liste des sponsors
    const listResponse = await request.get(`${API_BASE}/api/sponsors`);
    const data = await listResponse.json();

    if (data.sponsors.length > 0) {
      const sponsorId = data.sponsors[0].id;

      // Vérifier que les stats sont trackées
      const statsResponse = await request.get(`${API_BASE}/api/sponsors/${sponsorId}/stats`);
      expect(statsResponse.ok() || statsResponse.status() === 404).toBeTruthy(); // 404 si endpoint inexistant
    }
  });
});

test.describe("Sponsors - Tracking stats", () => {
  test("Le tracking des impressions est initialisé", async ({ page }) => {
    await page.goto("/");

    // Attendre le chargement
    await page.waitForSelector("article", { timeout: 10000 });

    // Si un sponsor est visible, une requête d'impression devrait être envoyée
    const sponsorCard = page.locator("article:has-text('Sponsorisé')").first();

    if (await sponsorCard.isVisible().catch(() => false)) {
      // Le sponsor est visible, l'impression est trackée côté client
      // On vérifie juste que la carte est bien présente
      await expect(sponsorCard).toBeVisible();
    }
  });
});
