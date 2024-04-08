/*
 * This file was copied from the keycloak-backend library.
 * https://github.com/BackendStack21/keycloak-backend/blob/master/libs/Token.ts
 * At the time of copying this file, the library was licensed under the MIT license.
 */

export class OIDCToken {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  family_name?: string;
  given_name?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  email_verified?: boolean;
  scope: string;

  constructor(tokenContent: OIDCToken) {
    this.iss = tokenContent.iss;
    this.sub = tokenContent.sub;
    this.aud = tokenContent.aud;
    this.exp = tokenContent.exp;
    this.iat = tokenContent.iat;
    this.family_name = tokenContent.family_name;
    this.given_name = tokenContent.given_name;
    this.name = tokenContent.name;
    this.email = tokenContent.email;
    this.preferred_username = tokenContent.preferred_username;
    this.email_verified = tokenContent.email_verified;
    this.scope = tokenContent.scope;
  }

  public hasScopes(scopes: string[]): boolean {
    const tokenScopes = this.scope.split(' ');
    return scopes.every(scope => tokenScopes.includes(scope));
  }
}