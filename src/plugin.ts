/**
 * This code was modified from the plugin-jwt implementation of the graphql-yoga library.
 */

import { createGraphQLError, Plugin } from 'graphql-yoga';
import { createClient } from 'redis';
import { OIDCToken } from './token';
import { OIDC } from './oidc';

export type OIDCPluginOptions = OIDCPluginOptionsBase;

/**
 * Represents the options for the OIDC plugin.
 */
export interface OIDCPluginOptionsBase {
	/**
	 * The OIDC instance to use for token verification.
	 */
	oidc: OIDC;

	/**
	 * The Redis client to use for caching token payloads.
	 */
	redis: ReturnType<typeof createClient>;

	/**
	 * The field to use to extend the context with the token payload.
	 * @default 'oidc'
	 */
	extendContextField?: string;

	/**
	 * The prefix to use for the Redis cache keys.
	 * @default 'tokens'
	 */
	cachePrefix?: string;

	/**
	 * The roles that are allowed to authenticate.
	 * @default []
	 */
	allowedRoles?: string[];

	/**
	 * Specifies whether authentication is required.
	 * @default false
	 */
	requireAuth?: boolean;

	/**
	 * The messages to use for different authentication errors.
	 */
	messages?: {
		invalidToken: string;
		expiredToken: string;
		invalidPermissions: string;
		authRequired: string;
	};

	/**
	 * A function that retrieves the token for authentication.
	 * @param params - The parameters for token retrieval.
	 * @returns A promise that resolves to the token or undefined, or the token itself, or undefined.
	 */
	getToken?: (params: {
		request: Request;
		serverContext: object | undefined;
		url: URL;
	}) => Promise<string | undefined> | string | undefined;
}

/**
 * Initializes the OIDC plugin and returns a Plugin object.
 *
 * @param options - The options for configuring the OIDC plugin.
 * @returns A Plugin object that can be used with GraphQL Yoga.
 */
export function useOIDC(options: OIDCPluginOptions): Plugin {
	// Destructure the options object and assign default values
	const {
		oidc,
		redis,
		extendContextField = 'oidc',
		cachePrefix = 'tokens',
		allowedRoles,
		requireAuth = false,
		messages = {
			invalidToken: 'The provided access token is invalid.',
			expiredToken: 'An invalid or expired access token was provided.',
			invalidPermissions:
				'You do not have the necessary permissions to access this resource.',
			authRequired: 'Authentication is required to access this resource.'
		},
		getToken = defaultGetToken
	} = options;

	// Create a WeakMap to store the token payload by request
	const payloadByRequest = new WeakMap<Request, OIDCToken | string>();

	return {
		async onRequestParse({ request, serverContext, url }) {
			// Retrieve the token using the getToken function
			const token = await getToken({ request, serverContext, url });

			// Check if the token is not null
			if (token != null) {
				// Check if the token exists in the Redis cache
				if (!(await redis.exists(`${cachePrefix}:${token}`))) {
					try {
						// Verify the token using the OIDC instance
						const kcToken = await oidc.jwt.verify(token);

						// Store the token content in the Redis cache
						await redis.set(
							`${cachePrefix}:${token}`,
							JSON.stringify(kcToken)
						);

						// Set the expiration time for the token content
						await redis.expire(
							`${cachePrefix}:${token}`,
							kcToken.exp - Math.floor(Date.now() / 1000)
						);
					} catch (ex) {
						// If the token is invalid, throw an unauthorized error
						throw unauthorizedError(messages.invalidToken);
					}
				}

				// Retrieve the token content from the Redis cache
				const ct = await redis.get(`${cachePrefix}:${token}`);

				// If the token is not found in the cache, throw an unauthorized error
				if (!ct) {
					throw unauthorizedError(messages.expiredToken);
				}

				// Check if the token has the necessary roles
				if (allowedRoles && allowedRoles.length > 0) {
					const roles = JSON.parse(ct).realm_access.roles;
					if (
						!roles.some((role: string) =>
							allowedRoles.includes(role)
						)
					) {
						throw unauthorizedError(messages.invalidPermissions);
					}
				}

				// Store the token content in the payloadByRequest WeakMap
				payloadByRequest.set(request, JSON.parse(ct));
			} else {
				// If authentication is required, throw an unauthorized error
				if (requireAuth) {
					throw unauthorizedError(messages.authRequired);
				}
			}
		},
		onContextBuilding({ context, extendContext }) {
			// Check if the request object is available in the context
			if (context.request == null) {
				throw new Error(
					'Request is not available on context! Make sure you use this plugin with GraphQL Yoga.'
				);
			}
			// Retrieve the token payload from the WeakMap using the request object
			const payload = payloadByRequest.get(context.request);
			if (payload != null) {
				// Extend the context with the token payload using the specified field name
				extendContext({
					[extendContextField]: payload
				});
			}
		}
	};
}

/**
 * Creates a GraphQL error with the provided message and options.
 *
 * @param message - The error message.
 * @param options - Additional options for the error.
 * @returns The GraphQL error.
 */
function unauthorizedError(
	message: string,
	options?: Parameters<typeof createGraphQLError>[1]
) {
	// Create a GraphQL error with the provided message and options
	return createGraphQLError(message, {
		extensions: {
			http: {
				status: 401 // Set the HTTP status code to 401 (Unauthorized)
			}
		},
		...options
	});
}

/**
 * Default implementation of the getToken function.
 * Extracts the token from the Authorization header of the request.
 * Currently, only supports the Bearer token type.
 * @param request - The request object containing the headers.
 * @returns The extracted token or undefined if no token is found.
 * @throws An unauthorizedError if an unsupported token type is provided.
 */
const defaultGetToken: NonNullable<OIDCPluginOptions['getToken']> = ({
	request
}: any) => {
	// Extract the token from the Authorization header
	const header = request.headers.get('authorization');
	if (!header) {
		return; // No token found
	}
	// Currently, we only support the Bearer token.
	const [type, token] = header.split(' ');
	if (type !== 'Bearer') {
		throw unauthorizedError(`Unsupported token type provided: "${type}"`);
	}
	return token; // Return the extracted token
};
