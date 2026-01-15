import { faker } from "@faker-js/faker";
import articleRequestPayload from "../request-objects/POST_article.json" with { type: "json" };

export function getNewRandomArticle() {
    const articleRequest = structuredClone(articleRequestPayload);

    articleRequest.article.title = faker.lorem.sentence({min: 5, max: 10});
	articleRequest.article.description = faker.lorem.sentences(3);
	articleRequest.article.body = faker.lorem.paragraph(5);

    return articleRequest;
}