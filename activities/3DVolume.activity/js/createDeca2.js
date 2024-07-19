let vertices = [];
let faces = [
	[5, 7, 11, 0],
	[4, 2, 10, 1],
	[1, 3, 11, 2],
	[0, 8, 10, 3],
	[7, 9, 11, 4],
	[8, 6, 10, 5],
	[9, 1, 11, 6],
	[2, 0, 10, 7],
	[3, 5, 11, 8],
	[6, 4, 10, 9],
	[1, 0, 2, -1],
	[1, 2, 3, -1],
	[3, 2, 4, -1],
	[3, 4, 5, -1],
	[5, 4, 6, -1],
	[5, 6, 7, -1],
	[7, 6, 8, -1],
	[7, 8, 9, -1],
	[9, 8, 0, -1],
	[9, 0, 1, -1],
];

for (let i = 0, b = 0; i < 10; ++i, b += (Math.PI * 2) / 10) {
	vertices.push([Math.cos(b), Math.sin(b), 0.105 * (i % 2 ? 1 : -1)]);
}
vertices.push([0, 0, -1]);
vertices.push([0, 0, 1]);
let scaleFactor = 0.9;
value = 10;
let faceTexts = [
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
let textMargin = 1.0;
let chamfer = 0.945;
let af = (Math.PI * 6) / 5;
let tab = 0;
let backColor;
let color;
function createDecahedron(
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
	sharedAngVel2
) {
	let decahedron;
	let tempShowNumbers = ifNumbers == null ? ctx.showNumbers : ifNumbers;
	let tempTransparent =
		ifTransparent == null ? ctx.toggleTransparent : ifTransparent;
	let tempFillColor = sharedColor != null ? sharedColor : ctx.presentColor;
	let tempTextColor =
		sharedTextColor != null ? sharedTextColor : ctx.textColor;
	backColor = tempFillColor;
	color = tempTextColor;

	let diceMesh = new THREE.Mesh(getGeometry(), getMaterials());

	// if (tempShowNumbers) {
	// 	let m = new THREE.MeshLambertMaterial({
	// 		map: getNumbers(tempFillColor, tempTextColor),
	// 	});

	// 	decahedron = new THREE.Mesh(g, m);
	// 	decahedron.rotation.z = Math.PI / 2;
	// } else if (tempTransparent) {
	// 	const decahedronTransaprentGeometry = decaGeometry2;
	// 	const wireframe = new THREE.WireframeGeometry(
	// 		decahedronTransaprentGeometry
	// 	);
	// 	const lineMaterial = new THREE.LineBasicMaterial({
	// 		color: sharedColor != null ? sharedColor : ctx.presentColor,
	// 		depthTest: true,
	// 		opacity: 1,
	// 		transparent: false,
	// 	});
	// 	const line = new THREE.LineSegments(wireframe, lineMaterial);
	// 	decahedron = line;
	// } else if (false) {
	// 	const decaGeo = decaGeometry;

	// 	const texture = new THREE.TextureLoader().load(
	// 		sharedImageData != null ? sharedImageData : imageData
	// 	);

	// 	// Create material using the texture
	// 	const material = new THREE.MeshPhongMaterial({ map: texture });

	// 	// Create cube mesh with the material
	// 	decahedron = new THREE.Mesh(decaGeo, material);
	// } else {
	// 	const decahedronGeometry = decaGeometry2;

	// 	const decaMaterial = new THREE.MeshStandardMaterial({
	// 		color: sharedColor != null ? sharedColor : ctx.presentColor,
	// 		wireframe: false,
	// 	});

	// 	decahedron = new THREE.Mesh(decahedronGeometry, decaMaterial);
	// }

	// decahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
	// decahedron.castShadow = true;
	decahedron = diceMesh
	scene.add(decahedron);

	// Create a ConvexPolyhedron shape from the scaled vertices and faces
	// const decahedronShape = new CANNON.ConvexPolyhedron({
	// 	vertices: verticesCannon,
	// 	faces: facesCannon,
	// });
	// let myShape = getPolyhedronShape(decahedron);
	// console.log(myShape);
	console.log(diceMesh.geometry.cannon_shape)

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 10 : yCoordinateShared;

	let decahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: diceMesh.geometry.cannon_shape,
		position: new CANNON.Vec3(x, y, z),
		friction: -1,
		restitution: 5,
	});
	// decahedronBody = polyhedronShape
	// if (tempShowNumbers) {
	// 	decahedronBody.addEventListener("sleep", () => {
	// 		sleepCounter++;
	// 		getDecaScore(decahedron);
	// 	});
	// }
	world.addBody(decahedronBody);

	let angVel1 = 0.2;
	// sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 = 0.2;
	// sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;

	decahedronBody.angularVelocity.set(angVel1, angVel2, 0.5);
	decahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	decahedron.position.copy(decahedronBody.position); // this merges the physics body to threejs mesh
	decahedron.quaternion.copy(decahedronBody.quaternion);
	// console.log(decahedronBody);
	// console.log(decahedronBody.rotation);

	if (quaternionShared != null && quaternionShared != undefined) {
		decahedron.quaternion.copy(quaternionShared);
		decahedronBody.quaternion.copy(quaternionShared);
	}

	diceArray.push([
		decahedron,
		decahedronBody,
		"deca",
		tempShowNumbers,
		tempTransparent,
		tempFillColor,
		tempTextColor,
		angVel1,
		angVel2,
	]);
}

