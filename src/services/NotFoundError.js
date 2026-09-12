// distinguishes "word doesn't exist" from "the source errored out" — search.js uses this to decide whether to try a fallback
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}
