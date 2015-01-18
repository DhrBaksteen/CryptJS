function Room (rows, cols, style) {
	this.rows  = rows;
	this.cols  = cols;
	this.style = style;

	var mesh;


	this.construct = function() {
		// Select random texture from each material style.
		var roomMaterials = {};
		for (texture in this.style.materials) {
			var materialDef    = this.style.materials[texture];
			var materialIndex  = Math.floor(Math.random() * materialDef.length);
			roomMaterials[texture] = materialDef[materialIndex];
		}

		var wallName      = PrefabUtils.getRandomElement(this.style.prefabs.walls);
		var variationName = PrefabUtils.getRandomElement(this.style.prefabs.wall_variation_1);

		var prefabWall          = PrefabUtils.createPrefabGeometry(wallName, roomMaterials);
		var prefabWallVariation = PrefabUtils.createPrefabGeometry(variationName, roomMaterials);
		var prefabFloorCeiling  = PrefabUtils.createPrefabGeometry("floor_ceiling", roomMaterials);

		var roomGeom = new THREE.Geometry();

		for (var row = -Math.floor(this.rows / 2); row < Math.ceil(this.rows / 2); row ++) {
			for (var col = -Math.floor(this.cols / 2); col < Math.ceil(this.cols / 2); col ++) {
				var northEdge = row === -Math.floor(this.rows / 2);
				var southEdge = row === Math.ceil(this.rows / 2) - 1;
				var eastEdge  = col === -Math.floor(this.cols / 2);
				var westEdge  = col === Math.ceil(this.cols / 2) - 1;

				PrefabUtils.placePrefab(roomGeom, prefabFloorCeiling, row, col);

				var wallPrefab = prefabWall;
				if (((northEdge || southEdge) && col % 2 === 0) || ((eastEdge || westEdge) && row % 2 === 0)) {
					wallPrefab = prefabWallVariation;
				}

				// North or south wall?
				if (northEdge) {
					PrefabUtils.placePrefab(roomGeom, wallPrefab, row, col, PrefabUtils.NORTH);
				} else if (southEdge) {
					PrefabUtils.placePrefab(roomGeom, wallPrefab, row, col, PrefabUtils.SOUTH);
				}

				// East or west wall?
				if (eastEdge) {
					PrefabUtils.placePrefab(roomGeom, wallPrefab, row, col, PrefabUtils.WEST);
				} else if (westEdge) {
					PrefabUtils.placePrefab(roomGeom, wallPrefab, row, col, PrefabUtils.EAST);
				}
			}
		}

		mesh = new THREE.Mesh(roomGeom, materials);
	}


	this.getMesh = function() {
		return mesh;
	}

	this.construct();
}