function getGeometry() {
	let radius = 1 * scaleFactor;

	let vectors = new Array(vertices.length);
	for (let i = 0; i < vertices.length; ++i) {
		vectors[i] = new THREE.Vector3().fromArray(vertices[i]).normalize();
	}

	let chamferGeometry = getChamferGeometry(vectors);
	let geometry = makeGeometry(
		chamferGeometry.vectors,
		chamferGeometry.faces,
		radius,
		tab,
		af
	);
	geometry.cannon_shape = createShape(vectors, faces, radius);

	return geometry;
}

function getChamferGeometry(vectors) {
	let chamfer_vectors = [],
		chamfer_faces = [],
		corner_faces = new Array(vectors.length);
	for (let i = 0; i < vectors.length; ++i) corner_faces[i] = [];
	for (let i = 0; i < faces.length; ++i) {
		let ii = faces[i],
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
				.multiplyScalar(chamfer)
				.addVectors(vv, center_point);
		}
		face.push(ii[fl]);
		chamfer_faces.push(face);
	}
	for (let i = 0; i < faces.length - 1; ++i) {
		for (let j = i + 1; j < faces.length; ++j) {
			let pairs = [],
				lastm = -1;
			for (let m = 0; m < faces[i].length - 1; ++m) {
				let n = faces[j].indexOf(faces[i][m]);
				if (n >= 0 && n < faces[j].length - 1) {
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
			for (let m = faces.length; m < chamfer_faces.length; ++m) {
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
	return { vectors: chamfer_vectors, faces: chamfer_faces };
}

function makeGeometry(vertices, faces, radius) {
	let geom = new THREE.BufferGeometry();

	for (let i = 0; i < vertices.length; ++i) {
		vertices[i] = vertices[i].multiplyScalar(radius);
	}

	let positions = [];
	const normals = [];
	const uvs = [];

	const cb = new THREE.Vector3();
	const ab = new THREE.Vector3();
	let materialIndex;
	let faceFirstVertexIndex = 0;

	for (let i = 0; i < faces.length; ++i) {
		let ii = faces[i],
			fl = ii.length - 1;
		let aa = (Math.PI * 2) / fl;
		materialIndex = ii[fl] + 1;
		for (let j = 0; j < fl - 2; ++j) {
			//Vertices
			positions.push(...vertices[ii[0]].toArray());
			positions.push(...vertices[ii[j + 1]].toArray());
			positions.push(...vertices[ii[j + 2]].toArray());

			// Flat face normals
			cb.subVectors(vertices[ii[j + 2]], vertices[ii[j + 1]]);
			ab.subVectors(vertices[ii[0]], vertices[ii[j + 1]]);
			cb.cross(ab);
			cb.normalize();

			// Vertex Normals
			normals.push(...cb.toArray());
			normals.push(...cb.toArray());
			normals.push(...cb.toArray());

			//UVs
			uvs.push(
				(Math.cos(af) + 1 + tab) / 2 / (1 + tab),
				(Math.sin(af) + 1 + tab) / 2 / (1 + tab)
			);
			uvs.push(
				(Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
				(Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)
			);
			uvs.push(
				(Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
				(Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab)
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

function createShape(vertices, faces, radius) {
	let cv = new Array(vertices.length),
		cf = new Array(faces.length);
	for (let i = 0; i < vertices.length; ++i) {
		let v = vertices[i];
		cv[i] = new CANNON.Vec3(v.x * radius, v.y * radius, v.z * radius);
	}
	for (let i = 0; i < faces.length; ++i) {
		cf[i] = faces[i].slice(0, faces[i].length - 1);
	}
	return new CANNON.ConvexPolyhedron(cv, cf);
}

function getMaterials() {
	let materials = [];
	for (let i = 0; i < faceTexts.length; ++i) {
		let texture = null;
		// if (customTextTextureFunction) {
		// 	texture = customTextTextureFunction(
		// 		faceTexts[i],
		// 		labelColor,
		// 		diceColor
		// 	);
		// } else {
		texture = createTextTexture(faceTexts[i]);

		materials.push(
			new THREE.MeshPhongMaterial(
				Object.assign({}, { map: texture })
			)
		);
	}
	return materials;
}

function createTextTexture(text) {
	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	let ts = calculateTextureSize(1 / 2 + 1 * textMargin) * 2;
	canvas.width = canvas.height = ts;
	context.font = ts / (1 + 2 * textMargin) + "pt Arial";
	context.fillStyle = backColor;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillStyle = color;
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
