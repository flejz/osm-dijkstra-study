import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import urls from '../urls'
import {closest} from '../lib/gis'
import relations from '../data/vertex_edge_relation'

function intersects(first, second) {

  let small = first.length < second.length ? first : second
  let big = first.length < second.length ? second : first
  let result = []
  for (var i=0; i < small.length; ++i) {
    if (big.indexOf(small[i]) != -1) {
      result.push(small[i]);
    }
  }
  return result
}


export function fetchEdges(interop) {

  console.log('fetching edges');

  const path = interop.destination.route.path
  let way = []

  for (var i = 1; i < path.length; i++) {
    const ini = relations[path[i-1]]
    const end = relations[path[i]]

    way.push(intersects(ini, end)[0])
  }

  let params = {
    where: `ST_ID in (${way.map(item => `'${item}'`)})`,
    f: 'json'
  }

  console.log(params.where);

  return req({
    method: 'POST',
    uri: `${urls.get('edge')}/query?${qs.stringify(params)}`,
    body: params,
    json: true
  }).then(edges => {
    interop.destination.route.way = way
    interop.destination.route.edges = edges.features

    return Promise.resolve(interop)
  }).catch(Promise.reject)
}
