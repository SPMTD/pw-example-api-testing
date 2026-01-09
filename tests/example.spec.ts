import { expect, test } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("Create and delete news article ", async ({request}) => {
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {"user": { "email": "testAPIuser_Valori@test.com", "password": "testAPIuser_Valori"} }
  });

  const tokenResponseJSON = await tokenResponse.json();
  const authToken = `Token ${tokenResponseJSON.user.token}`

  const newsArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
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
  expect(newsArticleResponseJSON.article.title).toContain("Test Article")
  
  const slugId = newsArticleResponseJSON.article.slug;

  //Use authToken to login to make sure the first article is not the standard bondaracademy.
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: authToken
    }
  });

  const articleResponseJson = await articlesResponse.json();
  expect(articlesResponse.status()).toEqual(200);
  expect(articleResponseJson.articles[0].title).toContain("Test Article")

  //Teardown
  const deleteArticle = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: authToken
    }
  });
  expect(deleteArticle.status()).toEqual(204);

  //Validate Teardown
  const validateTeardown = await request.get(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: authToken
    }
  });

  expect(validateTeardown.status()).toEqual(404);
});
