function createIcosahedron(
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
	let icosahedron;
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
		let g = new THREE.IcosahedronGeometry(1.5);

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
		for (let i = 0; i < 20; i++) {
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
			ctx.font = `bold 175px Arial`;
			ctx.fillStyle = tempTextColor;
			let text = i + 1;
			if (i == 5) {
				text + ".";
			}
			ctx.fillText(
				i + 1,
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

		icosahedron = new THREE.Mesh(g, m);
	} else if (tempTransparent) {
		const icosahedronTransparentGeometry = new THREE.IcosahedronGeometry(
			1.5
		); // Size of the Icosahedron
		const wireframe = new THREE.WireframeGeometry(
			icosahedronTransparentGeometry
		);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			depthTest: true,
			opacity: 1,
			transparent: false,
		});
		const line = new THREE.LineSegments(wireframe, lineMaterial);
		icosahedron = line;
	} else {
		const icosahedronGeometry = new THREE.IcosahedronGeometry(1.5); // Size of the icosahedron

		const icosaMaterial = new THREE.MeshStandardMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});

		icosahedron = new THREE.Mesh(icosahedronGeometry, icosaMaterial);
	}
	icosahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
	icosahedron.castShadow = true;
	icosahedron.userData = uniqueId;
	scene.add(icosahedron);

	// Vertices
	// Vertices
	const t = (1 + Math.sqrt(5)) / 2;
	const scaleFactor = 0.8;
	const verticesIcosa = [
		new CANNON.Vec3(-1, t, 0).scale(scaleFactor),
		new CANNON.Vec3(1, t, 0).scale(scaleFactor),
		new CANNON.Vec3(-1, -t, 0).scale(scaleFactor),
		new CANNON.Vec3(1, -t, 0).scale(scaleFactor),
		new CANNON.Vec3(0, -1, t).scale(scaleFactor),
		new CANNON.Vec3(0, 1, t).scale(scaleFactor),
		new CANNON.Vec3(0, -1, -t).scale(scaleFactor),
		new CANNON.Vec3(0, 1, -t).scale(scaleFactor),
		new CANNON.Vec3(t, 0, -1).scale(scaleFactor),
		new CANNON.Vec3(t, 0, 1).scale(scaleFactor),
		new CANNON.Vec3(-t, 0, -1).scale(scaleFactor),
		new CANNON.Vec3(-t, 0, 1).scale(scaleFactor),
	];

	// Faces
	const facesIcosa = [
		[0, 11, 5],
		[0, 5, 1],
		[0, 1, 7],
		[0, 7, 10],
		[0, 10, 11],
		[1, 5, 9],
		[5, 11, 4],
		[11, 10, 2],
		[10, 7, 6],
		[7, 1, 8],
		[3, 9, 4],
		[3, 4, 2],
		[3, 2, 6],
		[3, 6, 8],
		[3, 8, 9],
		[4, 9, 5],
		[2, 4, 11],
		[6, 2, 10],
		[8, 6, 7],
		[9, 8, 1],
	];

	// Create a ConvexPolyhedron shape from the vertices and faces
	const icosahedronShape = new CANNON.ConvexPolyhedron({
		vertices: verticesIcosa,
		faces: facesIcosa,
	});

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 4 : 1;

	const icosahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: icosahedronShape,
		position: new CANNON.Vec3(x, y, z),
		material: new CANNON.Material(),
		restitution: 0.3,
	});
	icosahedronBody.sleepSpeedLimit = 0.5;
	icosahedronBody.sleepTimeLimit = 3;

	if (xCoordinateShared != null) {
		icosahedronBody.sleep()
	}

	const contactMat = new CANNON.ContactMaterial(
		groundPhysMat,
		icosahedronBody.material,
		{ friction: ctx.friction }
	);

	world.addContactMaterial(contactMat);

	// if (tempShowNumbers) {
	// 	icosahedronBody.addEventListener("sleep", () => {
	// 		console.log("icosa going to sleeep");
	// 		sleepCounter++;
	// 		getIcosaScore(icosahedron);
	// 	});
	// }
	world.addBody(icosahedronBody);
	let angVel1 =
		sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 =
		sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;
	let angVel3 =
		sharedAngVel3 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel3;

	icosahedronBody.angularVelocity.set(angVel1, angVel2, angVel3);
	icosahedronBody.angularDamping = 0.1; // This will help in reducing rotation over time

	icosahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	icosahedron.position.copy(icosahedronBody.position); // this merges the physics body to threejs mesh
	icosahedron.quaternion.copy(icosahedronBody.quaternion);

	if (quaternionShared != null && quaternionShared != undefined) {
		icosahedron.quaternion.copy(quaternionShared);
		icosahedronBody.quaternion.copy(quaternionShared);
	}

	diceArray.push([
		icosahedron,
		icosahedronBody,
		"icosa",
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

function getIcosaScore(scoresObject, body, ifRemove) {
	let vector = new THREE.Vector3(0, 1);
	let closest_face;
	let closest_angle = Math.PI * 2;

	let normals = body.geometry.getAttribute("normal").array;
	for (let i = 0; i < 20; ++i) {
		let face = i + 1;

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
	if (!ifRemove) {
		scoresObject.lastRoll += closest_face + " + ";
		scoresObject.presentScore += closest_face;
	}

	return closest_face;
}
