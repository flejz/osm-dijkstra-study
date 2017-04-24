

const Graph = require('node-dijkstra')
const graphDistance = require('./graph/graph_distance.json')


const route = new Graph(graphDistance)


let teste = route.path('pt4973', 'pt5121')

console.log(teste);
