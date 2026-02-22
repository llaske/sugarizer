function createTetrahedron(
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
	let tetrahedron;
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
		let g = new THREE.TetrahedronGeometry(1.7);

		let c = document.createElement("canvas");
		let div = document.createElement("div");
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
		let arrOfNums = [
			[2, 1, 3],
			[1, 2, 4],
			[3, 1, 4],
			[2, 3, 4],
		];
		for (let i = 0; i < 4; i++) {
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
			ctx.font = `bold 150px Arial`;
			ctx.fillStyle = tempTextColor;
			// ctx.fillText(
			//   i + 1,
			//   (u + 0.5) * tileSize,
			//   c.height - (v + 0.5) * tileSize
			// );
			let aStep = (Math.PI * 2) / 3;
			let yAlign = Math.PI * 0.5;
			let tileQuarter = tileSize * 0.25;
			for (let j = 0; j < 3; j++) {
				ctx.save();
				ctx.translate(
					(u + 0.5) * tileSize +
						Math.cos(j * aStep - yAlign) * tileQuarter,
					c.height -
						(v + 0.5) * tileSize +
						Math.sin(j * aStep - yAlign) * tileQuarter
				);
				ctx.rotate((j * Math.PI * 2) / 3);
				ctx.fillText(arrOfNums[i][j], 0, 0);
				ctx.restore();
			}
		}
		g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

		let tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;

		let m = new THREE.MeshPhongMaterial({
			map: tex,
		});

		tetrahedron = new THREE.Mesh(g, m);
	} else if (tempTransparent) {
		const tetrahedronTransparentGeometry = new THREE.TetrahedronGeometry(
			1.7
		); // Size of the tetrahedron
		const wireframe = new THREE.WireframeGeometry(
			tetrahedronTransparentGeometry
		);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			depthTest: true,
			opacity: 1,
			transparent: false,
		});
		const line = new THREE.LineSegments(wireframe, lineMaterial);
		tetrahedron = line;
	} else {
		const tetrahedronGeometry = new THREE.TetrahedronGeometry(1.7); // Size of the tetrahedron

		const tetraMaterial = new THREE.MeshStandardMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});

		tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetraMaterial);
	}

	tetrahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0);
	tetrahedron.castShadow = true;
	tetrahedron.userData = uniqueId;
	scene.add(tetrahedron);

	const verticesTetra = [
		new CANNON.Vec3(1, 1, 1), // Vertex 1 (right)
		new CANNON.Vec3(-1, -1, 1), // Vertex 2 (top)
		new CANNON.Vec3(-1, 1, -1), // Vertex 3 (left)
		new CANNON.Vec3(1, -1, -1), // Vertex 4 (front)
	];
	const facesTetra = [
		[2, 1, 0],
		[0, 3, 2],
		[1, 3, 0],
		[2, 3, 1],
	];
	// Create a ConvexPolyhedron shape from the vertices and faces
	const tetrahedronShape = new CANNON.ConvexPolyhedron({
		vertices: verticesTetra,
		faces: facesTetra,
	});

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 4 : yCoordinateShared;

	const tetrahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: tetrahedronShape,
		position: new CANNON.Vec3(x, y, z),
		material: new CANNON.Material(),
		restitution: 5,
	});
	world.addBody(tetrahedronBody);
	
	let angVel1 =
		sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 =
		sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;
	let angVel3 =
		sharedAngVel3 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel3;

	const contactMat = new CANNON.ContactMaterial(
		groundPhysMat,
		tetrahedronBody.material,
		{ friction: ctx.friction }
	);

	world.addContactMaterial(contactMat);

	tetrahedronBody.angularVelocity.set(angVel1, angVel2, angVel3);
	tetrahedronBody.angularDamping = 0.1; // This will help in reducing rotation over time

	tetrahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	tetrahedron.position.copy(tetrahedronBody.position); // this merges the physics body to threejs mesh
	tetrahedron.quaternion.copy(tetrahedronBody.quaternion);
	if (quaternionShared != null && quaternionShared != undefined) {
		tetrahedron.quaternion.copy(quaternionShared);
		tetrahedronBody.quaternion.copy(quaternionShared);
	}
	diceArray.push([
		tetrahedron,
		tetrahedronBody,
		"tetra",
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

function getTetraScore(scoresObject, body, ifRemove) {
	const faceVectors = [
		{
			vector: new THREE.Vector3(1, 1, 1).normalize(), // Towards a corner (positive x, y, z)
			face: 1,
		},
		{
			vector: new THREE.Vector3(-1, -1, 1).normalize(), // Towards a corner (negative x, negative y, z)
			face: 3,
		},
		{
			vector: new THREE.Vector3(-1, 1, -1).normalize(), // Towards a corner (negative x, positive y, negative z)
			face: 2,
		},
		{
			vector: new THREE.Vector3(1, -1, -1).normalize(), // Towards a corner (positive x, negative y, negative z)
			face: 4,
		},
	];

	for (const faceVector of faceVectors) {
		faceVector.vector.applyEuler(body.rotation);
		if (Math.round(faceVector.vector.y) == 1) {
			if (!ifRemove) {
				scoresObject.lastRoll += faceVector.face + " + ";
				scoresObject.presentScore += faceVector.face;
				break;
			}
			return faceVector.face;
		}
	}
}
