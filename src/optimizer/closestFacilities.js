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

function generateRoute(interop) {

  console.log('generating route');

  const way = interop.destination.route.way
  let edges = interop.destination.route.edges

  let ordered = []

  way.forEach((key) => {
      var found = false;
      edges = edges.filter((item) => {
          if(!found && item.attributes.ST_ID == key) {
              ordered.push(item);
              found = true;
              return false;
          } else
              return true;
      })
  })

  const route = ordered.reduce((prev, curr, index) => {

    let path = prev.geometry.paths[0].concat(curr.geometry.paths[0])

    return {
      geometry: {
        paths: [path]
      }
    }
  })

  console.log(way);
  console.log(ordered);
  console.log(route);

  return Promise.resolve(route)
}

export default function(graph) {
  return point => {
        return fetchVertexesByReference(point, 200)
          .then(getClosestVertex.bind(this, point))
          .then(findClosestFacility.bind(this, graph))
          .then(fetchEdges)
          .then(generateRoute)
  }
}
