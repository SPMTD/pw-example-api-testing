import { expect } from "../utils/custom-expect";
import { test } from "../utils/fixtures";
import { getNewRandomArticle } from "../utils/data-generator";

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
    const articleRequest = getNewRandomArticle();

    //Post request
	const createArticleResponse = await api
        .path("/articles")
        .body(articleRequest)
        .postRequest(201);
	await expect(createArticleResponse).shouldMatchSchema("articles", "POST_articles");
	expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title);
	const slugId = createArticleResponse.article.slug;

    //Validate
	const articlesResponse = await api
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
	expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title);

    //Delete
	await api
        .path(`/articles/${slugId}`)
        .deleteRequest(204);

    //Validate deletion (.not example)
	const articlesResponseTwo = await api
        .path("/articles")
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
	expect(articlesResponseTwo.articles[0].title).not.shouldEqual(articleRequest.article.title);
});

test("Create, Update and Delete article", async ({ api }) => {
	//Arrange payload
    const articleRequest = getNewRandomArticle();

    //POST request
	const createArticleResponse = await api
        .path("/articles")
        .body(articleRequest)
        .postRequest(201);
	expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title);
	const slugId = createArticleResponse.article.slug;

    //Update article title
	const updatedArticleRequest = getNewRandomArticle();

    //PUT updated request
	const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        .body(updatedArticleRequest)
        .putRequest(200);
	await expect(updateArticleResponse).shouldMatchSchema("articles", "PUT_articles");
	expect(updateArticleResponse.article.title).shouldEqual(updatedArticleRequest.article.title);
	const newSlugId = updateArticleResponse.article.slug;

    //Validate 
	const articlesResponse = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);
	expect(articlesResponse.articles[0].title).shouldEqual(updatedArticleRequest.article.title);

    //Delete
	await api.path(`/articles/${newSlugId}`).deleteRequest(204);

    //Validate deletion
	const articlesResponseTwo = await api.path("/articles").params({ limit: 10, offset: 0 }).getRequest(200);
	expect(articlesResponseTwo.articles[0].title).not.shouldEqual(updatedArticleRequest.article.title);
});
