import { expect } from "../utils/custom-expect";
import { test } from "../utils/fixtures";
import { getNewRandomArticle } from "../utils/data-generator";
import { faker } from "@faker-js/faker";

test("HAR Flow - Create Article with Comments", async ({ api }) => {
    // Step 1: Create article (uses fixture-provided auth)
    const articleRequest = getNewRandomArticle();
    const createArticleResponse = await api.path("/articles").body(articleRequest).postRequest(201);
    await expect(createArticleResponse).shouldMatchSchema("articles", "POST_articles");
    const articleSlug = createArticleResponse.article.slug;

    // Step 2: Get created article by slug
    const getArticleResponse = await api.path(`/articles/${articleSlug}`).getRequest(200);
    await expect(getArticleResponse).shouldMatchSchema("articles", "GET_article", true);

    // Step 3: Get comments for article
    const getCommentsResponse = await api.path(`/articles/${articleSlug}/comments`).getRequest(200);
    await expect(getCommentsResponse).shouldMatchSchema("articles", "GET_article_comments", true);

    // Step 4: Post a comment to the article
    const commentRequest = { comment: { body: faker.lorem.sentence(6) } };
    const createCommentResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .body(commentRequest)
        .postRequest(200);
    await expect(createCommentResponse).shouldMatchSchema("articles", "POST_article_comment", true);
    const commentId = createCommentResponse.comment.id;
    
    // Step 5: Re-fetch comments to validate created comment exists
    const getCommentsResponseAfter = await api.path(`/articles/${articleSlug}/comments`).getRequest(200);
    await expect(getCommentsResponseAfter).shouldMatchSchema("articles", "GET_article_comments", true);
    const foundComment = getCommentsResponseAfter.comments.find((c: any) => c.id === commentId || c.body === commentRequest.comment.body);
    expect(!!foundComment).shouldEqual(true);

    // small sanity checks using extracted values
    expect(typeof articleSlug).shouldEqual("string");
    expect(typeof commentId).shouldEqual("number");
});
