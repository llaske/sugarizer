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
	sharedAngVel2
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
	} else if (false) {
		const octahedronGeometry = new THREE.OctahedronGeometry(2);

		const texture = new THREE.TextureLoader().load(
			sharedImageData != null ? sharedImageData : imageData
		);

		// Create material using the texture
		const material = new THREE.MeshPhongMaterial({ map: texture });

		// Create cube mesh with the material
		octahedron = new THREE.Mesh(octahedronGeometry, material);
	} else {
		const octahedronGeometry = new THREE.OctahedronGeometry(1.6); // Size of the octahedron

		const octaMaterial = new THREE.MeshPhongMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});
		octahedron = new THREE.Mesh(octahedronGeometry, octaMaterial);
	}
	octahedron.castShadow = true;
	scene.add(octahedron);

	const scaleFactor = 0.8; // Change this value to scale the shape (e.g., 2 for doubling the size)

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
	let y = yCoordinateShared == null ? 10 : yCoordinateShared;

	const octahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: octahedronShape,
		position: new CANNON.Vec3(x, y, z),
		friction: -1,
		restitution: 5,
	});

	let previousSleepState = 1;

	// const octahedronBody = new Proxy(octahedronBody, {
	// 	set(target, property, value) {
	// 		if (
	// 			property === "sleepState" &&
	// 			previousSleepState === 2 &&
	// 			value === 1
	// 		) {
	// 			onSleepStateChangeToOne(octahedron);
	// 		}
	// 		target[property] = value;
	// 		return true;
	// 	},
	// });

	world.addBody(octahedronBody);

	// if (tempShowNumbers) {
	// 	octahedronBody.addEventListener("sleep", () => {
	// 		previousSleepState = 2;
	// 		console.log(octahedronBody.sleepState);
	// 		sleepCounter++;
	// 		getOctaScore(octahedron);
	// 	});
	// }

	let angVel1 = sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
    let angVel2 = sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;

	octahedronBody.angularVelocity.set(angVel1, angVel2, 0.5);
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
		angVel2
	]);
}
