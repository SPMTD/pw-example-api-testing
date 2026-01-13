import { test as base } from '@playwright/test';
import { RequestHandler } from './request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';

export type TestOptions = {
    api: RequestHandler
    config: typeof config
}

export const test = base.extend<TestOptions>({
    api: async({ request }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.apiUrl, logger);
        await use(requestHandler);
    },
    // biome-ignore lint/correctness/noEmptyPattern: <Can be empty.>
    config: async({}, use) => {
        await use(config);
    }
})