import { expect, test } from "@playwright/test";

test("discussion keeps flat replies near parent with clickable @mention context", async ({ page }) => {
  await page.route("**/api/community/debates/content-1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "debate-1",
          contentId: "content-1",
          title: "Debat test",
          description: "Validation du mode hybride",
          isActive: true,
          debateScore: 42,
          participantCount: 12,
          topComments: [],
          tags: ["Test"],
          createdAt: "2026-04-20T10:00:00.000Z",
          updatedAt: "2026-04-26T10:00:00.000Z"
        }
      })
    });
  });

  await page.route("**/api/comments/content-1**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: "flat-1",
            contentId: "content-1",
            userId: "user-flat",
            body: "Reponse plate visible dans le flux principal",
            debateScore: 5,
            likeCount: 1,
            replyCount: 0,
            createdAt: "2026-04-26T09:00:00.000Z",
            updatedAt: "2026-04-26T09:00:00.000Z",
            authorName: "Binta",
            replies: [],
            inReplyToCommentId: "root-1",
            replyMode: "flat",
            parentAuthorName: "Amani",
            replyToCommentId: "root-1",
            replyTargetId: "root-1",
            replyTargetType: "comment",
            replyTargetAuthorName: "Amani"
          },
          {
            id: "root-2",
            contentId: "content-1",
            userId: "user-root-2",
            body: "Autre sujet racine",
            debateScore: 18,
            likeCount: 2,
            replyCount: 0,
            createdAt: "2026-04-25T09:00:00.000Z",
            updatedAt: "2026-04-25T09:00:00.000Z",
            authorName: "Celia",
            replies: []
          },
          {
            id: "root-1",
            contentId: "content-1",
            userId: "user-root-1",
            body: "Message parent principal",
            debateScore: 50,
            likeCount: 8,
            replyCount: 2,
            createdAt: "2026-04-24T09:00:00.000Z",
            updatedAt: "2026-04-24T09:00:00.000Z",
            authorName: "Amani",
            replies: [
              {
                id: "nested-1",
                commentId: "root-1",
                userId: "user-nested",
                body: "Reponse en thread imbriquee",
                createdAt: "2026-04-24T10:00:00.000Z",
                updatedAt: "2026-04-24T10:00:00.000Z",
                authorName: "Diane",
                likeCount: 0,
                nestedReplyCount: 0,
                nestedReplies: []
              }
            ]
          }
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          timestamp: "2026-04-26T10:00:00.000Z"
        }
      })
    });
  });

  await page.goto("/debate/content-1");

  await expect(page.getByRole("heading", { name: "Debat test" })).toBeVisible();

  const topLevelComments = page.locator('[id^="comment-"] article');
  await expect(topLevelComments).toHaveCount(2);
  await expect(topLevelComments.nth(0)).toContainText("Message parent principal");
  await expect(topLevelComments.nth(1)).toContainText("Autre sujet racine");

  await expect(page.getByText("Reponse plate visible dans le flux principal")).toHaveCount(0);
  await expect(page.getByText("Reponse en thread imbriquee")).toHaveCount(0);
  await page.getByRole("button", { name: /Voir les réponses/i }).first().click();
  await expect(page.getByText("Reponse plate visible dans le flux principal")).toBeVisible();
  await expect(page.getByText("Reponse en thread imbriquee")).toBeVisible();

  const flatReplyCard = page.locator("#comment-flat-1 article");
  await expect(flatReplyCard).toContainText("Réponse à");
  await expect(flatReplyCard).toContainText("@Amani");
  const replyTargetButton = flatReplyCard.getByRole("button", { name: /@Amani/i });
  await expect(replyTargetButton).toHaveCount(1);
  await replyTargetButton.click();
  await expect(page).toHaveURL(/#comment-root-1$/);

  await page.locator("#comment-root-1 > article").getByRole("button", { name: "Répondre", exact: true }).first().click();
  await expect(page.getByText("Votre réponse sera publiée sous ce point de vue. Le contexte `@username` restera cliquable.")).toBeVisible();
});
