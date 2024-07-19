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
	sharedAngVel3
) {
	let dodecahedron;
	let tempShowNumbers = ifNumbers == null ? ctx.showNumbers : ifNumbers;
	let tempTransparent =
		ifTransparent == null ? ctx.toggleTransparent : ifTransparent;
	// let tempImage = ifImage == null ? showImage : ifImage;
	let tempFillColor = sharedColor != null ? sharedColor : ctx.presentColor;
	let tempTextColor =
		sharedTextColor != null ? sharedTextColor : ctx.textColor;
	if (tempShowNumbers) {
		let tileDimension = new THREE.Vector2(4, 3); // 12 faces, arranged in a 4x3 grid
		let tileSize = 512;
		let g = new THREE.DodecahedronGeometry(1.25);

		let c = document.createElement("canvas");
		c.width = tileSize * tileDimension.x;
		c.height = tileSize * tileDimension.y;
		let ctx = c.getContext("2d");
		ctx.fillStyle = tempFillColor;
		ctx.fillRect(0, 0, c.width, c.height);

		let uvs = [];
		const base = new THREE.Vector2(0, 0.5);
		const center = new THREE.Vector2();
		const angle = THREE.MathUtils.degToRad(72);
		let baseUVs = [
			base
				.clone()
				.rotateAround(center, angle * 1)
				.addScalar(0.5),
			base
				.clone()
				.rotateAround(center, angle * 2)
				.addScalar(0.5),
			base
				.clone()
				.rotateAround(center, angle * 3)
				.addScalar(0.5),
			base
				.clone()
				.rotateAround(center, angle * 4)
				.addScalar(0.5),
			base
				.clone()
				.rotateAround(center, angle * 0)
				.addScalar(0.5),
		];

		for (let i = 0; i < 12; i++) {
			// 12 faces for a dodecahedron
			let u = i % tileDimension.x;
			let v = Math.floor(i / tileDimension.x);
			uvs.push(
				(baseUVs[1].x + u) / tileDimension.x,
				(baseUVs[1].y + v) / tileDimension.y,
				(baseUVs[2].x + u) / tileDimension.x,
				(baseUVs[2].y + v) / tileDimension.y,
				(baseUVs[0].x + u) / tileDimension.x,
				(baseUVs[0].y + v) / tileDimension.y,

				(baseUVs[2].x + u) / tileDimension.x,
				(baseUVs[2].y + v) / tileDimension.y,
				(baseUVs[3].x + u) / tileDimension.x,
				(baseUVs[3].y + v) / tileDimension.y,
				(baseUVs[0].x + u) / tileDimension.x,
				(baseUVs[0].y + v) / tileDimension.y,

				(baseUVs[3].x + u) / tileDimension.x,
				(baseUVs[3].y + v) / tileDimension.y,
				(baseUVs[4].x + u) / tileDimension.x,
				(baseUVs[4].y + v) / tileDimension.y,
				(baseUVs[0].x + u) / tileDimension.x,
				(baseUVs[0].y + v) / tileDimension.y
			);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = `bold ${tileSize / 3}px Arial`;
			ctx.fillStyle = tempTextColor;
			ctx.fillText(
				i + 1 + (i == 5 ? "." : ""),
				(u + 0.5) * tileSize,
				c.height - (v + 0.5) * tileSize
			);
		}

		g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

		let tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 16;

		let m = new THREE.MeshPhongMaterial({
			map: tex,
		});

		dodecahedron = new THREE.Mesh(g, m);
	} else if (tempTransparent) {
		const dodedodecahedronTransaprentGeometry =
			new THREE.DodecahedronGeometry(1.25); // Size of the tetrahedron
		const wireframe = new THREE.WireframeGeometry(
			dodedodecahedronTransaprentGeometry
		);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			depthTest: true,
			opacity: 1,
			transparent: false,
		});
		const line = new THREE.LineSegments(wireframe, lineMaterial);
		dodecahedron = line;
	} else if (false) {
		const dodecaGeo = new THREE.DodecahedronGeometry(2);

		const texture = new THREE.TextureLoader().load(
			sharedImageData != null ? sharedImageData : imageData
		);

		// Create material using the texture
		const material = new THREE.MeshPhongMaterial({ map: texture });

		// Create cube mesh with the material
		dodecahedron = new THREE.Mesh(dodecaGeo, material);
	} else {
		const dodecahedronGeometry = new THREE.DodecahedronGeometry(1.25); // Size of the tetrahedron

		const dodecaMaterial = new THREE.MeshStandardMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});

		dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecaMaterial);
	}

	dodecahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
	dodecahedron.castShadow = true;
	scene.add(dodecahedron);

	const t = 1.618;
	const r = 0.618;
	const scaleFactor = 0.75;

	const vertices = [
		new CANNON.Vec3(-1, -1, -1).scale(scaleFactor),
		new CANNON.Vec3(-1, -1, 1).scale(scaleFactor),
		new CANNON.Vec3(-1, 1, -1).scale(scaleFactor),
		new CANNON.Vec3(-1, 1, 1).scale(scaleFactor),
		new CANNON.Vec3(1, -1, -1).scale(scaleFactor),
		new CANNON.Vec3(1, -1, 1).scale(scaleFactor),
		new CANNON.Vec3(1, 1, -1).scale(scaleFactor),
		new CANNON.Vec3(1, 1, 1).scale(scaleFactor),
		new CANNON.Vec3(0, -r, -t).scale(scaleFactor),
		new CANNON.Vec3(0, -r, t).scale(scaleFactor),
		new CANNON.Vec3(0, r, -t).scale(scaleFactor),
		new CANNON.Vec3(0, r, t).scale(scaleFactor),
		new CANNON.Vec3(-r, -t, 0).scale(scaleFactor),
		new CANNON.Vec3(-r, t, 0).scale(scaleFactor),
		new CANNON.Vec3(r, -t, 0).scale(scaleFactor),
		new CANNON.Vec3(r, t, 0).scale(scaleFactor),
		new CANNON.Vec3(-t, 0, -r).scale(scaleFactor),
		new CANNON.Vec3(t, 0, -r).scale(scaleFactor),
		new CANNON.Vec3(-t, 0, r).scale(scaleFactor),
		new CANNON.Vec3(t, 0, r).scale(scaleFactor),
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

	// Create a ConvexPolyhedron shape from the vertices and faces
	const dodecahedronShape = new CANNON.ConvexPolyhedron({
		vertices: vertices,
		faces: indices,
	});
	console.log(dodecahedronShape)

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 10 : yCoordinateShared;

	const dodecahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: dodecahedronShape,
		position: new CANNON.Vec3(x, y, z),
		friction: -1,
		restitution: 5,
	});
	dodecahedronBody.sleepSpeedLimit = 0.2;
	dodecahedronBody.sleepTimeLimit = 3;
	// if (tempShowNumbers) {
	// 	dodecahedronBody.addEventListener("sleep", () => {
	// 		sleepCounter++;
	// 		getDodecaScore(dodecahedron);
	// 	});
	// }
	world.addBody(dodecahedronBody);

	let angVel1 =
		sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 =
		sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;
		let angVel3 =
		sharedAngVel3 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel3;

	dodecahedronBody.angularVelocity.set(angVel1, angVel2, angVel3);
	dodecahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	dodecahedron.position.copy(dodecahedronBody.position); // this merges the physics body to threejs mesh
	dodecahedron.quaternion.copy(dodecahedronBody.quaternion);
	if (quaternionShared != null && quaternionShared != undefined) {
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
		angVel3
	]);
}
