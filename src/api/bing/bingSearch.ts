import axios from "axios"
import env from 'process'
const SUBSCRIPTION_KEY = '55bdb6fb0e824613b1c441edb32500d7'
if (!SUBSCRIPTION_KEY) {
  throw new Error('Missing the AZURE_SUBSCRIPTION_KEY environment variable')
}
export const bingWebSearch=(query:any)=>{
  return axios({
    method:'get',
    url:'https://api.bing.microsoft.com/v7.0/search?q='+encodeURIComponent(query),
    headers:{
      'Ocp-Apim-Subscription-Key':SUBSCRIPTION_KEY
    }
  }).then(res=>{
    let body = ''
    if(res.status===200&&res.data){
      let pages = res.data.webPages.value.map((page:any)=>{
        return {
          url:page.url,
          snippet:page.snippet,
          name:page.name
        }
      })
      return pages
    }else{
      return []
    }
  })
}