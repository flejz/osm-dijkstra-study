import { Router } from 'express';

export default (timeGraph, distanceGraph) => {

	let api = Router();

	api.get('/directions', (req, res) => {
		res.json({ done: true })
	});

	api.get('/closest', (req, res) => {
		res.json({ done: true })
	})

	return api;
}
