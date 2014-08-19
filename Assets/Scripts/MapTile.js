#pragma strict

import System.Collections.Generic;

public enum Dir {
	North = 0x1,
	South = 0x2,
	East = 0x4,
	West = 0x8
}

public var northDoor : GameObject;
public var southDoor : GameObject;
public var eastDoor : GameObject;
public var westDoor : GameObject;

private var openDoors : Dir = 0;

function Start() {
	// var v : int = 0;
	// for (var i : int = 0; i < 4; i++) {
	// 	v <<= 1;
	// 	v |= (Random.value > 0.5 ? 1 : 0);
	// }
	// SetDoors(v);
}

function OpenDoors(doors : Dir) {
	SetDoors(openDoors | doors);
}

function CloseDoors(doors : Dir) {
	SetDoors(openDoors & (~doors));
}

function SetDoors(doors : Dir) {
	if (openDoors != doors) {
		openDoors = doors;
		UpdateDoors();
	}
}

function UpdateDoors() {
	northDoor.SetActive(!(openDoors & Dir.North));
	southDoor.SetActive(!(openDoors & Dir.South));
	eastDoor.SetActive(!(openDoors & Dir.East));
	westDoor.SetActive(!(openDoors & Dir.West));
}