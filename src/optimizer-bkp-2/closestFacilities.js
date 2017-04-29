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

function prepareExpression(interop) {

  console.log('prepare expression');

  interop.expression = interop.destination.route.path.reduce((prev, curr, index, self) => {
    if (index == 1) {
      return `Name in ('${prev}','${curr}'`
    }
    else if (index == self.length - 1) {
      return `${prev},'${curr}')`
    }
    return `${prev},'${curr}'`
  })

  return Promise.resolve(interop)
}

function generateRoute(interop) {

  console.log('generating route');

  const path = interop.destination.route.path
  const vertexes = interop.destination.route.vertexes
  const edges = interop.destination.route.edges

  console.log(`POINTS NAMES LENGTH: ${path.length}`);
  console.log(`POINTS FEATURES LENGTH: ${vertexes.length}`);

  function getCoordinateFromVertex(name) {
    let point = vertexes.filter(feature => feature.attributes.Name == name)
    console.log(`>>>>>>>>>>>> PT : ${name}`);
    console.log(point);
    point = point[0]
    return [point.geometry.x, point.geometry.y]
  }

  let iniXY = getCoordinateFromVertex(path[0]),
    endXY = getCoordinateFromVertex(path[1])

  function compareCoordinates([lon1, lat1], [lon2, lat2]) {

    const length = distance([lat1, lon1], [lat2, lon2])

    if (length < 0.1) {
      console.log('========================')
      console.log('DISTANCE');
      console.log(distance);
      console.log('COORDINATOR LON')
      console.log(lon1);
      console.log(lon2);
      console.log('COORDINATOR LAT')
      console.log(lat1);
      console.log(lat2);
      console.log('========================')
    }

    return length < 0.1
  }

  let teste = edges.filter(edge => {

    if (!edge.geometry.paths) {
      return false
    }

    console.log(`>>>>>>>>>>>>> >>>>>>>>>>>>> edge: ${edge.attributes.ST_ID}}`);

    let hasIni = false, hasEnd = false

    edge.geometry.paths[0].forEach(coordinate => {

      if (!hasIni) {
        hasIni =  compareCoordinates(coordinate, iniXY)

        if (hasIni) {
          console.log('ACHOU INI');
          console.log(edge.attributes);
          console.log(iniXY);
          console.log(coordinate);
        }
      }

      if (!hasEnd) {
        hasEnd =  compareCoordinates(coordinate, endXY)
        if (hasEnd) {
          console.log('ACHOU END');
          console.log(edge.attributes);
          console.log(endXY);
          console.log(coordinate);
        }
      }
    })

    return hasIni && hasEnd
  })

  console.log(teste);
  console.log(iniXY);
  console.log(endXY);

}

export default function(graph) {
  return point => {
        return fetchVertexesByReference(point, 200)
          .then(getClosestVertex.bind(this, point))
          .then(findClosestFacility.bind(this, graph))
          .then(prepareExpression)
          .then(fetchVertexesByExpression)
          .then(fetchEdges)
          .then(generateRoute)
  }
}
