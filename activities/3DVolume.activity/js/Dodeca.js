let p = (1 + Math.sqrt(5)) / 2;
let q = 1 / p;
let vertices2 = [
	[0, q, p],
	[0, q, -p],
	[0, -q, p],
	[0, -q, -p],
	[p, 0, q],
	[p, 0, -q],
	[-p, 0, q],
	[-p, 0, -q],
	[q, p, 0],
	[q, -p, 0],
	[-q, p, 0],
	[-q, -p, 0],
	[1, 1, 1],
	[1, 1, -1],
	[1, -1, 1],
	[1, -1, -1],
	[-1, 1, 1],
	[-1, 1, -1],
	[-1, -1, 1],
	[-1, -1, -1],
];
let faces2 = [
	[2, 14, 4, 12, 0, 1],
	[15, 9, 11, 19, 3, 2],
	[16, 10, 17, 7, 6, 3],
	[6, 7, 19, 11, 18, 4],
	[6, 18, 2, 0, 16, 5],
	[18, 11, 9, 14, 2, 6],
	[1, 17, 10, 8, 13, 7],
	[1, 13, 5, 15, 3, 8],
	[13, 8, 12, 4, 5, 9],
	[5, 4, 14, 9, 15, 10],
	[0, 12, 8, 10, 16, 11],
	[3, 19, 7, 17, 1, 12],
];

