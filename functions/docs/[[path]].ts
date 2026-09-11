/**
 * GET /docs/* (and every other method)
 *
 * Internal notes under /docs/ sit in the deploy directory because Cloudflare
 * Pages publishes the repo root as-is. This catch-all Function answers every
 * request under /docs/ with a plain 404 so they are never served publicly.
 */

export const onRequest: PagesFunction = async () => {
  return new Response('Not found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
