/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Keycloak.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

import { AxiosError, AxiosInstance } from 'axios';
import { IExternalConfig, OIDCToken } from './index';
import { GraphQLError } from 'graphql';
import { createGraphQLError } from 'graphql-yoga';

export class Jwt {
	constructor(
		private readonly config: IExternalConfig,
		private readonly request: AxiosInstance
	) {}

	async verify(accessToken: string): Promise<OIDCToken> {
		try {
			const request = await this.request.post(
				this.config.introspect_url,
				{
					token: accessToken,
					client_id: this.config.client_id,
					client_secret: this.config.client_secret
				},
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			if (request.data.active === true && this.config.userinfo_url) {
				const userinfoRequest = await this.request.get(
					this.config.userinfo_url,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`
						}
					}
				);

				return {
					...request.data,
					...userinfoRequest.data
				} as OIDCToken;
			}

			return request.data as OIDCToken;
		} catch (exception: AxiosError | any) {
			if (exception?.cause.code === 'ECONNREFUSED') {
				console.error(
					'Failed to contact the authentication server to verify token. Is it offline?'
				);
				throw createGraphQLError(
					'Failed to contact the authentication server to verify token. Is it offline?',
					{
						extensions: {
							http: {
								status: 500
							}
						}
					}
				);
			}

			return {} as OIDCToken;
		}
	}
}
