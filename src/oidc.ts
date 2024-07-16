import Axios from 'axios';
import { Jwt } from './jwt';

export interface IExternalConfig {
	introspect_url: string;
	userinfo_url?: string;
	client_id?: string;
	client_secret?: string;
}

export class OIDC {
	public readonly jwt: Jwt;

	constructor(cfg: IExternalConfig) {
		const client = Axios.create({
			baseURL: cfg.introspect_url,
			headers: {
				'Accept-Encoding': 'gzip, deflate' // Note the missing Brotli here (br)
			}
		});
		this.jwt = new Jwt(cfg, client);
	}
}
