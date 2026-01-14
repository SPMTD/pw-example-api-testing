import { test as base } from '@playwright/test';
import { RequestHandler } from './request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';
import { createToken } from '../helpers/createToken';

export type TestOptions = {
    api: RequestHandler
    config: typeof config
}

export type WorkerFixture = {
    authToken: string;
}

export const test = base.extend<TestOptions, WorkerFixture>({
    // biome-ignore lint/correctness/noEmptyPattern: <Can be Empty>
    authToken: [ async({}, use) => {
        const authToken = await createToken(config.email, config.password);
        await use(authToken);
    }, {scope: 'worker'}],

    api: async({ request, authToken }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.apiUrl, logger, authToken);
        await use(requestHandler);
    },
    
    // biome-ignore lint/correctness/noEmptyPattern: <Can be Empty>
        config: async({}, use) => {
        await use(config);
    }
})