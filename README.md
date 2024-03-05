![NPM Version](https://img.shields.io/npm/v/%40nexirift%2Fplugin-keycloak)
![NPM License](https://img.shields.io/npm/l/%40nexirift%2Fplugin-keycloak)
![NPM Downloads](https://img.shields.io/npm/dt/%40nexirift%2Fplugin-keycloak)

# plugin-keycloak
A basic [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) plugin that adds functionality to authenticate users using the [Keycloak](https://www.keycloak.org/) service.

## How does it work?

This plugin checks an access token which is a `Bearer` token on the `Authentication` header with the Keycloak server to verify if it's valid. Additionally, it passes back the response info, which includes information like the `preferred_username`, this can then be used in the GraphQL Yoga server to identify users.

## Example

Please see [here](https://github.com/Nexirift/plugin-keycloak-example) for an example of how to use the project.

## Credits

Disclaimer: This plugin was based off of the plugin-jwt source code.

- [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga)
- [Keycloak](https://www.keycloak.org/)
- [plugin-jwt](https://github.com/dotansimha/graphql-yoga/tree/main/packages/plugins/jwt)
