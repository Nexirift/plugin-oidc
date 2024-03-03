import { createGraphQLError, Plugin } from 'graphql-yoga';
import { ITokenContent, Keycloak } from 'keycloak-backend';
import { createClient } from 'redis';

export type KeycloakPluginOptions = KeycloakPluginOptionsBase;

export interface KeycloakPluginOptionsBase {
    /**
     * Keycloak variable to use for Keycloak tasks
     */
    keycloak: Keycloak
    redis: ReturnType<typeof createClient>
    /**
     * Once a user got successfully authenticated the authentication information is added on the context object under this field. In our resolvers we can then access the authentication information via `context._jwt.sub`.
     */
    extendContextField?: string;
    /**
     * Function to extract the token from the request object
     *
     * Default: Extracts the token from the Authorization header with the format `Bearer <token>`
     */
    getToken?: (params: {
        request: Request;
        serverContext: object | undefined;
        url: URL;
    }) => Promise<string | undefined> | string | undefined;
}

export function useKeycloak(options: KeycloakPluginOptions): Plugin {
    const { extendContextField = 'keycloak', keycloak, redis, getToken = defaultGetToken } = options;

    const payloadByRequest = new WeakMap<Request, ITokenContent | string>();

    return {
        async onRequestParse({ request, serverContext, url }) {
            const token = await getToken({ request, serverContext, url });
            if (token != null) {

                if (!(await redis.exists(token))) {
                    try {
                        const kcToken = await keycloak.jwt.verify(token);
                        await redis.set(token, JSON.stringify(kcToken.content));
                        await redis.expire(token, 60);
                    }
                    catch (ex) {
                        //throw unauthorizedError("The provided access token is invalid.");
                    }
                }

                const ct = await redis.get(token);

                if (!ct) {
                    throw unauthorizedError(`An invalid or expired access token was provided.`);
                }

                payloadByRequest.set(request, JSON.parse(ct));
            }
        },
        onContextBuilding({ context, extendContext }) {
            if (context.request == null) {
                throw new Error(
                    'Request is not available on context! Make sure you use this plugin with GraphQL Yoga.',
                );
            }
            const payload = payloadByRequest.get(context.request);
            if (payload != null) {
                extendContext({
                    [extendContextField]: payload,
                });
            }
        },
    };
}

function unauthorizedError(message: string, options?: Parameters<typeof createGraphQLError>[1]) {
    return createGraphQLError(message, {
        extensions: {
            http: {
                status: 401,
            },
        },
        ...options,
    });
}

const defaultGetToken: NonNullable<KeycloakPluginOptions['getToken']> = ({ request }: any) => {
    const header = request.headers.get('authorization');
    if (!header) {
        return;
    }
    const [type, token] = header.split(' ');
    if (type !== 'Bearer') {
        throw unauthorizedError(`Unsupported token type provided: "${type}"`);
    }
    return token;
};
