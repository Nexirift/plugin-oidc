![NPM Version](https://img.shields.io/npm/v/%40nexirift%2Fplugin-keycloak)
![NPM License](https://img.shields.io/npm/l/%40nexirift%2Fplugin-keycloak)
![NPM Downloads](https://img.shields.io/npm/dt/%40nexirift%2Fplugin-keycloak)

# plugin-keycloak
A basic [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) plugin that adds functionality to authenticate users using the [Keycloak](https://www.keycloak.org/) service.

## How does it work?

This plugin checks an access token which is a `Bearer` token on the `Authentication` header with the Keycloak server to verify if it's valid. Additionally, it passes back the response info, which includes information like the `preferred_username`, this can then be used in the GraphQL Yoga server to identify users.

## Example

Please see [here](https://github.com/Nexirift/plugin-keycloak-example) for an example of how to use the project.

## Disclaimer

We are working on trying to stop depending on so many dependencies. As part of this, we have copied some code from the keycloak-backend library. This project, at the time of writing, is using the MIT license. The files that were took were:

- `Token.ts` -> `token.ts`
- `Keycloak.ts` -> `keycloak.ts`
- `Jwt.ts` -> `jwt.ts`

We plan to adapt these files more as we change around our codebase. For example, the new scopes feature that was mentioned in issue [#2](https://github.com/Nexirift/plugin-keycloak/issues/2).

## Credits

Disclaimer: This plugin was based off of the plugin-jwt source code.

- [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga)
- [Keycloak](https://www.keycloak.org/)
- [plugin-jwt](https://github.com/dotansimha/graphql-yoga/tree/main/packages/plugins/jwt)
