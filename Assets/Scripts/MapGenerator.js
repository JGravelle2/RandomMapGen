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
	[1, 3, 1, 3, 3, 3, 3],
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

private class PathFindNode {
	public var tile : TileSpawnData;
	public var parent : PathFindNode;
	public function PathFindNode(t : TileSpawnData, p : PathFindNode) {
		tile = t;
		parent = p;
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
	var tileMap = new TileSpawnData[w, h];
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
			if (newTile) {
				spawnedTiles.Add(newTile);
				tileMap[i,j] = new TileSpawnData(newTile, i, j);
			}
		}
	}

	// Connect paths
	var openSet = new List.<TileSpawnData>();
	var cx : int = 0;
	var cy : int = 0;
	for (i = 0; i < w; i++) {
		for (j = 0; j < h; j++) {
			if (tileMap[i,j]) {
				openSet.Add(tileMap[i,j]);
				cx += i;
				cy += j;
			}
		}
	}
	cx = Mathf.RoundToInt(cx cast float / spawnedTiles.Count);
	cy = Mathf.RoundToInt(cy cast float / spawnedTiles.Count);

	var pathFind = function(start : TileSpawnData, end : TileSpawnData) : List.<TileSpawnData> {
		var containsTile = function(list : List.<PathFindNode>, t : TileSpawnData) {
			for (var i = 0; i < list.Count; i++) {
				var n = list[i];
				if (n.tile === t) {
					return true;
				}
			}
			return false;
		};
		var toCheck = new List.<PathFindNode>();
		var checked = new List.<PathFindNode>();
		toCheck.Add(new PathFindNode(start, null));
		while (toCheck.Count > 0) {
			var t = toCheck[0];
			toCheck.RemoveAt(0);
			checked.Add(t);

			if (t.tile === end) {
				var retList = new List.<TileSpawnData>();
				var cur = t;
				while (cur) {
					retList.Add(cur.tile);
					cur = cur.parent;
				}
				return retList;
			}

			var x = t.tile.x;
			var y = t.tile.y;
			var neighbors = [
				x - 1 >= 0 ? tileMap[x - 1, y] : null,
				y - 1 >= 0 ? tileMap[x, y - 1] : null,
				x + 1 < w ? tileMap[x + 1, y] : null,
				y + 1 < h ? tileMap[x, y + 1] : null
			];
			for (var i = 0; i < neighbors.length; i++) {
				var n = neighbors[i];
				if (n && !containsTile(checked, n)) {
					toCheck.Add(new PathFindNode(n, t));
				}
			}
		}
		return new List.<TileSpawnData>();
	};

	var center = tileMap[cx, cy];
	while (!center && spawnedTiles.Count > 0) {
		center = tileMap[Random.Range(0, w), Random.Range(0, h)];
	}
	var p = center.tile.transform.position;
	Debug.DrawLine(p, p + Vector3(1, 1, 1), Color.red, 1000, false);
	while (openSet.Count > 0) {
		var tile = openSet[0];
		var path = pathFind(tile, center);
		while (path.Count > 1) {
			var fst = path[0];
			var snd = path[1];
			path.RemoveAt(0);
			var dy = snd.x - fst.x;
			var dx = snd.y - fst.y;
			var d1 : Dir;
			var d2 : Dir;
			if (dx == -1) {
				d1 = Dir.West;
				d2 = Dir.East;
			}
			else if (dx == 1) {
				d1 = Dir.East;
				d2 = Dir.West;
			}
			else if (dy == -1) {
				d1 = Dir.North;
				d2 = Dir.South;
			}
			else if (dy == 1) {
				d1 = Dir.South;
				d2 = Dir.North;
			}
			Debug.DrawLine(fst.tile.transform.position, snd.tile.transform.position, Color.white, 1000, false);
			fst.tile.GetComponent.<MapTile>().OpenDoors(d1);
			snd.tile.GetComponent.<MapTile>().OpenDoors(d2);
			openSet.Remove(fst);
		}
		openSet.RemoveAt(0);
	}
}