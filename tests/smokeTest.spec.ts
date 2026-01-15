import { expect } from "../utils/custom-expect";
import { test } from "../utils/fixtures";
import { faker } from "@faker-js/faker";

test('Get Articles', async({ api }) => {
    const response = await api
        .path('/articles')
        .params({ limit: 10, offset: 0})        
        .getRequest(200);

    expect(response.articles.length).shouldBeLessThanOrEqual(10);
    expect(response.articlesCount).shouldEqual(10);
}); 

test('Get Test Tags', async({ api }) => {
    const response = await api
        .path("/tags")
        .getRequest(200);

    expect(response.tags[0]).shouldEqual('Test');
    expect(response.tags.length).shouldBeLessThanOrEqual(10);
});

test('Create and Delete article', async({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        .body({
            "article" : {
                "title" : `Test Article-${faker.number.int(99999)}`,
                "description" : `Test Description: ${faker.lorem.paragraph()}`,
                "body": `Test body: ${faker.lorem.paragraph(5)}`,
                "tagList": []
            }  
        })
        .postRequest(201)
    expect(createArticleResponse.article.title).toContain('Test Article-')
    const slugId = createArticleResponse.article.slug;
    
    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    expect(articlesResponse.articles[0].title).toContain("Test Article-")

    await api
        .path(`/articles/${slugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    expect(articlesResponseTwo.articles[0].title).not.toContain("Test Article-")
});

test('Create, Update and Delete article', async({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        .body({
            "article" : {
                "title" : `Test Article-${faker.number.int(99999)}`,
                "description" : `Test Description: ${faker.lorem.paragraph()}`,
                "body": `Test body: ${faker.lorem.paragraph(5)}`,
                "tagList": []
            }  
        })
        .postRequest(201)
    expect(createArticleResponse.article.title).toContain('Test Article-')
    const slugId = createArticleResponse.article.slug;
    
    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        .body({
            "article" : {
                "title" : `Updated Test Article-${faker.number.int(99999)}`,
                "description" : `Test Description: ${faker.lorem.paragraph()}`,
                "body": `Test body: ${faker.lorem.paragraph(5)}`,
                "tagList": []
            }  
        })
        .putRequest(200)

    expect(updateArticleResponse.article.title).toContain("Updated Test Article-");
    const newSlugId = updateArticleResponse.article.slug;

    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    expect(articlesResponse.articles[0].title).toContain("Updated Test Article-")

    await api
        .path(`/articles/${newSlugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200);
    expect(articlesResponseTwo.articles[0].title).not.toContain("Updated Test Article-")
});