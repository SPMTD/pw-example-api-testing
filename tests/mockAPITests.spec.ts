import { expect } from "../utils/custom-expect";
import { test } from "../utils/fixtures";
import { getNewRandomArticle } from "../utils/data-generator";

test("MOCK Get Articles", async ({ api }) => {
    await api.route('**/articles**', async route => {
        const json = [{
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                articles: [],
                articlesCount: 0
            })}];
        await route.fulfill({json});
    });            
    
	const response = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);

    console.log(response);

	await expect(response).shouldMatchSchema("articles", "GET_articles");
	expect(response.articles.length).shouldBeLessThanOrEqual(10);
	expect(response.articlesCount).shouldEqual(10);
});

test("MOCK Get Test Tags", async ({ api }) => {
	const response = await api.path("/tags").getRequest(200);
	await expect(response).shouldMatchSchema("tags", "GET_tags");
	expect(response.tags[0]).shouldEqual("Test");
	expect(response.tags.length).shouldBeLessThanOrEqual(10);
});
