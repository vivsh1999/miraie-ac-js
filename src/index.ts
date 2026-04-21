/**
 * Main entrypoint for the `miraie-ac-js` package.
 * This module exports the fluent Session API and all relevant types/enums.
 * @module
 */
export { createSession } from "./fluent/Session.js";
export { Session, FluentDevice } from "./fluent/Session.js";
export * from "./types/enums.js";
export * from "./types/auth.js";
