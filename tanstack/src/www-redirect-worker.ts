const canonicalOrigin = 'https://saybackend.com'

export default {
  async fetch(request: Request) {
    const url = new URL(request.url)
    return Response.redirect(
      `${canonicalOrigin}${url.pathname}${url.search}`,
      301,
    )
  },
}
