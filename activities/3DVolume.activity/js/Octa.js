function createOctahedron(
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
	let octahedron;
	let tempShowNumbers = ifNumbers == null ? ctx.showNumbers : ifNumbers;
	let tempTransparent =
		ifTransparent == null ? ctx.toggleTransparent : ifTransparent;
	// let tempImage = ifImage == null ? showImage : ifImage;
	let tempFillColor = sharedColor != null ? sharedColor : ctx.presentColor;
	let tempTextColor =
		sharedTextColor != null ? sharedTextColor : ctx.textColor;

	if (tempShowNumbers) {
		let tileDimension = new THREE.Vector2(4, 5);
		let tileSize = 512;
		let g = new THREE.OctahedronGeometry(1.6);

		let c = document.createElement("canvas");
		c.width = tileSize * tileDimension.x;
		c.height = tileSize * tileDimension.y;
		let ctx = c.getContext("2d");
		ctx.fillStyle = tempFillColor;
		ctx.fillRect(0, 0, c.width, c.height);

		let uvs = [];

		let baseUVs = [
			[0.067, 0.25],
			[0.933, 0.25],
			[0.5, 1],
		].map((p) => {
			return new THREE.Vector2(...p);
		});

		for (let i = 0; i < 9; i++) {
			let u = i % tileDimension.x;
			let v = Math.floor(i / tileDimension.x);
			uvs.push(
				(baseUVs[0].x + u) / tileDimension.x,
				(baseUVs[0].y + v) / tileDimension.y,
				(baseUVs[1].x + u) / tileDimension.x,
				(baseUVs[1].y + v) / tileDimension.y,
				(baseUVs[2].x + u) / tileDimension.x,
				(baseUVs[2].y + v) / tileDimension.y
			);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = `bold 200px Arial`;
			ctx.fillStyle = tempTextColor;
			ctx.fillText(
				i + 1 + (i == 5 || i == 8 ? "" : ""),
				(u + 0.5) * tileSize,
				c.height - (v + 0.5) * tileSize
			);
		}
		g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

		let tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;

		let m = new THREE.MeshPhongMaterial({
			map: tex,
		});

		octahedron = new THREE.Mesh(g, m);
	} else if (tempTransparent) {
		const octahedronTransparentGeometry = new THREE.OctahedronGeometry(1.6); // Size of the octahedron
		const wireframe = new THREE.WireframeGeometry(
			octahedronTransparentGeometry
		);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			depthTest: true,
			opacity: 1,
			transparent: false,
		});
		const line = new THREE.LineSegments(wireframe, lineMaterial);
		octahedron = line;
	} else {
		const octahedronGeometry = new THREE.OctahedronGeometry(1.6); // Size of the octahedron

		const octaMaterial = new THREE.MeshPhongMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});
		octahedron = new THREE.Mesh(octahedronGeometry, octaMaterial);
	}
	octahedron.castShadow = true;
	octahedron.userData = uniqueId;
	scene.add(octahedron);

	const scaleFactor = 0.8; // Change this value to scale the shape

	const verticesOcta = [
		new CANNON.Vec3(2 * scaleFactor, 0, 0), // Vertex 1 (right)
		new CANNON.Vec3(-2 * scaleFactor, 0, 0), // Vertex 2 (left)
		new CANNON.Vec3(0, 2 * scaleFactor, 0), // Vertex 3 (top)
		new CANNON.Vec3(0, -2 * scaleFactor, 0), // Vertex 4 (bottom)
		new CANNON.Vec3(0, 0, 2 * scaleFactor), // Vertex 5 (front)
		new CANNON.Vec3(0, 0, -2 * scaleFactor), // Vertex 6 (back)
	];

	// Define the faces of the octahedron (counter-clockwise order)
	const facesOcta = [
		[0, 2, 4], // Triangle 1 (right, top, front)
		[0, 4, 3], // Triangle 2 (right, front, bottom)
		[0, 3, 5], // Triangle 3 (right, bottom, back)
		[0, 5, 2], // Triangle 4 (right, back, top)
		[1, 2, 5], // Triangle 5 (left, top, back)
		[1, 5, 3], // Triangle 6 (left, back, bottom)
		[1, 3, 4], // Triangle 7 (left, bottom, front)
		[1, 4, 2], // Triangle 8 (left, front, top)
	];

	const octahedronShape = new CANNON.ConvexPolyhedron({
		vertices: verticesOcta,
		faces: facesOcta,
	});

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 10 : 1;

	const octahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: octahedronShape,
		position: new CANNON.Vec3(x, y, z),
		material: new CANNON.Material(),
		restitution: 0.3,
	});

	world.addBody(octahedronBody);

	if (xCoordinateShared != null) {
		octahedronBody.sleep()
	}

	const contactMat = new CANNON.ContactMaterial(
		groundPhysMat,
		octahedronBody.material,
		{ friction: ctx.friction }
	);

	world.addContactMaterial(contactMat);
	

	let angVel1 =
		sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 =
		sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;
	let angVel3 =
		sharedAngVel3 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel3;

	octahedronBody.angularVelocity.set(angVel1, angVel2, angVel3);
	octahedronBody.angularDamping = 0.1; // This will help in reducing rotation over time

	octahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	octahedron.position.copy(octahedronBody.position); // this merges the physics body to threejs mesh
	octahedron.quaternion.copy(octahedronBody.quaternion);
	if (quaternionShared != null && quaternionShared != undefined) {
		octahedron.quaternion.copy(quaternionShared);
		octahedronBody.quaternion.copy(quaternionShared);
	}
	diceArray.push([
		octahedron,
		octahedronBody,
		"octa",
		tempShowNumbers,
		tempTransparent,
		tempFillColor,
		tempTextColor,
		angVel1,
		angVel2,
		angVel3,
		contactMat
	]);
}

