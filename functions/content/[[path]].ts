/**
 * GET /content/* (and every other method)
 *
 * The markdown sources for the insights section live in /content/ so they
 * ship with the repo, and Cloudflare Pages deploys the whole repo as static
 * files. This catch-all Function sits in front of that path and answers with a
 * plain 404 so the drafts and sources are never served publicly. build.js
 * reads them from disk at build time; nothing at runtime needs them.
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
