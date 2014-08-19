#pragma strict

import System.Collections.Generic;

public var tilePrefab : GameObject;
public var allowRandom : boolean = true;

private var spawnedTiles : List.<GameObject> = new List.<GameObject>();
private var madeMap = [
	[0, 0, 1, 3, 1, 1, 0],
	[0, 1, 1, 3, 3, 3, 1],
	[1, 3, 3, 3, 2, 1, 1],
	[0, 1, 3, 3, 3, 1, 3],
	[1, 3, 1, 2, 3, 3, 3],
	[3, 3, 3, 2, 3, 2, 1],
	[1, 2, 3, 3, 3, 1, 0],
	[0, 0, 2, 3, 1, 0, 0]
];

function Start() {
	PermuteMap();
}

function Update() {
	if (Input.GetKeyDown(UnityEngine.KeyCode.Space)) {
		PermuteMap();
	}
}

private class TileSpawnData {
	public var tile : GameObject;
	public var x : int;
	public var y : int;

	public function TileSpawnData(tile : GameObject, x : int, y : int) {
		this.tile = tile;
		this.x = x;
		this.y = y;
	}
}

private function PermuteMap() {
	// Clean up old map
	for (var tile : GameObject in spawnedTiles) {
		GameObject.Destroy(tile);
	}
	spawnedTiles.Clear();
	
	// Create new map
	var w = madeMap.length;
	var h = madeMap[0].length;
	var tileMap = new GameObject[w, h];
	var i = 0;
	var j = 0;
	for (i = 0; i < w; i++) {
		for (j = 0; j < h; j++) {
			var newTile : GameObject = null;
			var tileVal = madeMap[i][j];
			var randSpawn = Random.value > 0.5;
			if (tileVal == 3 ||
					(tileVal == 2 && (!allowRandom || randSpawn)) ||
					tileVal == 1 && allowRandom && randSpawn) {
				var z = -(i - w/2);
				var x = j - h/2;
				newTile = GameObject.Instantiate(tilePrefab);
				newTile.transform.parent = transform;
				newTile.transform.position = new Vector3(x, 0, z) + transform.position;
				newTile.GetComponent.<MapTile>().SetDoors(0);
			}
			spawnedTiles.Add(newTile);
			// tileMap[i,j] = TileSpawnData(newTile, i, j);
			tileMap[i,j] = newTile;
		}
	}

	// Connect paths
	for (i = 0; i < w; i++) {
		for (j = 0; j < h; j++) {
			// var tileObj = tileMap[i,j].tile;
			var tileObj = tileMap[i,j];
			if (tileObj) {
				var tile = tileObj.GetComponent.<MapTile>();
				if (tile) {
					var doors : Dir = 0;
					for (var k = 0; k < 4; k++) {
						var s = k % 2 ? 1 : -1;
						var oi = i + (k / 2 ? 0 : s);
						var oj = j + (k / 2 ? -s : 0);
						if (oi >= 0 && oi < w &&
								oj >= 0 && oj < h &&
								tileMap[oi,oj]) {
							var d : Dir = 1 << k;
							doors |= d;
						}
					}
					tile.SetDoors(doors);
				}
			}
		}
	}
}