import { Router } from 'express';
import Optimizer from '../optimizer/closestFacilities'

const timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};

let bench = null

export default (timeGraph, distanceGraph) => {

	let api = Router();

	const fastest = Optimizer(timeGraph)
	const closest = Optimizer(distanceGraph)

	api.get('/fastest', (req, res) => {

		const point = {
			lat: parseFloat(req.query.lat),
			lon: parseFloat(req.query.lon),
		}

		bench = timer('fastest')

		fastest(point)
			.then(result => {
					bench.stop()
					res.json(result)
			})
			.catch(res.json)
	});

	api.get('/closest', (req, res) => {
		res.json({ done: true })
	})

	return api;
}
