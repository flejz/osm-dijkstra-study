/**
 * This process generates the json with the map of the hospital
 * facilities and his closest vertex
 */

import qs from 'querystring'
import Promise from 'bluebird'
import req from 'request-promise'
import fs from 'fs'
import urls from '../src/urls'
import { featuresToPoints, fetchVertexes, getClosestVertex } from '../src/optimizer/vertex'

function fetchHospitalClosestVertex() {

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
            return fetchVertexes(point, 5000)
              .then(getClosestVertex.bind(null, point))
              .then(closest => Promise.resolve({ vertex: closest , hospital: point}))
          })
        )
      })
      .then(locations => resolve(locations ))
      .catch(reject)
  })
}

console.log(`> Executing`)
fetchHospitalClosestVertex()
  .then(data => {
    data.forEach(item => {
      if (!item.vertex) {
        console.log(`> Hospital does not have a closest vertex. "${item.hospital.name}"`)
      }
    })

    fs.writeFile('./src/data/hospitalMap.json', JSON.stringify(data), 'utf8', function (err) {
      if (err) {
        console.error(err)
      }
      console.log(`> Done`)
    })
  })
  .catch(console.error)
