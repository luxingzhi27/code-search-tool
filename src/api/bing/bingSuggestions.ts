import axios from 'axios';

const SUBSCRIPTION_KEY = '55bdb6fb0e824613b1c441edb32500d7'
if (!SUBSCRIPTION_KEY) {
  throw new Error('Missing the AZURE_SUBSCRIPTION_KEY environment variable')
}

export const bingAutoSuggest = (query: string): Promise<string[]> => {
  return axios({
    method: 'get',
    url: `https://api.bing.microsoft.com/v7.0/suggestions?q=${encodeURIComponent(query)}`,
    headers: {
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
    },
  }).then((res) => {
    if (res.status === 200 && res.data && res.data.suggestionGroups) {
      const suggestions = res.data.suggestionGroups[0].searchSuggestions.map((suggestion: any) => suggestion.displayText);
      return suggestions;
    } else {
      return [];
    }
  });
};