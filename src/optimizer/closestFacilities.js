import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import Graph from 'node-dijkstra'
import urls from '../urls'
import hospitalMap from '../data/hospitalMap'
import { fetchEdges } from './edge'
import { featuresToPoints, fetchVertexesByReference, fetchVertexesByExpression, getClosestVertex } from './vertex'

function findClosestFacility(graph, origin) {

  const route = new Graph(graph)
  const closest = hospitalMap
    .map(destination => {

      return { destination: destination, route: route.path(origin.name, destination.vertex.name, { cost: true }) }
    })
    .reduce((prev, curr, index) => {

      return prev.route.cost < curr.route.cost || !curr.route.path ? prev : curr
    })

  return Promise.resolve(closest)
}

function prepareExpression(closest) {

  return Promise.resolve(closest.route.path.reduce((prev, curr, index, self) => {
    if (index == 1) {
      return `Name in ('${prev}','${curr}'`
    }
    else if (index == self.length - 1) {
      return `${prev},'${curr}')`
    }
    return `${prev},'${curr}'`
  }))
}

export default function(graph) {
  return point => {
        return fetchVertexesByReference(point, 200)
          .then(getClosestVertex.bind(this, point))
          .then(findClosestFacility.bind(this, graph))
          .then(prepareExpression)
          .then(fetchVertexesByExpression)
          .then(fetchEdges)
  }
}
