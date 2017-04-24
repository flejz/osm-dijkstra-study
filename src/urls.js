export default {
	base: 'http://services3.arcgis.com/fIQD4Y9pONzwXQjt/arcgis/rest/services/emergency_care_optimizer/FeatureServer',
	layers: {
		hospital: 0,
		vertex: 1,
		edge: 2
	},
	get(layer) {
		return `${this.base}/${this.layers[layer]}`
	}
}
