import { expect } from "../utils/custom-expect";
import { test } from "../utils/fixtures";

[
    { username: 'tt', usernameErrorMessage: 'is too short (minimum is 3 characters)'},
    { username: 'ttt', usernameErrorMessage: ''},
    { username: 'tttttttttttttttttttt', usernameErrorMessage: ''},
    { username: 'ttttttttttttttttttttt', usernameErrorMessage: 'is too long (maximum is 20 characters)'},
].forEach(({username, usernameErrorMessage}) => {
    test(`Error message validations for ${username}`, async ({ api }) => {
        const newUserResponse = await api
            .path('/users')
            .body({
                "user": {
                    "email": "t",
                    "password": "t",
                    "username": username
                }
            })
            .clearAuth()
            .postRequest(422);
        if (username.length > 2 && username.length < 21)
            expect(newUserResponse.errors).not.toHaveProperty('username')
        else
            expect (newUserResponse.errors.username[0]).shouldEqual(usernameErrorMessage)
    });
})

