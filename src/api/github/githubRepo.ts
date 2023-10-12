import axios from "axios"

//分页获取
export const searchRepo = (query:string,lang:string,page:number,perPage:number) => {
  const url = `https://api.github.com/search/repositories`
  return axios({
    method:'get',
    url:url,
    params:{
      q:encodeURIComponent(`${query} language:${lang}`),
      page:`${page}`,
      per_page:`${perPage}`
    }
  }).then((res:any)=>{
    if(res.status===200&&res.data){
      let repos = res.data.items.map((repo:any)=>{
        return {
          full_name:repo.full_name,
          description:repo.description,
          url:repo.html_url,
          updated_at:repo.updated_at,
          stars:repo.stargazers_count
        }
      })
      return repos
    }else{
      return []
    }
  })
}