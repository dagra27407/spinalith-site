// src/routes/CommonLinks.ts

/**
 * CommonLinks
 * =============================================================================
 * Spinalith — Shared Site/App Link Targets
 * =============================================================================
 *
 * Plain-English:
 * Centralized link targets for commonly reused navigation and CTA destinations.
 *
 * Why this exists:
 * - The marketing site will reuse app/signup/login links in many places.
 * - If the app domain, auth query params, pricing route, or launch routing changes,
 *   update it here instead of hunting through many components.
 */

const APP_BASE_URL = "https://app.spinalith.com";

export const COMMON_LINKS = {
  app: {
    base: APP_BASE_URL,

    // Directed auth entry points.
    signup: `${APP_BASE_URL}/?auth=signup`,
    login: `${APP_BASE_URL}/?auth=login`,

    // Readable aliases for different CTA contexts.
    createAccount: `${APP_BASE_URL}/?auth=signup`,
    startMembership: `${APP_BASE_URL}/?auth=signup`,
    signIn: `${APP_BASE_URL}/?auth=login`,
  },

  site: {
    home: "/",
    features: "/features",
    pricing: "/pricing",
    about: "/about",
    contact: "/contact",
    privacy: "/privacy",
    terms: "/terms",
  },
} as const;

export type CommonLinks = typeof COMMON_LINKS;