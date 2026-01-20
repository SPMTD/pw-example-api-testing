import fs from "fs/promises";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { createSchema } from "genson-js";

const SCHEMA_BASE_PATH = "./response-schemas";
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Validate a response object against a stored JSON schema.
 * @summary Reads the schema at `response-schemas/<dirName>/<fileName>_schema.json`,
 * optionally generates it, and validates `responseBody` with AJV.
 * @param dirName - Folder name under `response-schemas` matching the endpoint (e.g., "tags").
 * @param fileName - Base schema filename without `_schema.json` (e.g., "GET_tags").
 * @param responseBody - The actual response object to validate.
 * @param createSchemaFlag - If true, generates a new schema file from `responseBody` before validating.
 * @throws Error when schema cannot be read/created or validation fails (includes AJV errors).
 */
export async function validateSchema(
	dirName: string,
	fileName: string,
	responseBody: object,
	createSchemaFlag: boolean = false
) {
	const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`);

	if (createSchemaFlag) await generateNewSchema(responseBody, schemaPath);

	const schema = await LoadSchema(schemaPath);
	const validate = ajv.compile(schema);

	const valid = validate(responseBody);
	if (!valid) {
		throw new Error(
			`Schema validation failed: ${fileName}_schema.json Failed:\n` +
				`${JSON.stringify(validate.errors, null, 4)}\n\n` +
				`Actual response body: \n` +
				`${JSON.stringify(responseBody, null, 4)}`
		);
	}
}

async function LoadSchema(schemaPath: string) {
	try {
		const schemaContent = await fs.readFile(schemaPath, "utf-8");
		return JSON.parse(schemaContent);
	} catch (error: any) {
		throw new Error(`Failed to read the schema file: ${error.message}`);
	}
}

async function generateNewSchema(responseBody: object, schemaPath: string) {
	try {
		const generatedSchema = createSchema(responseBody);
		await fs.mkdir(path.dirname(schemaPath), { recursive: true });
		await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4));
	} catch (error: any) {
		throw new Error(`Failed to create schema file: ${error.message}`);
	}
}