let scaleFactor2 = 1.5;
let values2 = 12;
let faceTexts2 = [
	" ",
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
	"13",
	"14",
	"15",
	"16",
	"17",
	"18",
	"19",
	"20",
];
let textMargin2 = 1.0;
let chamfer2 = 0.968;
let af2 = -Math.PI / 4 / 2;
let tab2 = 0.2;
let backColor2;
let color2;
function createDodecahedron(
	sharedColor,
	ifNumbers,
	ifTransparent,
	xCoordinateShared,
	zCoordinateShared,
	ifImage,
	sharedImageData,
	yCoordinateShared,
	quaternionShared,
	sharedTextColor,
	ctx,
	diceArray,
	world,
	scene,
	groundPhysMat,
	sharedAngVel1,
	sharedAngVel2,
	sharedAngVel3,
	uniqueId
) {
	let dodecahedron;
	let tempShowNumbers = ifNumbers == null ? ctx.showNumbers : ifNumbers;
	let tempTransparent =
		ifTransparent == null ? ctx.toggleTransparent : ifTransparent;
	let tempFillColor = sharedColor != null ? sharedColor : ctx.presentColor;
	let tempTextColor =
		sharedTextColor != null ? sharedTextColor : ctx.textColor;
	backColor2 = tempFillColor;
	color2 = tempTextColor;

	if (tempShowNumbers) {
		dodecahedron = new THREE.Mesh(getGeometry2(), getMaterials2());
	} else if (tempTransparent) {
		const dodecahedronTransparentGeometry = getGeometry2();
		const wireframe = new THREE.WireframeGeometry(
			dodecahedronTransparentGeometry
		);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			depthTest: true,
			opacity: 1,
			transparent: false,
		});
		const line = new THREE.LineSegments(wireframe, lineMaterial);
		dodecahedron = line;
	} else {
		const dodecahedronGeometry = getGeometry2();
		const dodecaMaterial = new THREE.MeshStandardMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});
		dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecaMaterial);
	}

	dodecahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
	dodecahedron.castShadow = true;
	dodecahedron.userData = uniqueId;
	scene.add(dodecahedron);

	const t = 1.618;
	const r = 0.618;
	let scaleFactorCannon = 0.83;

	const vertices3 = [
		new CANNON.Vec3(-1, -1, -1).scale(scaleFactorCannon),
		new CANNON.Vec3(-1, -1, 1).scale(scaleFactorCannon),
		new CANNON.Vec3(-1, 1, -1).scale(scaleFactorCannon),
		new CANNON.Vec3(-1, 1, 1).scale(scaleFactorCannon),
		new CANNON.Vec3(1, -1, -1).scale(scaleFactorCannon),
		new CANNON.Vec3(1, -1, 1).scale(scaleFactorCannon),
		new CANNON.Vec3(1, 1, -1).scale(scaleFactorCannon),
		new CANNON.Vec3(1, 1, 1).scale(scaleFactorCannon),
		new CANNON.Vec3(0, -r, -t).scale(scaleFactorCannon),
		new CANNON.Vec3(0, -r, t).scale(scaleFactorCannon),
		new CANNON.Vec3(0, r, -t).scale(scaleFactorCannon),
		new CANNON.Vec3(0, r, t).scale(scaleFactorCannon),
		new CANNON.Vec3(-r, -t, 0).scale(scaleFactorCannon),
		new CANNON.Vec3(-r, t, 0).scale(scaleFactorCannon),
		new CANNON.Vec3(r, -t, 0).scale(scaleFactorCannon),
		new CANNON.Vec3(r, t, 0).scale(scaleFactorCannon),
		new CANNON.Vec3(-t, 0, -r).scale(scaleFactorCannon),
		new CANNON.Vec3(t, 0, -r).scale(scaleFactorCannon),
		new CANNON.Vec3(-t, 0, r).scale(scaleFactorCannon),
		new CANNON.Vec3(t, 0, r).scale(scaleFactorCannon),
	];

	const indices = [
		[3, 11, 7],
		[3, 7, 15],
		[3, 15, 13],
		[7, 19, 17],
		[7, 17, 6],
		[7, 6, 15],
		[17, 4, 8],
		[17, 8, 10],
		[17, 10, 6],
		[8, 0, 16],
		[8, 16, 2],
		[8, 2, 10],
		[0, 12, 1],
		[0, 1, 18],
		[0, 18, 16],
		[6, 10, 2],
		[6, 2, 13],
		[6, 13, 15],
		[2, 16, 18],
		[2, 18, 3],
		[2, 3, 13],
		[18, 1, 9],
		[18, 9, 11],
		[18, 11, 3],
		[4, 14, 12],
		[4, 12, 0],
		[4, 0, 8],
		[11, 9, 5],
		[11, 5, 19],
		[11, 19, 7],
		[19, 5, 14],
		[19, 14, 4],
		[19, 4, 17],
		[1, 12, 14],
		[1, 14, 5],
		[1, 5, 9],
	];

	const dodecahedronShape = new CANNON.ConvexPolyhedron({
		vertices: vertices3,
		faces: indices,
	});

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 4 : 1; // Ensure initial y is above the plane
	const dodecahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: myShape,
		position: new CANNON.Vec3(x, y, z),
		material: new CANNON.Material(),
		restitution: 0.3, // Lower the restitution value
	});
	dodecahedronBody.sleepSpeedLimit = 0.2;
	dodecahedronBody.sleepTimeLimit = 3;
	dodecahedronBody.linearDamping = 0.1; // Apply linear damping
	dodecahedronBody.angularDamping = 0.1; // Apply angular damping

	world.addBody(dodecahedronBody);

	if (xCoordinateShared != null) {
		dodecahedronBody.sleep()
	}	
	const contactMat = new CANNON.ContactMaterial(
		groundPhysMat,
		dodecahedronBody.material,
		{ friction: ctx.friction }
	);
	world.addContactMaterial(contactMat);

	let angVel1 =
		sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 =
		sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;
	let angVel3 =
		sharedAngVel3 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel3;

	dodecahedronBody.angularVelocity.set(angVel1, angVel2, angVel3);

	dodecahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	dodecahedron.position.copy(dodecahedronBody.position); // Sync positions
	dodecahedron.quaternion.copy(dodecahedronBody.quaternion); // Sync orientations
	if (quaternionShared != null) {
		dodecahedron.quaternion.copy(quaternionShared);
		dodecahedronBody.quaternion.copy(quaternionShared);
	}

	diceArray.push([
		dodecahedron,
		dodecahedronBody,
		"dodeca",
		tempShowNumbers,
		tempTransparent,
		tempFillColor,
		tempTextColor,
		angVel1,
		angVel2,
		angVel3,
		contactMat,
	]);

}

