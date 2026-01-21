import { test as base } from '@playwright/test';
import { RequestHandler } from './request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';
import { createToken } from '../helpers/createToken';
import AxeBuilder from '@axe-core/playwright';

export type TestOptions = {
    api: RequestHandler
    config: typeof config
}

export type WorkerFixture = {
    authToken: string;
}

export type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<TestOptions, WorkerFixture>({    
    /**
     * Worker-scoped async fixture that creates an authentication token.
     * @param _ - Empty fixture context (unused).
     * @param use - Fixture callback to provide the produced `authToken` to tests.
     * @returns Yields a string auth token used by other fixtures/tests.
     */
    // biome-ignore lint/correctness/noEmptyPattern: <Can be Empty>
    authToken: [ async({}, use) => {
        const authToken = await createToken(config.email, config.password);
        await use(authToken);
    }, {scope: 'worker'}],

    /**
     * Async fixture that provides a configured `RequestHandler` for tests.
     * @param request - Playwright `APIRequestContext` injected by the runner.
     * @param authToken - Worker-scoped authentication token produced by `authToken` fixture.
     * @param use - Fixture callback to provide the `RequestHandler` instance to tests.
     * @returns Yields a `RequestHandler` configured with the base API URL, logger and auth token.
     */
    api: async({ request, authToken }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.apiUrl, logger, authToken);
        await use(requestHandler);
    },
        
    /**
     * Simple async fixture that yields the test configuration object.
     * @param _ - Empty fixture context (unused).
     * @param use - Fixture callback to provide `config` to tests.
     */
    // biome-ignore lint/correctness/noEmptyPattern: <Can be Empty>
        config: async({}, use) => {
        await use(config);
    },

    
})

export const accessTest = test.extend<AxeFixture>({
    makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#commonly-reused-element-with-known-issue');

    await use(makeAxeBuilder);
  }
});