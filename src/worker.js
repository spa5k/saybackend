const canonicalHost = "saybackend.com";
const wwwHost = "www.saybackend.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === wwwHost) {
      url.hostname = canonicalHost;
      return Response.redirect(url.href, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
