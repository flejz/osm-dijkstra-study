
/**
 * Creates a callback that proxies node callback style arguments to an Express Response object.
 * @param {express.Response} res	Express HTTP Response
 * @param {number} [status=200]	Status code to send on success
 */
export function toRes(res, status=200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err)

		if (thing && typeof thing.toObject==='function') {
			thing = thing.toObject()
		}
		res.status(status).json(thing)
	}
}

/**
 * Creates a benchmark test
 * @param  {string} name the name identifier
 * @return {function} the stop function
 */
export function benchmark(name) {
    var start = new Date()
    return {
        stop() {
            let end  = new Date(),
							time = end.getTime() - start.getTime()
            console.log(`[Benchmark] [${name}] Execution time: ${time} ms`)
        }
    }
}
