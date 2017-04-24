import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import Graph from 'node-dijkstra'
import urls from '../urls'
import {closest} from '../lib/gis'

function featuresToPoints(result, attribute='Name') {

  return JSON.parse(result).features.map(feature => {
    return {
      name: feature.attributes[attribute],
      lat: feature.geometry.y,
      lon: feature.geometry.x
    }
  })
}

function fetchVertexes(point) {

  let params = {
    geometry:`${point.lon},${point.lat}`,
    geometryType:'esriGeometryPoint',
    spatialRel:'esriSpatialRelIntersects',
    resultType:'standard',
    distance:500.0,
    units:'esriSRUnit_Meter',
    f:'json'
  }
  const url = `${urls.get('vertex')}/query?${qs.stringify(params)}`

  return req(url)
}
function getClosestVertex(point, result) {

  return Promise.resolve(closest(point, featuresToPoints(result)))
}
function getHospitalVertexes(origin) {

  return new Promise((resolve, reject) => {
    let params = {
      where: '0=0',
      f:'json'
    }
    const url = `${urls.get('hospital')}/query?${qs.stringify(params)}`

    req(url)
      .then(result => {

        return Promise.all(
          featuresToPoints(result, 'NAME').map(point => {
            return fetchVertexes(point)
              .then(getClosestVertex.bind(null, point))
              .then(closest => Promise.resolve({ vertex: closest , hospital: point}))
          })
        )
      })
      .then(locations => resolve({ origin: origin, destinations: locations }))
      .catch(reject)
  })
}
function findClosestFacility(graph, data) {

  const route = new Graph(graph)

  const promises = data.destinations.map(destination => new Promise((resolve, reject) => {
    if (!destination || !destination.vertex) resolve(null)

    resolve( { destination: destination, route : route.path(data.origin.name, destination.vertex.name, { cost: true }) })
  }))

  return Promise.all(promises)
    .then(results => {
      try {


      let closestRoute = null, closest = null

      results.forEach(item => {
        if (!item) return
        if (!closestRoute || closestRoute.cost > item.route.cost) {
          closest = item.destination
          closestRoute = item.route
        }
      })

      return Promise.resolve(closest)
      }
      catch (e) {
        console.log(e);
      }
    })



  // for (let destination of data.destinations) {
  //
  //   if (!destination || !destination.vertex) {
  //     continue
  //   }
  //
  //   let result = route.path(data.origin.name, destination.vertex.name, { cost: true })
  //   if (!closestRoute || closestRoute.cost > result.cost) {
  //     closest = destination
  //     closestRoute = result
  //   }
  // }
  //
  // return Promise.resolve(closest)
}

export default function(graph) {
  return point => {
        return fetchVertexes(point)
          .then(getClosestVertex.bind(null, point))
          .then(getHospitalVertexes)
          .then(findClosestFacility.bind(null, graph))
  }
}
