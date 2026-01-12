import {test, expect} from "@playwright/test";
import { RequestHandler } from "../utils/request-handler";

const baseURL: string = "https://conduit-api.bondaracademy.com/api"
let authToken: string;

test.beforeAll('run before all', async({ request }) => {
  const tokenResponse = await request.post(`${baseURL}/users/login`, {
    data: {"user": { "email": "testAPIuser_Valori@test.com", "password": "testAPIuser_Valori"} }
  });

  const tokenResponseJSON = await tokenResponse.json();
  authToken = `Token ${tokenResponseJSON.user.token}`
});

test('first smoke test', async({ request }) => {
    const api = new RequestHandler()
    api
        .url(`${baseURL}`)
        .path('/articles')
        .params({limit: 10, offset: 0})
        .headers({Authorization: authToken})
        .body({"user": { "email": "testAPIuser_Valori@test.com", "password": "testAPIuser_Valori"} })
});