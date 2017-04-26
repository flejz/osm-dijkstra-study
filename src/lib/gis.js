/**
 * Converts coordinate to radians
 * @param  {double} value
 * @return {double}       The rad
 */
export function toRadians(value) {
	return (!value ? this : value) * Math.PI / 180;
}
Number.prototype.toRadians = toRadians


/**
 * Calculates the distance from two coordinates
 * @param  {double} lat1
 * @param  {double} lon1
 * @param  {double} lat2
 * @param  {double} lon2
 * @return {double}      The distance
 */
export function distance([lat1, lon1], [lat2, lon2]) {

	const R = 6371 // metres
	const φ1 = lat1.toRadians()
	const φ2 = lat2.toRadians()
	const Δφ = (lat2-lat1).toRadians()
	const Δλ = (lon2-lon1).toRadians()

	let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2)
	let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

	let d = R * c
	return d
}

/**
 * Gets the closest to compare
 * @param  {object} point
 * @param  {list}   toCompare
 */
export function closest(point, toCompare) {

  let dist, closest;
  for (let compare of toCompare) {

    let distanceBetween = distance([point.lat, point.lon], [compare.lat, compare.lon])

    if (!closest) {
      closest = compare
      dist = distanceBetween
    }
    else if (dist > distanceBetween) {
      closest = compare
      dist = distanceBetween
    }
	}
  return closest
}
