![NPM Version](https://img.shields.io/npm/v/%40nexirift%2Fplugin-oidc)
![NPM License](https://img.shields.io/npm/l/%40nexirift%2Fplugin-oidc)
![NPM Downloads](https://img.shields.io/npm/dt/%40nexirift%2Fplugin-oidc)

# plugin-oidc

A basic [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) plugin that
adds functionality to authorize users using an OpenID Connect compatible
service.

## How does it work?

This plugin checks an access token from the `Authentication` header with an
OpenID Connect compatible server to verify if it's valid using the `introspect`
endpoint. Additionally, it passes back the response info, which includes
information like the `preferred_username`, `scope`, `email`, etc. The provided
information can then be used in the GraphQL Yoga server to identify users, such
as storing them in a database based on ID.

## Example

Please see [here](https://github.com/Nexirift/plugin-oidc-example) for an
example of how to use the project.

## Credits

Disclaimer: This plugin was based off of the plugin-jwt source code.

-   [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga)
-   [keycloak-backend](https://github.com/BackendStack21/keycloak-backend)
-   [plugin-jwt](https://github.com/dotansimha/graphql-yoga/tree/main/packages/plugins/jwt)
