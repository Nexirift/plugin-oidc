/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Keycloak.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

import Axios from 'axios'
import { Jwt } from './jwt'

export interface IExternalConfig {
  realm: string
  keycloak_base_url: string
  client_id: string
  username?: string
  password?: string
  client_secret?: string
  is_legacy_endpoint?: boolean
}

export interface IInternalConfig extends IExternalConfig {
  prefix: string
}

export class Keycloak {
  public readonly jwt: Jwt

  constructor (cfg: IExternalConfig) {
    const icfg: IInternalConfig = {
      ...cfg,
      prefix: ''
    }
    
    const client = Axios.create({
      baseURL: icfg.keycloak_base_url
    })

    if (icfg.is_legacy_endpoint === true) {
      icfg.prefix = '/auth'
    }

    this.jwt = new Jwt(icfg, client)
  }
}