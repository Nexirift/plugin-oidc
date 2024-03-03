# plugin-keycloak
A basic [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) plugin that adds functionality to authenticate users using the [Keycloak](https://www.keycloak.org/) service.

## How does it work?
It works similar to the [plugin-jwt](https://github.com/dotansimha/graphql-yoga/tree/main/packages/plugins/jwt) package provided by the GraphQL Yoga team, replace all references to the JWT plugin with this plugin instead. We use a Redis store so we don't need to request from the Keycloak server to check if a token is valid constantly.

## Requirements
You must install the following npm packages:
- redis
- keycloak-backend

## Instructions
*These instructions suck, if you are stuck, please refer to the plugin-jwt docs and replace jwt references with keycloak. I am working on a full example that can be downloaded and ran.*

1. Install the requirements `npm i redis keycloak-backend @nexirift/plugin-keycloak`.
2. Add a reference to Keycloak somewhere, for example server.ts:
```ts
const keycloak = new Keycloak({
  "realm": "master",
  "keycloak_base_url": "http://auth.local",
  "client_id": "test"
})
```
3. Create a yoga server with the plugin, for example:
```ts
const yoga = createYoga({
  schema,
  plugins: [
    useKeycloak({
      keycloak: keycloak,
      redis: client
    })
  ],
})
``` 
4. Ensure you have a context file, example:
```ts
import { ITokenContent } from "keycloak-backend";

export interface Context {
    req: any;
    res: any;
    keycloak: ITokenContent;
}
```
5. Create a redis client, for example - client.ts:
```ts
import { createClient } from 'redis';

export const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));
```
6. In resolve functions of query or mutation fields you can now check for Keycloak:
```ts
if (!ctx?.keycloak) {
    throw new GraphQLError("You must pass an authorization token in order to use this endpoint.");
}
```
or in a function:
```ts
export function getUserId(context: Context) {
  return context?.keycloak?.sub!;
}
```

## Credits
Disclaimer: This plugin was based off of the plugin-jwt source code.

- [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga)
- [Keycloak](https://www.keycloak.org/)
- [plugin-jwt](https://github.com/dotansimha/graphql-yoga/tree/main/packages/plugins/jwt)
