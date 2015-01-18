var PrefabUtils = {
	NORTH: 0,
	EAST:  1,
	SOUTH: 2,
	WEST:  3,

	/**
	 * Place a prefab in a room geometry.
	 *
	 * @param	roomGeom		{THREE.Geometry}	Geometry object to add the prefab to.
	 * @param	prefabGeom		{THREE.Geometry}	Prefab geometry object.
	 * @param	row				{Integer}			Row coordinate on floor of roomGeom.
	 * @param	col				{Integer}			Column coordinate on floor of roomGeom.
	 * @param	direction		{Integer}			Optional wall direction for prefab.
	 */
	placePrefab: function(roomGeom, prefabGeom, row, col, direction) {
		var geom   = prefabGeom.clone();
		var matrix = new THREE.Matrix4();

		switch(direction) {
			case PrefabUtils.EAST:
				matrix.set(
					0, 0, -1, col,
					0, 1,  0, 0,
					1, 0,  0, row,
					0, 0,  0, 1
				);
				break;
			case PrefabUtils.SOUTH:
				matrix.set(
					-1, 0,  0, col,
					 0, 1,  0, 0,
					 0, 0, -1, row,
					 0, 0,  0, 1
				);
				break;
			case PrefabUtils.WEST:
				matrix.set(
					 0, 0, 1, col,
					 0, 1, 0, 0,
					-1, 0, 0, row,
					 0, 0, 0, 1
				);
				break;
			case PrefabUtils.NORTH:
			default:
				matrix.set(
					1, 0, 0, col,
					0, 1, 0, 0,
					0, 0, 1, row,
					0, 0, 0, 1
				);
				break;
		}

		geom.applyMatrix(matrix);
		roomGeom.merge(geom);
	},


	/**
	 * Generate prefab geometry.
	 *
	 * @param	prefabName			{String}	Name of the prefab to generate.
	 * @param	dungeonStyle		{String}	Name of the dungeon style for this prefab.
	 *
	 * @return	{THREE.Geometry}				Geometry object for this prefab.
	 */
	createPrefabGeometry: function(prefabName, materials) {
		var prefab      = _.find(prefabs.prefabs, { name: prefabName });
		var prefabGeom  = prefab.geometry;
		var materialRef = {};

		// Create the geometry.
		var geometry  = new THREE.Geometry();
		geometry.name = prefab.name;

		// Create vertex array and stretch prefab up to height.
		geometry.vertices = _.map(prefabGeom.vertices, function(vertex) {
			return new THREE.Vector3(
				vertex.x,
				vertex.y,
				vertex.z
			);
		});

		// Construct faces.
		geometry.faces = _.map(prefabGeom.faces, function(face) {
			return new THREE.Face3(
				face.v[0],
				face.v[1],
				face.v[2],
				null, 0xFFFFFF, materials[face.matGroup]
			);
		});

		// Construct array of vertext normals.
		var vertexNormals = _.map(prefabGeom.normalVertices, function(normalVertex) {
			return new THREE.Vector3(
				normalVertex.x,
				normalVertex.y,
				normalVertex.z
			);
		});

		// Assign vertex normals to each face.
		_.forEach(geometry.faces, function(face, i) {
			for (var j = 0; j < 3; j ++) {
				face.vertexNormals.push(vertexNormals[prefabGeom.faces[i].vn[j]]);
			}
		});

		// Construct array of texture vertices.
		var textureVertices = _.map(prefabGeom.textureVertices, function(textureVertex) {
			return new THREE.Vector2(
				textureVertex.u,
				textureVertex.v
			);
		});

		// Assign texture vertices to faces.
		geometry.faceVertexUvs = [_.map(prefabGeom.faces, function(face) {
			return [
				textureVertices[face.vt[0]],
				textureVertices[face.vt[1]],
				textureVertices[face.vt[2]]
			];
		})];

		geometry.verticesNeedUpdate = true;
		geometry.uvsNeedUpdate      = true;
		geometry.elementsNeedUpdate = true;
		geometry.computeFaceNormals();

		return geometry;
	},


	getRandomElement: function(set) {
		var index = Math.floor(Math.random() * set.length);
		return set[index];
	}
};