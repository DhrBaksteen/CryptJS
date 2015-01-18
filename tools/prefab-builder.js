var _ = require("lodash");
var fs = require("fs");

hello();

if (process.argv.indexOf("add") !== -1) {
	addPrefab();
} else if (process.argv.indexOf("info") !== -1) {
	summarize();
} else {
	console.log("The following options are available:\n");
	console.log("info - Get content summary of prefabs file.")
	console.log("node prefab-builder info [prefabs=prefabs.json]\n");
	console.log("add - Add a new prefab.");
	console.log("node prefab-builder add obj=objFile.obj [name=prefabName] [prefabs=prefabs.json]\n");
}


function addPrefab () {
	var prefabsPath = "prefabs.json";
	var objFile, prefabName;
	var vAdded =  0;
	var vnAdded = 0;
	var vtAdded = 0;

	_.forEach(process.argv, function(arg) {
		if (arg.indexOf("prefabs=") !== -1) {
			prefabsPath = arg.split("=")[1];
		} else if (arg.indexOf("obj=") !== -1) {
			objFile = arg.split("=")[1];
		} else if (arg.indexOf("name=") !== -1) {
			prefabName = arg.split("=")[1];
		}
	});

	if (prefabsPath && objFile) {
		if (!prefabName) {
			prefabName = objFile.substring(objFile.lastIndexOf("/") + 1, objFile.lastIndexOf("."));
		}

		var prefabs   = getPrefabs(prefabsPath);
		var objPrefab = readObj(objFile);
		var prefab    = {
			name:     prefabName,
			geometry: objPrefab
		};

		if (!objPrefab) {
			console.log("Object file not found!\n");
			return;
		}

		var prefabIndex = _.findIndex(prefabs.prefabs, { name: prefabName });
		if (prefabIndex !== -1) {
			console.log("Replacing prefab " + prefabName + "...");
			prefabs.prefabs[prefabIndex] = prefab;
		} else {
			console.log("Adding prefab " + prefabName + "...");
			prefabs.prefabs.push(prefab);
		}

		fs.writeFileSync(prefabsPath, JSON.stringify(prefabs));
		console.log("Done!\n");
	} else {
		console.log("\nParameter mismatch!");
		console.log("To add a prefab use");
		console.log("node prefab-builder add obj=objFile.obj [name=prefabName] [prefabs=prefabs.json]");
	}
}


function summarize () {
var prefabsPath = "prefabs.json";

	_.forEach(process.argv, function(arg) {
		if (arg.indexOf("prefabs=") !== -1) {
			prefabsPath = arg.split("=")[1];
		}
	});

	var prefabs = getPrefabs(prefabsPath);

	console.log(prefabs.vertices.length + " vertices.");
	console.log(prefabs.normalVertices.length + " normal vertices.");
	console.log(prefabs.textureVertices.length + " texture vertices.");
	console.log(prefabs.prefabs.length + " prefabs:");
	_.forEach(prefabs.prefabs, function(prefab) {
		console.log("\t" + prefab.name + " - " + prefab.geometry.length + " faces.");
	});

	console.log("Done!\n");
}


function readObj (fileName) {
	console.log("Reading OBJ file " + fileName + "...");
	if (!fs.existsSync(fileName)) return;

	var obj = String(fs.readFileSync(fileName)).split("\n");
	var matGroup  = "wall";
	var objPrefab = {
		vertices:        [],
		textureVertices: [],
		normalVertices:  [],
		faces:           []
	};

	_.forEach(obj, function(line) {
		line = line.replace(/\s+/g, " ").trim().toLowerCase().split(" ");

		switch (line[0]) {
			case "v":
				objPrefab.vertices.push({
					x: Number(line[1]),
					y: Number(line[2]),
					z: Number(line[3])
				});
				break;
			case "vn":
				objPrefab.normalVertices.push({
					x: Number(line[1]),
					y: Number(line[2]),
					z: Number(line[3])
				});
				break;
			case "vt":
				objPrefab.textureVertices.push({
					u: Number(line[1]),
					v: Number(line[2])
				});
				break;
			case "f":
				var face = {
					matGroup: matGroup,
					v:  [], vn: [], vt: []
				};

				for (var i = 1; i < 4; i ++) {
					var faceParams = line[i].split("/");
					face.v.push(Number(faceParams[0]) - 1);
					face.vn.push(Number(faceParams[2]) - 1);
					face.vt.push(Number(faceParams[1]) - 1);
				}

				objPrefab.faces.push(face);
				break;
			case "usemtl":
				matGroup = line[1];
				break;
		}
	});

	console.log("\t" + objPrefab.faces.length           + " faces.");
	console.log("\t" + objPrefab.vertices.length        + " vertices.");
	console.log("\t" + objPrefab.normalVertices.length  + " normal vertices.");
	console.log("\t" + objPrefab.textureVertices.length + " texture vertices.\n");
	return objPrefab;
}


function getPrefabs (prefabsPath) {
	if (fs.existsSync(prefabsPath)) {
		console.log("Loading prefabs from " + prefabsPath + "...\n");
		return JSON.parse(fs.readFileSync(prefabsPath));
	} else {
		console.log(prefabsPath + " does not exist yet...\n");
		return {
			prefabs: []
		};
	}
}


function hello () {
	console.log("\n");
	console.log(" _____         ___     _   _____     _ _   _         ");
	console.log("|  _  |___ ___|  _|___| |_| __  |_ _|_| |_| |___ ___ ");
	console.log("|   __|  _| -_|  _| .'| . | __ -| | | | | . | -_|  _|");
	console.log("|__|  |_| |___|_| |__,|___|_____|___|_|_|___|___|_|  ");
	console.log("\n");
}