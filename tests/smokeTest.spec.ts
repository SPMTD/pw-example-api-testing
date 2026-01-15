import { expect } from "../utils/custom-expect";
import { test } from "../utils/fixtures";
import { faker } from "@faker-js/faker";
import articleRequestPayload from "../request-objects/POST_article.json" with { type: "json" };

test("Get Articles", async ({ api }) => {
	const response = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);

	await expect(response).shouldMatchSchema("articles", "GET_articles", true);
	expect(response.articles.length).shouldBeLessThanOrEqual(10);
	expect(response.articlesCount).shouldEqual(10);
});

test("Get Test Tags", async ({ api }) => {
	const response = await api.path("/tags").getRequest(200);
	await expect(response).shouldMatchSchema("tags", "GET_tags", true);
	expect(response.tags[0]).shouldEqual("Test");
	expect(response.tags.length).shouldBeLessThanOrEqual(10);
});

test("Create and Delete article", async ({ api }) => {
	//Arrange payload
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
	articleRequest.article.title + faker.number.int({ min: 0, max: 99999 });
	articleRequest.article.description + faker.number.int({ min: 0, max: 99999 });
	articleRequest.article.body + faker.lorem.paragraph();

    //Post request
	const createArticleResponse = await api.path("/articles").body(articleRequest).postRequest(201);
	await expect(createArticleResponse).shouldMatchSchema("articles", "POST_articles");
	expect(createArticleResponse.article.title).toContain("Test Article-");
	const slugId = createArticleResponse.article.slug;

    //Validate
	const articlesResponse = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);
	expect(articlesResponse.articles[0].title).toContain("Test Article-");

    //Delete
	await api.path(`/articles/${slugId}`).deleteRequest(204);

    //Validate deletion (.not example)
	const articlesResponseTwo = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);
	expect(articlesResponseTwo.articles[0].title).not.toContain("Test Article-");
});

test("Create, Update and Delete article", async ({ api }) => {
	//Arrange payload
	const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
	articleRequest.article.title + faker.number.int({ min: 0, max: 99999 });
	articleRequest.article.description + faker.number.int({ min: 0, max: 99999 });
	articleRequest.article.body + faker.lorem.paragraph();

    //POST request
	const createArticleResponse = await api.path("/articles").body(articleRequest).postRequest(201);
	expect(createArticleResponse.article.title).toContain("Test Article-");
	const slugId = createArticleResponse.article.slug;

    //Update article title
	articleRequest.article.title =
		"Updated " + articleRequest.article.title + faker.number.int({ min: 0, max: 99999 });

    //PUT updated request
	const updateArticleResponse = await api.path(`/articles/${slugId}`).body(articleRequest).putRequest(200);
	await expect(updateArticleResponse).shouldMatchSchema("articles", "PUT_articles");
	expect(updateArticleResponse.article.title).toContain("Updated Test Article-");
	const newSlugId = updateArticleResponse.article.slug;

    //Validate 
	const articlesResponse = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);
	expect(articlesResponse.articles[0].title).toContain("Updated Test Article-");

    //Delete
	await api.path(`/articles/${newSlugId}`).deleteRequest(204);

    //Validate deletion
	const articlesResponseTwo = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);
	expect(articlesResponseTwo.articles[0].title).not.toContain("Updated Test Article-");
});
