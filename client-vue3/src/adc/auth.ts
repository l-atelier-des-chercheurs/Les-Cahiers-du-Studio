import type { Path } from "./types";

// Credentials sent with every request (as JSON in the Authorization header)
// and every socket connection. adc-core gives a token when logging in to an
// author folder (authors/<slug>). The app keeps them (stores/session.js)
// and hands them here whenever they change.

export type Credentials = {
  token?: string;
  token_path?: Path;
  general_password?: string;
};

let credentials: Credentials = {};

export function setCredentials({
  token,
  token_path,
  general_password,
}: Credentials) {
  credentials = { token, token_path, general_password };
}

export function getCredentials(): Credentials {
  return credentials;
}

export function authorizationHeader(): string {
  return JSON.stringify(credentials);
}
