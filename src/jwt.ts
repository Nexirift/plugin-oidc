/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Keycloak.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

import { decode } from 'jsonwebtoken'
import { IExternalConfig, OIDCToken } from './index'
import { AxiosInstance } from 'axios'

export class Jwt {
  constructor(private readonly config: IExternalConfig, private readonly request: AxiosInstance) { }

  decode(accessToken: string): OIDCToken {
    return decode(accessToken, { json: true }) as OIDCToken
  }

  async verify(accessToken: string): Promise<OIDCToken> {
    await this.request.get(this.config.introspect_url, {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    })

    return decode(accessToken, { json: true }) as OIDCToken
  }
}