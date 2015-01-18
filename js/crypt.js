var camera, scene, renderer, controls;
var clock = new THREE.Clock();
var prefabs;
var materials;
var dungeonStyles = {};

function loadStyleDefs() {
	var req = new XMLHttpRequest();
	req.open("GET", "res/style_def.json", false);
	req.send(null);
	var styleDef = JSON.parse(req.responseText);

	// Load textures.
	materials = new THREE.MeshFaceMaterial();
	_.forEach(styleDef.maps, function(map) {
		var texture   = THREE.ImageUtils.loadTexture("res/maps/" + map + ".png");
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		materials.materials.push(new THREE.MeshLambertMaterial({ color: 0xFFFFFF, map: texture }));
	});

	dungeonStyles = styleDef.dungeonStyles;
}

function init() {
	loadStyleDefs();

	var req = new XMLHttpRequest();
	req.open("GET", "res/prefabs.json", false);
	req.send(null);
	prefabs = JSON.parse(req.responseText);

	var SCREEN_WIDTH  = 800; //window.innerWidth;
	var SCREEN_HEIGHT = 600; //window.innerHeight;
	var container     = document.getElementById("main");

	renderer = new THREE.WebGLRenderer({ 
		antialias: true
	});
	renderer.setClearColor(0x040010, 1);
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container.appendChild(renderer.domElement);
	renderer.gammaInput  = true;
	renderer.gammaOutput = true;

	// Camera
	camera = new THREE.PerspectiveCamera(60, SCREEN_WIDTH / SCREEN_HEIGHT, 0.01, 10000);
	controls = new FPSCameraControls(camera, renderer.domElement);
	controls.setPosition(0, 0.8, 0);

	// Scene
	scene     = new THREE.Scene();
	scene.fog = new THREE.Fog(0xffffff, 1000, 10000);

	// Light
	var ambientLight = new THREE.AmbientLight(0x404040);
	scene.add(ambientLight);
	var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.75);
	directionalLight.position.set(0.7, 0.2, 0.3);
	scene.add(directionalLight);

	var roomRows    = (Math.floor(Math.random() * 4) * 2) + 5;
	var roomColumns = (Math.floor(Math.random() * 4) * 2) + 5;
	var roomHeight  = (Math.floor(Math.random() * 5) * 32) + 128;
	var room = new Room(roomRows, roomColumns, dungeonStyles.crypt);

	scene.add(room.getMesh());
	animate ();
}


function animate () {
	requestAnimationFrame (animate);

	controls.updatePosition()
	renderer.render (scene, camera);
}


function randomOf(set) {
	var rndIndex = Math.floor(Math.random() * set.length);
	return set[rndIndex];
}