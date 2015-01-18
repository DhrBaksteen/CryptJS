function FPSCameraControls(camera, eventTarget) {
	var lastMouseX, lastMouseY;
	var _this   = this;
	var TWO_PI  = Math.PI * 2.0;
	var HALF_PI = Math.PI / 2.0;

	var positionVector = new THREE.Vector3(0.0, 0.0, 0.0);
	var lookVector     = new THREE.Vector3(0.0, 0.0, 0.0);

	var yaw   = -HALF_PI;	// Left, right
	var pitch = 0.0;		// Up, down
	var roll  = 0.0;		// Tilt

	this.sensitivity  = 0.01;
	this.reversePitch = false;
	this.walkSpeed = 0.1;
	this.buttons = {
		forward: false,
		backward: false,
		left: false,
		right: false
	}

	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
	eventTarget.requestPointerLock = eventTarget.requestPointerLock || eventTarget.mozRequestPointerLock || eventTarget.webkitRequestPointerLock;
	eventTarget.addEventListener("click", function (e) {
		eventTarget.requestPointerLock();
	});


	var lockChanged = function(e) {
		if(document.pointerLockElement === eventTarget || document.mozPointerLockElement === eventTarget || document.webkitPointerLockElement === eventTarget) {
			eventTarget.addEventListener("mousemove", mouseMoveLocked, false);
		} else {
			eventTarget.removeEventListener("mousemove", mouseMoveLocked, false);
		}
	}


	var mouseMoveLocked = function(e) {
		var dYaw = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
		var dPitch = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		updateLookAt(dYaw, dPitch);
	}


	var mouseMove = function(e) {
		if (lastMouseX && lastMouseY) {
			var dYaw   = e.clientX - lastMouseX;
			var dPitch = e.clientY - lastMouseY;
			updateLookAt(dYaw, dPitch);
		}

		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
	}


	var updateLookAt = function(dYaw, dPitch) {
		if (dYaw) {
			dYaw *= _this.sensitivity;
			yaw = (yaw + dYaw) % TWO_PI;
		}

		if (dPitch) {
			dPitch *= _this.sensitivity;
			if (_this.reversePitch) { 
				pitch = Math.max(-HALF_PI, Math.min(pitch + dPitch, HALF_PI));
			} else {
				pitch = Math.max(-HALF_PI, Math.min(pitch - dPitch, HALF_PI));
			}
		}

		lookVector.x = positionVector.x + Math.cos(yaw) * Math.cos(pitch) * 100.0;
		lookVector.y = positionVector.y + Math.sin(pitch) * 100.0;
		lookVector.z = positionVector.z + Math.sin(yaw) * Math.cos(pitch) * 100.0;
		camera.lookAt(lookVector);
	}


	this.setPosition = function(x, y, z) {
		positionVector.x = x;
		positionVector.y = y;
		positionVector.z = z;

		camera.position.set(positionVector.x, positionVector.y, positionVector.z);
		updateLookAt();
	};


	this.setviewAngles = function(y, p, r) {
		updateLookAt(y - yaw, p - pitch);
	};


	this.updatePosition = function () {
		if (this.buttons.forward) {
			positionVector.x += Math.cos(yaw) * Math.cos(pitch) * this.walkSpeed;
			positionVector.z += Math.sin(yaw) * Math.cos(pitch) * this.walkSpeed;
			camera.position.set(positionVector.x, positionVector.y, positionVector.z);
			updateLookAt();
		}
		if (this.buttons.backward) {
			positionVector.x -= Math.cos(yaw) * Math.cos(pitch) * this.walkSpeed;
			positionVector.z -= Math.sin(yaw) * Math.cos(pitch) * this.walkSpeed;
			camera.position.set(positionVector.x, positionVector.y, positionVector.z);
			updateLookAt();
		}
		if (this.buttons.left) {
			positionVector.x += Math.cos(yaw - HALF_PI) * Math.cos(pitch) * this.walkSpeed;
			positionVector.z += Math.sin(yaw - HALF_PI) * Math.cos(pitch) * this.walkSpeed;
			camera.position.set(positionVector.x, positionVector.y, positionVector.z);
			updateLookAt();
		}
		if (this.buttons.right) {
			positionVector.x += Math.cos(yaw + HALF_PI) * Math.cos(pitch) * this.walkSpeed;
			positionVector.z += Math.sin(yaw + HALF_PI) * Math.cos(pitch) * this.walkSpeed;
			camera.position.set(positionVector.x, positionVector.y, positionVector.z);
			updateLookAt();
		}
	}

	document.addEventListener("keydown", function(e) {
		switch (e.keyCode) {
			case 87:
				_this.buttons.forward = true;
				break;
			case 83:
				_this.buttons.backward = true;
				break;
			case 65:
				_this.buttons.left = true;
				break;
			case 68:
				_this.buttons.right = true;
				break;
		}
	});

	document.addEventListener("keyup", function(e) {
		switch (e.keyCode) {
			case 87:
				_this.buttons.forward = false;
				break;
			case 83:
				_this.buttons.backward = false;
				break;
			case 65:
				_this.buttons.left = false;
				break;
			case 68:
				_this.buttons.right = false;
				break;
		}
	});

	if (eventTarget.requestPointerLock) {
		document.addEventListener("pointerlockchange",       lockChanged, false);
		document.addEventListener("mozpointerlockchange",    lockChanged, false);
		document.addEventListener("webkitpointerlockchange", lockChanged, false);
	} else {
		eventTarget.addEventListener("mousemove", mouseMove, false);
	}
	this.setviewAngles(0, 0, 0);
}