import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import urls from '../urls'
import {closest} from '../lib/gis'
import Terraformer from 'terraformer'

export function fetchEdges(result) {

  if (typeof result === 'string') {
    result = JSON.parse(result)
  }

  let params = {
    geometry: {
      points: result.features.map(feature => {
        return [feature.geometry.x, feature.geometry.y]
      })
    },
    geometryType: 'esriGeometryMultipoint',
    where: '1=1',
    f: 'json'
  }
  const url = `${urls.get('edge')}/query?${qs.stringify(params)}`

  return req(url).then(edges => {

    if (typeof edges === 'string') {
      edges = JSON.parse(edges)
    }

    console.log(result.features[0]);


    return Promise.resolve({ points: result.features, edges: edges })

  }).catch(Promise.reject)

}
