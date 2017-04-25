import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import Graph from 'node-dijkstra'
import urls from '../urls'
import hospitalMap from '../data/hospitalMap'
import { closest } from '../lib/gis'
import { featuresToPoints, fetchVertexes, getClosestVertex } from './vertex'

function findClosestFacility(graph, origin) {

  const route = new Graph(graph)
  const closest = hospitalMap
    .map(destination => {

      return { destination: destination, route: route.path(origin.name, destination.vertex.name, { cost: true }) }
    })
    .reduce((previousValue, currentValue, index) => {

      return previousValue.route.cost < currentValue.route.cost || !currentValue.route.path ? previousValue : currentValue
    })

  return Promise.resolve(closest)
}

export default function(graph) {
  return point => {
        return fetchVertexes(point, 200)
          .then(getClosestVertex.bind(this, point))
          .then(findClosestFacility.bind(this, graph))
  }
}
