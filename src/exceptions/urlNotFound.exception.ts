import { HttpError } from './http.exception.js';

export class UrlNotFoundError extends HttpError {
  constructor(url: string) {
    super(`Url with path ${url} not found`, 404);
  }
}