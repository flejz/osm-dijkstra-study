import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import urls from '../urls'
import {closest} from '../lib/gis'

export function fetchEdges(interop) {

  console.log('fetch edges');

  let params = {
    geometry: {
      points: interop.destination.route.vertexes.map(feature => {
        return [feature.geometry.x, feature.geometry.y]
      })
    },
    geometryType: 'esriGeometryMultipoint',
    spatialRel: 'esriSpatialRelIntersects',
    resultType: 'standard',
    distance: 0,
    units: 'esriSRUnit_Meter',
    where: '1=1',
    f: 'json'
  }

  // console.log(JSON.stringify(params.geometry));
  // console.log(`${urls.get('edge')}/query?${qs.stringify(params)}`);

  return req({
    method: 'POST',
    uri: `${urls.get('edge')}/query?${qs.stringify(params)}`,
    body: params,
    json: true
  }).then(edges => {

    console.log(edges.features.length);

    interop.destination.route.edges = edges.features

    return Promise.resolve(interop)

  }).catch(Promise.reject)

}
