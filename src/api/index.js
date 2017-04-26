import { Router } from 'express';
import { benchmark } from '../lib/util'
import Optimizer from '../optimizer/closestFacilities'

export default (timeGraph, distanceGraph) => {

	let api = Router();

	const fastest = Optimizer(timeGraph)
	const closest = Optimizer(distanceGraph)

	api.get('/fastest', (req, res) => {

		if (!req.query || !req.query.lat || !req.query.lon) {
			return res.status(501).json({ error: 'Missing parameters' })
		}

		const point = {
			lat: parseFloat(req.query.lat),
			lon: parseFloat(req.query.lon),
		}

		const bench = benchmark('Fastest')

		return fastest(point)
			.then(result => {
				bench.stop()
				res.json(result)
			})
			.catch(err => {
				console.error(err);
				bench.stop()
				res.send(err).status(501)
			})
	});

	api.get('/closest', (req, res) => {
		res.json({ done: true })
	})

	return api;
}
