/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Token.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

import { decode } from 'jsonwebtoken'

/**
 * Represents a Keycloak token.
 */
export interface ITokenContent {
    [key: string]: any;
    
    /**
     * The issuer of the token.
     */
    iss: string;
    
    /**
     * The subject of the token.
     */
    sub: string;
    
    /**
     * The audience of the token.
     */
    aud: string | string[];
    
    /**
     * The expiration time of the token.
     */
    exp: number;
    
    /**
     * The time the token was issued.
     */
    iat: number;

    family_name?: string
    given_name?: string
    name?: string
    email?: string
    preferred_username?: string
    email_verified?: boolean
    
    /**
     * The scope of the token.
     */
    scope: string;
}


export class KeycloakToken {
    public readonly token: string
    public readonly content: ITokenContent
  
    constructor (token: string) {
      this.token = token
      const payload = decode(this.token, { json: true })
      if (
        payload?.iss !== undefined &&
        payload?.sub !== undefined &&
        payload?.aud !== undefined &&
        payload?.exp !== undefined &&
        payload?.iat !== undefined
      ) {
        this.content = {
          ...payload,
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          exp: payload.exp,
          iat: payload.iat,
          scope: payload.scope,
        }
      } else {
        throw new Error('Invalid token')
      }
    }
  
    isExpired (): boolean {
      return (this.content.exp * 1000) <= Date.now()
    }
  
    hasApplicationRole (appName: string, roleName: string): boolean {
      const appRoles = this.content.resource_access[appName];
      if (appRoles == null) {
        return false
      }
  
      return (appRoles.roles.indexOf(roleName) >= 0)
    }
  
    hasRealmRole (roleName: string): boolean {
      return (this.content.realm_access.roles.indexOf(roleName) >= 0)
    }
  }
  
export function hasScopes(scopes: string[], token: ITokenContent) {
  const tokenScopes = token.scope.split(' ');
  return scopes.every(scope => tokenScopes.includes(scope));
}