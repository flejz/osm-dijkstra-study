import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import urls from '../urls'
import {closest} from '../lib/gis'

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

  return req(url)
}
