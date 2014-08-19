#pragma strict

import System.Collections.Generic;

public var cameraTargets : GameObject[];
public var startPosIndex : int = 1;

function Start() {
	MoveTo(startPosIndex);
}

function Update() {
	for (var i = 0; i < cameraTargets.length; i++) {
		if (Input.GetKeyDown(KeyCode.Alpha0 + i)) {
			MoveTo(i);
		}
	}
}

function MoveTo(targetIndex : int) {
	transform.position = cameraTargets[targetIndex].transform.position;
}