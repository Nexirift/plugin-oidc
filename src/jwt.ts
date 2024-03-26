/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Keycloak.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

import { decode } from 'jsonwebtoken'
import { IInternalConfig, KeycloakToken } from './index'
import { AxiosInstance } from 'axios'

export class Jwt {
  constructor(private readonly config: IInternalConfig, private readonly request: AxiosInstance) { }

  decode(accessToken: string): KeycloakToken {
    return decode(accessToken, { json: true }) as KeycloakToken
  }

  async verify(accessToken: string): Promise<KeycloakToken> {
    await this.request.get(`${this.config.prefix}/realms/${this.config.realm}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    })

    return decode(accessToken, { json: true }) as KeycloakToken
  }
}