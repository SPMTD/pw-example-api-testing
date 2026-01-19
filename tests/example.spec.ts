import { expect, test } from "@playwright/test";
import { faker } from "@faker-js/faker";

const baseURL = "https://conduit-api.bondaracademy.com/api"
let authToken: string;

test.beforeAll('run before all', async({ request }) => {
  const tokenResponse = await request.post(`${baseURL}/users/login`, {
    data: {"user": { "email": "testAPIuser_Valori@test.com", "password": "testAPIuser_Valori"} }
  });

  const tokenResponseJSON = await tokenResponse.json();
  authToken = `Token ${tokenResponseJSON.user.token}`
});

test('Delete Article', async ({ request }) => {
  //Get articles for user
  const userArticlesResponse = await request.get(`${baseURL}/articles?author=testAPIuser_Valori`, {
    headers: {
      Authorization: authToken
    }
  });

  const userArticlesResponseJSON = await userArticlesResponse.json();
  expect(userArticlesResponse.status()).toEqual(200);

  //Delete each article found
  for (const article of userArticlesResponseJSON.articles) {
    const deleteArticleResponse = await request.delete(`${baseURL}/articles/${article.slug}`, {
      headers: {
        Authorization: authToken
      }
    });
    expect(deleteArticleResponse.status()).toEqual(204);
  }
});

/**
 * Example API tests
 * Including:
 * GET
 */
test('Get test tags', async ({ request }) => {
  const tagsResponse = await request.get(`${baseURL}/tags`);
  const tagsResponseJSON = await tagsResponse.json();

  expect(tagsResponse.status()).toEqual(200);
  expect(tagsResponseJSON.tags[0]).toEqual('Test');
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10);
});

test('Get All Articles', async ({ request }) => {
  const allArticlesResponse = await request.get(`${baseURL}/articles?limit=10&offset=0`);
  const allArticlesResponseJSON = await allArticlesResponse.json();

  expect(allArticlesResponse.status()).toEqual(200);
  expect(allArticlesResponseJSON.articles.length).toBeLessThanOrEqual(10);
  expect(allArticlesResponseJSON.articlesCount).toEqual(10);
});

/**
 * Example API test
 * Including:
 * GET
 * POST
 * DELETE
 */
test("Create and delete news article ", async ({request}) => {
  const newsArticleResponse = await request.post(`${baseURL}/articles`, {
    data: {
      "article" : {
        "title" : `Test Article-${faker.number.int(99999)}`,
        "description" : `Test Description: ${faker.lorem.paragraph()}`,
        "body": `Test body: ${faker.lorem.paragraph(5)}`,
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  });

  const newsArticleResponseJSON = await newsArticleResponse.json();
  expect(newsArticleResponse.status()).toEqual(201);
  // TODO: Add schema validation
  // await expect(newsArticleResponseJSON).shouldMatchSchema('articles', 'POST_articles', true);
  const slugId = newsArticleResponseJSON.article.slug;

  //Use authToken to login to make sure the first article is not the standard bondaracademy.
  const articlesResponse = await request.get(`${baseURL}/articles?limit=10&offset=0`, {
    headers: {
      Authorization: authToken
    }
  });

  const articleResponseJson = await articlesResponse.json();
  expect(articlesResponse.status()).toEqual(200);
  expect(articleResponseJson.articles[0].title).toContain("Test Article")

  //Teardown
  const deleteArticle = await request.delete(`${baseURL}/articles/${slugId}`, {
    headers: {
      Authorization: authToken
    }
  });
  expect(deleteArticle.status()).toEqual(204);

  //Validate Teardown
  const validateTeardown = await request.get(`${baseURL}/articles/${slugId}`, {
    headers: {
      Authorization: authToken
    }
  });

  expect(validateTeardown.status()).toEqual(404);
});

/**
 * Example API test
 * Including 
 * GET, POST, PUT, DELETE
 */
test("Create, update and delete news article ", async ({request}) => {
  const newsArticleResponse = await request.post(`${baseURL}/articles`, {
    data: {
      "article" : {
        "title" : `Test PUT Article-${faker.number.int(99999)}`,
        "description" : `Test Description: ${faker.lorem.paragraph()}`,
        "body": `Test body: ${faker.lorem.paragraph(5)}`,
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  });

  const newsArticleResponseJSON = await newsArticleResponse.json();
  expect(newsArticleResponse.status()).toEqual(201);
  expect(newsArticleResponseJSON.article.title).toContain("Test PUT Article")
  
  const slugId = newsArticleResponseJSON.article.slug;

  //Use authToken to login to make sure the first article is not the standard bondaracademy.
  const articlesResponse = await request.get(`${baseURL}/articles?limit=10&offset=0`, {
    headers: {
      Authorization: authToken
    }
  });

  const articleResponseJson = await articlesResponse.json();
  expect(articlesResponse.status()).toEqual(200);
  expect(articleResponseJson.articles[0].title).toContain("Test PUT Article")

  //PUT
  const updateArticle = await request.put(`${baseURL}/articles/${slugId}`, {
    data: {
      "article" : {
        "title" : `Test PUT Article Updated-${faker.number.int(99999)}`,
        "description" : `Test Description: ${faker.lorem.paragraph()}`,
        "body": `Test body: ${faker.lorem.paragraph(5)}`,
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  });

  //Validate article is updated
  const updateArticleResponseJSON = await updateArticle.json();
  const newSlugId = updateArticleResponseJSON.article.slug;
  expect(updateArticle.status()).toEqual(200);
  // TODO: Add schema validation
  // await expect(updateArticleResponseJSON).shouldMatchSchema('articles', 'PUT_articles', true);
  
  //Teardown
  const deleteUpdatedArticle = await request.delete(`${baseURL}/articles/${newSlugId}`, {
    headers: {
      Authorization: authToken
    }
  });
  expect(deleteUpdatedArticle.status()).toEqual(204);
});