import fs from 'fs/promises';
import path from 'path';

const SCHEMA_BASE_PATH = './response-schemas'

export async function validateSchema(dirName:string, fileName: string) {
    const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`)
    const schema = await LoadSchema(schemaPath);

    console.log(schema);
}

async function LoadSchema(schemaPath:string) {
    try {
        const schemaContent = await fs.readFile(schemaPath, 'utf-8')
        return JSON.parse(schemaContent);
    } catch (error) {
        throw new Error(`Failed to read the schema file: ${error.message}`)
    }    
}