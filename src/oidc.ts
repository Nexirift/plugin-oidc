import Axios from 'axios'
import { Jwt } from './jwt'

export interface IExternalConfig {
  introspect_url: string
  client_id: string
  client_secret?: string
}

export class OIDC {
  public readonly jwt: Jwt

  constructor (cfg: IExternalConfig) {
    const client = Axios.create({
      baseURL: cfg.introspect_url
    })
    this.jwt = new Jwt(cfg, client)
  }
}