const https = require('https')
const SUBSCRIPTION_KEY = '55bdb6fb0e824613b1c441edb32500d7'
if (!SUBSCRIPTION_KEY) {
  throw new Error('Missing the AZURE_SUBSCRIPTION_KEY environment variable')
}
export function bingWebSearch(query:string) {
  https.get({
    hostname: 'api.bing.microsoft.com',
    path:     '/v7.0/search?q=' + encodeURIComponent(query),
    headers:  { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY },
  }, (res) => {
    let body = ''
    res.on('data', part => body += part)
    res.on('end', () => {
      for (var header in res.headers) {
        if (header.startsWith("bingapis-") || header.startsWith("x-msedge-")) {
          console.log(header + ": " + res.headers[header])
        }
      }
      console.log('\nJSON Response:\n')
      let results=JSON.parse(body)
      console.dir(results, { colors: true, depth: null })
      let pages=results.webPages.value.map((item:any)=>{
        return {
          name:item.name,
          url:item.url,
          snippet:item.snippet
        }
      })
      return pages
    })
    res.on('error', e => {
      console.log('Error: ' + e.message)
      throw e
    })
  })
}