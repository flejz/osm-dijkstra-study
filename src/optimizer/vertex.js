import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import urls from '../urls'
import {closest} from '../lib/gis'

export function featuresToPoints(result, attribute='Name') {

  return JSON.parse(result).features.map(feature => {
    return {
      name: feature.attributes[attribute],
      lat: feature.geometry.y,
      lon: feature.geometry.x
    }
  })
}

export function fetchVertexesByReference(point, bufferDistance=500) {

  let params = {
    geometry: `${point.lon},${point.lat}`,
    geometryType: 'esriGeometryPoint',
    spatialRel: 'esriSpatialRelIntersects',
    resultType: 'standard',
    distance: bufferDistance,
    units: 'esriSRUnit_Meter',
    f: 'json'
  }
  const url = `${urls.get('vertex')}/query?${qs.stringify(params)}`

  return req(url)
}

export function fetchVertexesByExpression(expression, outFields='OBJECTID') {

  let params = {
    where: expression,
    outFields: outFields,
    f: 'json'
  }
  const url = `${urls.get('vertex')}/query?${qs.stringify(params)}`

  return req(url)
}

export function getClosestVertex(point, result) {

  return Promise.resolve(closest(point, featuresToPoints(result)))
}
