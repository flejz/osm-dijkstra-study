import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import Graph from 'node-dijkstra'
import Terraformer from 'terraformer'
import urls from '../urls'
import hospitalMap from '../data/hospitalMap'
import { distance } from '../lib/gis'
import { fetchEdges } from './edge'
import { featuresToPoints, fetchVertexesByReference, fetchVertexesByExpression, getClosestVertex } from './vertex'

function findClosestFacility(graph, interop) {

  console.log('closest facilities');

  const route = new Graph(graph)
  const destination = hospitalMap
    .map(destination => {

      return { hospital: destination, route: route.path(interop.origin.vertex.name, destination.vertex.name, { cost: true }) }
    })
    .reduce((prev, curr, index) => {

      return prev.route.cost < curr.route.cost || !curr.route.path ? prev : curr
    })

  interop.destination = destination

  return Promise.resolve(interop)
}

function prepareResponse(interop) {

  console.log('preparing response');

  const paths = interop.destination.route.edges.map(feature => {

    const way = []
    for (let path of feature.geometry.paths) {
      for (let [lng, lat] of path) {
        way.push({lat: lat, lng: lng})
      }
    }
    return way
  })


  const response = {
    hospital: {
      name: interop.destination.hospital.hospital.name,
      latLng: {lat: interop.destination.hospital.hospital.lat, lng: interop.destination.hospital.hospital.lon}
    },
    paths: paths
  }

  return Promise.resolve(response)
}

export default function(graph) {
  return point => {
        return fetchVertexesByReference(point, 200)
          .then(getClosestVertex.bind(this, point))
          .then(findClosestFacility.bind(this, graph))
          .then(fetchEdges)
          .then(prepareResponse)
  }
}