function getOctaScore(scoresObject, body, ifRemove) {
	const faceVectors = [
		{
			vector: new THREE.Vector3(1, 0, 0), // Along the positive x-axis
			face: 4,
		},
		{
			vector: new THREE.Vector3(-1, 0, 0), // Along the negative x-axis
			face: 6,
		},
		{
			vector: new THREE.Vector3(0, 1, 0), // Along the positive y-axis
			face: 5,
		},
		{
			vector: new THREE.Vector3(0, -1, 0), // Along the negative y-axis
			face: 3,
		},
		{
			vector: new THREE.Vector3(1, 1, 1).normalize(), // Towards a corner (positive x, y, z)
			face: 1,
		},
		{
			vector: new THREE.Vector3(-1, 1, 1).normalize(), // Towards a corner (negative x, positive y, z)
			face: 8,
		},
		{
			vector: new THREE.Vector3(1, -1, 1).normalize(), // Towards a corner (positive x, negative y, z)
			face: 2,
		},
		{
			vector: new THREE.Vector3(-1, -1, 1).normalize(), // Towards a corner (negative x, negative y, z)
			face: 7,
		},
	];

	let minValue = 1000000;
	let minInd;
	for (let i = 0; i < faceVectors.length; i++) {
		let faceVector = faceVectors[i];
		faceVector.vector.applyEuler(body.rotation);
		if (minValue > Math.abs(1 - faceVector.vector.y)) {
			minValue = Math.abs(1 - faceVector.vector.y);
			minInd = i;
		}
	}
	if (!ifRemove) {
		scoresObject.lastRoll += faceVectors[minInd].face + " + ";
		scoresObject.presentScore += faceVectors[minInd].face;
	}
	return faceVectors[minInd].face;

	// let vector = new THREE.Vector3(0, 1);
	// let closest_face;
	// let closest_angle = Math.PI * 2;

	// let normals = body.geometry.getAttribute("normal").array;
	// for (let i = 0; i < 8; ++i) {
	// 	let face = i + 1;

	// 	//Each group consists in 3 vertices of 3 elements (x, y, z) so the offset between faces in the Float32BufferAttribute is 9
	// 	let startVertex = i * 9;
	// 	let normal = new THREE.Vector3(
	// 		normals[startVertex],
	// 		normals[startVertex + 1],
	// 		normals[startVertex + 2]
	// 	);
	// 	let angle = normal
	// 		.clone()
	// 		.applyQuaternion(body.quaternion)
	// 		.angleTo(vector);
	// 	if (angle < closest_angle) {
	// 		closest_angle = angle;
	// 		closest_face = face;
	// 	}
	// }
	// scoresObject.lastRoll += closest_face + " + ";
	// scoresObject.presentScore += closest_face;
	// updateElements();

	// return closest_face;
}
