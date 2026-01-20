import { APIRequestContext } from "@playwright/test";
import { APILogger } from "./logger";
import { test } from "@playwright/test";

export class RequestHandler {

    private request: APIRequestContext;
    private baseUrl: string | undefined;
    private logger: APILogger;
    private defaultBaseUrl: string;
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};
    private defaultAuthToken: string;
    private clearAuthFlag: boolean;

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger, authToken: string = '') {
        this.request = request
        this.defaultBaseUrl = apiBaseUrl;
        this.logger = logger;
        this.defaultAuthToken = authToken;
    }

    url(url: string) {
        this.baseUrl = url;
        return this;
    }

    path(path: string) {
        this.apiPath = path;
        return this;
    }

    params(params: object) {
        this.queryParams = params;
        return this;
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }
    
    body(body: object) {
        this.apiBody = body;
        return this;
    }

    clearAuth() {
        this.clearAuthFlag = true;
        return this;
    }

    /**
     * Perform a GET request using the constructed URL and headers, log activity, and
     * return the parsed JSON body. Validates the HTTP status matches `statusCode`.
     * @param statusCode - Expected HTTP status code for the request.
     * @returns Parsed JSON response body.
     * @throws Error with recent API logs when the status does not match.
     */
    async getRequest(statusCode: number) {
        let responseJSON : any;

        const url = this.getUrl();
        await test.step(`GET request to: ${url}`, async() => {
            this.logger.logRequest('GET', url, this.getHeaders());
            const response = await this.request.get(url, {
                headers: this.getHeaders()
            });
            this.cleanUpFields();
            const actualStatus = response.status();
            responseJSON = await response.json();

            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest) 
        });
        return responseJSON;
    }

    /**
     * Perform a POST request using the configured body and headers, log activity, and
     * return the parsed JSON body. Validates the HTTP status matches `statusCode`.
     * @param statusCode - Expected HTTP status code for the request.
     * @returns Parsed JSON response body.
     * @throws Error with recent API logs when the status does not match.
     */
    async postRequest(statusCode: number) {
        let responseJSON : any;

        const url = this.getUrl();
        await test.step(`POST request to: ${url}`, async() => {
            this.logger.logRequest('POST', url, this.getHeaders(), this.apiBody);
            const response = await this.request.post(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            });

            this.cleanUpFields();

            const actualStatus = response.status();
            responseJSON = await response.json();

            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        });
           
        return responseJSON;
    }

    /**
     * Perform a PUT request using the configured body and headers, log activity, and
     * return the parsed JSON body. Validates the HTTP status matches `statusCode`.
     * @param statusCode - Expected HTTP status code for the request.
     * @returns Parsed JSON response body.
     * @throws Error with recent API logs when the status does not match.
     */
    async putRequest(statusCode: number) {
        let responseJSON : any;

        const url = this.getUrl();
        await test.step(`PUT request to: ${url}`, async() => {
            this.logger.logRequest('PUT', url, this.getHeaders(), this.apiBody);
            const response = await this.request.put(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            });

            this.cleanUpFields();

            const actualStatus = response.status();
            responseJSON = await response.json();

            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.putRequest)
        });       

        return responseJSON;
    }

    /**
     * Perform a DELETE request to the constructed URL, log activity, and validate
     * the HTTP status matches `statusCode`.
     * @param statusCode - Expected HTTP status code for the request.
     * @throws Error with recent API logs when the status does not match.
     */
    async deleteRequest(statusCode: number) {
        const url = this.getUrl();
        await test.step(`DELETE request to: ${url}`, async() => {this.logger.logRequest('PUT', url, this.getHeaders());
            const response = await this.request.delete(url, {
                headers: this.getHeaders()
            });

            this.cleanUpFields();

            const actualStatus = response.status(); 
            this.logger.logResponse(actualStatus);
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)
        });         
    }

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`)
        for( const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value);
        }
        console.log(url.toString());
        return url.toString();
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if(actualStatus !== expectedStatus) { 
            const logs = this.logger.getRecentLogs();
            const error = new Error(`Expected status ${expectedStatus} but was instead ${actualStatus}\n\nRecent API Activity: \n ${logs}`);
            Error.captureStackTrace(error, callingMethod);
            throw error;
        }
    }

    private getHeaders() {
        if(!this.clearAuthFlag) {
            this.apiHeaders['Authorization'] = this.apiHeaders['Authorization'] || this.defaultAuthToken;
        }
        return this.apiHeaders;
    }

    private cleanUpFields() {
        this.baseUrl = undefined;
        this.queryParams = {};
        this.apiHeaders = {};
        this.apiBody = {};
        this.apiPath = "";
        this.clearAuthFlag = false;
    }
}