function getGeometry2() {
	let radius = 1 * scaleFactor2;

	let vectors = new Array(vertices2.length);
	for (let i = 0; i < vertices2.length; ++i) {
		vectors[i] = new THREE.Vector3().fromArray(vertices2[i]).normalize();
	}

	let chamferGeometry = getChamferGeometry2(vectors);
	let geometry = makeGeometry2(
		chamferGeometry.vectors,
		chamferGeometry.faces2,
		radius,
		tab2,
		af2
	);
	myShape = createShape(vectors, faces2, radius);

	return geometry;
}

function getChamferGeometry2(vectors) {
	let chamfer_vectors = [],
		chamfer_faces = [],
		corner_faces = new Array(vectors.length);
	for (let i = 0; i < vectors.length; ++i) corner_faces[i] = [];
	for (let i = 0; i < faces2.length; ++i) {
		let ii = faces2[i],
			fl = ii.length - 1;
		let center_point = new THREE.Vector3();
		let face = new Array(fl);
		for (let j = 0; j < fl; ++j) {
			let vv = vectors[ii[j]].clone();
			center_point.add(vv);
			corner_faces[ii[j]].push((face[j] = chamfer_vectors.push(vv) - 1));
		}
		center_point.divideScalar(fl);
		for (let j = 0; j < fl; ++j) {
			let vv = chamfer_vectors[face[j]];
			vv.subVectors(vv, center_point)
				.multiplyScalar(chamfer2)
				.addVectors(vv, center_point);
		}
		face.push(ii[fl]);
		chamfer_faces.push(face);
	}
	for (let i = 0; i < faces2.length - 1; ++i) {
		for (let j = i + 1; j < faces2.length; ++j) {
			let pairs = [],
				lastm = -1;
			for (let m = 0; m < faces2[i].length - 1; ++m) {
				let n = faces2[j].indexOf(faces2[i][m]);
				if (n >= 0 && n < faces2[j].length - 1) {
					if (lastm >= 0 && m !== lastm + 1)
						pairs.unshift([i, m], [j, n]);
					else pairs.push([i, m], [j, n]);
					lastm = m;
				}
			}
			if (pairs.length !== 4) continue;
			chamfer_faces.push([
				chamfer_faces[pairs[0][0]][pairs[0][1]],
				chamfer_faces[pairs[1][0]][pairs[1][1]],
				chamfer_faces[pairs[3][0]][pairs[3][1]],
				chamfer_faces[pairs[2][0]][pairs[2][1]],
				-1,
			]);
		}
	}
	for (let i = 0; i < corner_faces.length; ++i) {
		let cf = corner_faces[i],
			face = [cf[0]],
			count = cf.length - 1;
		while (count) {
			for (let m = faces2.length; m < chamfer_faces.length; ++m) {
				let index = chamfer_faces[m].indexOf(face[face.length - 1]);
				if (index >= 0 && index < 4) {
					if (--index === -1) index = 3;
					let next_vertex = chamfer_faces[m][index];
					if (cf.indexOf(next_vertex) >= 0) {
						face.push(next_vertex);
						break;
					}
				}
			}
			--count;
		}
		face.push(-1);
		chamfer_faces.push(face);
	}
	return { vectors: chamfer_vectors, faces2: chamfer_faces };
}

