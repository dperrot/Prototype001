#pragma strict

function RandInt (n : float) {
	return Mathf.FloorToInt(Random.value * n);
}

function RandInt (n : int) {
	return Mathf.FloorToInt(Random.value * n);
}

function NumOfBits (n : int) {
	n = n - ((n >> 1) & 0x55555555);
	n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
	return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

function NumOfBits (n : byte) {
	n = n - ((n >> 1) & 0x55555555);
	n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
	return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

function Shuffle (l : GameObject[]) {
	var t : GameObject;
	
	for (var i = 0; i < l.length; i++) {
		var j : int = i + RandInt(l.length - i);
		t = l[i];
		l[i] = l[j];
		l[j] = t;
	}
}