import { expect, test } from "@playwright/test";

test("legacy nested replies stay visible while new replies stay flat and contextualized", async ({ page }) => {
  await page.route("**/api/community/debates/content-nested", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "debate-nested",
          contentId: "content-nested",
          title: "Debat imbrique",
          description: "Validation de profondeur",
          isActive: true,
          debateScore: 42,
          participantCount: 8,
          topComments: [],
          tags: ["Test"],
          createdAt: "2026-04-20T10:00:00.000Z",
          updatedAt: "2026-04-26T10:00:00.000Z"
        }
      })
    });
  });

  await page.route("**/api/comments/content-nested**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: "root-1",
            contentId: "content-nested",
            userId: "user-root",
            body: "Message racine",
            debateScore: 20,
            likeCount: 3,
            replyCount: 3,
            createdAt: "2026-04-24T09:00:00.000Z",
            updatedAt: "2026-04-24T09:00:00.000Z",
            authorName: "Amani",
            replies: [
              {
                id: "reply-1",
                commentId: "root-1",
                userId: "user-reply-1",
                body: "Premier niveau",
                createdAt: "2026-04-24T10:00:00.000Z",
                updatedAt: "2026-04-24T10:00:00.000Z",
                authorName: "Binta",
                likeCount: 0,
                nestedReplyCount: 1,
                nestedReplies: [
                  {
                    id: "reply-2",
                    commentId: "root-1",
                    parentReplyId: "reply-1",
                    userId: "user-reply-2",
                    body: "Deuxieme niveau",
                    createdAt: "2026-04-24T11:00:00.000Z",
                    updatedAt: "2026-04-24T11:00:00.000Z",
                    authorName: "Celia",
                    likeCount: 0,
                    nestedReplyCount: 1,
                    nestedReplies: [
                      {
                        id: "reply-3",
                        commentId: "root-1",
                        parentReplyId: "reply-2",
                        userId: "user-reply-3",
                        body: "Troisieme niveau visible",
                        createdAt: "2026-04-24T12:00:00.000Z",
                        updatedAt: "2026-04-24T12:00:00.000Z",
                        authorName: "Diane",
                        likeCount: 0,
                        nestedReplyCount: 0,
                        nestedReplies: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          timestamp: "2026-04-26T10:00:00.000Z"
        }
      })
    });
  });

  await page.goto("/debate/content-nested");

  await expect(page.getByRole("heading", { name: "Debat imbrique" })).toBeVisible();
  await expect(page.getByText("Premier niveau")).toHaveCount(0);
  await page.getByRole("button", { name: /Voir les réponses/i }).click();
  await expect(page.getByText("Premier niveau")).toBeVisible();
  await expect(page.getByText("Troisieme niveau visible")).toHaveCount(0);

  const nestedReply = page.locator("#reply-reply-1");
  await nestedReply.getByRole("button", { name: "Répondre à cette réponse" }).click();

  await expect(nestedReply.getByRole("button", { name: "Répondre" })).toBeVisible();
  await expect(page.getByText("Votre réponse sera publiée sous ce point de vue. Le contexte `@username` restera cliquable.")).toBeVisible();
});