function makeGeometry2(vertices2, faces2, radius) {
	let geom = new THREE.BufferGeometry();

	for (let i = 0; i < vertices2.length; ++i) {
		vertices2[i] = vertices2[i].multiplyScalar(radius);
	}

	let positions = [];
	const normals = [];
	const uvs = [];

	const cb = new THREE.Vector3();
	const ab = new THREE.Vector3();
	let materialIndex;
	let faceFirstVertexIndex = 0;

	for (let i = 0; i < faces2.length; ++i) {
		let ii = faces2[i],
			fl = ii.length - 1;
		let aa = (Math.PI * 2) / fl;
		materialIndex = ii[fl] + 1;
		for (let j = 0; j < fl - 2; ++j) {
			//Vertices
			positions.push(...vertices2[ii[0]].toArray());
			positions.push(...vertices2[ii[j + 1]].toArray());
			positions.push(...vertices2[ii[j + 2]].toArray());

			// Flat face normals
			cb.subVectors(vertices2[ii[j + 2]], vertices2[ii[j + 1]]);
			ab.subVectors(vertices2[ii[0]], vertices2[ii[j + 1]]);
			cb.cross(ab);
			cb.normalize();

			// Vertex Normals
			normals.push(...cb.toArray());
			normals.push(...cb.toArray());
			normals.push(...cb.toArray());

			//UVs
			uvs.push(
				(Math.cos(af2) + 1 + tab2) / 2 / (1 + tab2),
				(Math.sin(af2) + 1 + tab2) / 2 / (1 + tab2)
			);
			uvs.push(
				(Math.cos(aa * (j + 1) + af2) + 1 + tab2) / 2 / (1 + tab2),
				(Math.sin(aa * (j + 1) + af2) + 1 + tab2) / 2 / (1 + tab2)
			);
			uvs.push(
				(Math.cos(aa * (j + 2) + af2) + 1 + tab2) / 2 / (1 + tab2),
				(Math.sin(aa * (j + 2) + af2) + 1 + tab2) / 2 / (1 + tab2)
			);
		}

		//Set Group for face materials.
		let numOfVertices = (fl - 2) * 3;
		for (let i = 0; i < numOfVertices / 3; i++) {
			geom.addGroup(faceFirstVertexIndex, 3, materialIndex);
			faceFirstVertexIndex += 3;
		}
	}

	geom.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3)
	);
	geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
	geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
	return geom;
}

function createShape(vertices2, faces2, radius) {
	let cv = new Array(vertices2.length),
		cf = new Array(faces2.length);
	for (let i = 0; i < vertices2.length; ++i) {
		let v = vertices2[i];
		cv[i] = new CANNON.Vec3(v.x * radius, v.y * radius, v.z * radius);
	}
	for (let i = 0; i < faces2.length; ++i) {
		cf[i] = faces2[i].slice(0, faces2[i].length - 1);
	}

	return new CANNON.ConvexPolyhedron({ vertices: cv, faces: cf });
}
let myShape = null;

function getMaterials2() {
	let materials = [];
	for (let i = 0; i < faceTexts2.length; ++i) {
		let texture = null;
		texture = createTextTexture2(faceTexts2[i]);

		materials.push(
			new THREE.MeshPhongMaterial(Object.assign({}, { map: texture }))
		);
	}
	return materials;
}

function createTextTexture2(text) {
	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	let ts = calculateTextureSize(1 / 2 + 1 * textMargin2) * 2;
	canvas.width = canvas.height = ts;
	context.font = ts / (1 + 2 * textMargin2) + "pt Arial";
	context.fillStyle = backColor2;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillStyle = color2;
	context.fillText(text, canvas.width / 2, canvas.height / 2);
	let texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	return texture;
}

function calculateTextureSize(approx) {
	return Math.max(
		128,
		Math.pow(2, Math.floor(Math.log(approx) / Math.log(2)))
	);
}
function getDodecaScore(scoresObject, body, ifRemove) {
	let vector = new THREE.Vector3(0, 1);
	let closest_face;
	let closest_angle = Math.PI * 2;

	let normals = body.geometry.getAttribute("normal").array;
	for (let i = 0; i < body.geometry.groups.length; ++i) {
		let face = body.geometry.groups[i];
		if (face.materialIndex === 0) continue;

		//Each group consists in 3 vertices of 3 elements (x, y, z) so the offset between faces in the Float32BufferAttribute is 9
		let startVertex = i * 9;
		let normal = new THREE.Vector3(
			normals[startVertex],
			normals[startVertex + 1],
			normals[startVertex + 2]
		);
		let angle = normal
			.clone()
			.applyQuaternion(body.quaternion)
			.angleTo(vector);
		if (angle < closest_angle) {
			closest_angle = angle;
			closest_face = face;
		}
	}
	let scoreToShow;
	if (closest_face.materialIndex - 1 == 0) {
		scoreToShow = 10;
	} else {
		scoreToShow = closest_face.materialIndex - 1;
	}
	if (!ifRemove) {
		scoresObject.lastRoll += scoreToShow + " + ";
		scoresObject.presentScore += scoreToShow;
	} else {
		return scoreToShow;
	}
}
