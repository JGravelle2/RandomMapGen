#pragma strict

import System.Collections.Generic;

public var cameraTargets : GameObject[];

function Update() {
	for (var i = 0; i < cameraTargets.length; i++) {
		if (Input.GetKeyDown(KeyCode.Alpha0 + i)) {
			Debug.Log(cameraTargets[i]);
		}
	}
}