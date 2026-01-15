import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const processENV = process.env.TEST_ENV;
const env = processENV || "dev";

console.log("Test environment is: " + env);

const config = {
	apiUrl: "https://conduit-api.bondaracademy.com/api",
	email: "testAPIuser_Valori@test.com",
	password: "testAPIuser_Valori",
};

if (env === "dev") {
	if (!process.env.DEV_USERNAME || !process.env.DEV_PASSWORD) {
		throw Error(`Missing required environment variables`);
	}
	config.email = process.env.DEV_USERNAME;
	config.password = process.env.DEV_PASSWORD;
}
if (env === "prod") {
	if (!process.env.PROD_USERNAME || !process.env.PROD_PASSWORD) {
		throw Error(`Missing required environment variables`);
	}
	config.email = process.env.PROD_USERNAME;
	config.password = process.env.PROD_PASSWORD;
}

export { config };
