/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Keycloak.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

import { AxiosInstance } from 'axios';
import { IExternalConfig, OIDCToken } from './index';

export class Jwt {
	constructor(
		private readonly config: IExternalConfig,
		private readonly request: AxiosInstance
	) {}

	async verify(accessToken: string): Promise<OIDCToken> {
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
		return request.data as OIDCToken;
	}
}
