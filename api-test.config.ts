const processENV = process.env.TEST_ENV
const env = processENV || "dev"

console.log("Test environment is: " + env);

const config =  {
    apiUrl: "https://conduit-api.bondaracademy.com/api",
    email: "testAPIuser_Valori@test.com",
    password: "testAPIuser_Valori"
};

if(env === 'dev') {
    config.email = "testAPIuser_Valori@test.com";
    config.password = "testAPIuser_Valori";
}
if(env === 'prod') {
    config.email = "pwapiuser@test.com";
    config.password = "Welcome";
}

export {config};