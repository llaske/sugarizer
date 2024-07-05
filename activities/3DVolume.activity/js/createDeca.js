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
	groundPhysMat
) {
	let decahedron;
	let tempShowNumbers = ifNumbers == null ? ctx.showNumbers : ifNumbers;
	let tempTransparent =
		ifTransparent == null ? ctx.toggleTransparent : ifTransparent;
	// let tempImage = ifImage == null ? showImage : ifImage;
	let tempFillColor = sharedColor != null ? sharedColor : ctx.presentColor;
	let tempTextColor =
		sharedTextColor != null ? sharedTextColor : ctx.textColor;

	const sides = 10;
	const radius = 1.3;
	const verticesGeo = [
		[0, 0, 1],
		[0, 0, -1],
	].flat();

	for (let i = 0; i < sides; ++i) {
		const b = (i * Math.PI * 2) / sides;
		verticesGeo.push(-Math.cos(b), -Math.sin(b), 0.105 * (i % 2 ? 1 : -1));
	}

	const facesGeo = [
		[0, 2, 3],
		[0, 3, 4],
		[0, 4, 5],
		[0, 5, 6],
		[0, 6, 7],
		[0, 7, 8],
		[0, 8, 9],
		[0, 9, 10],
		[0, 10, 11],
		[0, 11, 2],
		[1, 3, 2],
		[1, 4, 3],
		[1, 5, 4],
		[1, 6, 5],
		[1, 7, 6],
		[1, 8, 7],
		[1, 9, 8],
		[1, 10, 9],
		[1, 11, 10],
		[1, 2, 11],
	].flat();
	const args = [verticesGeo, facesGeo, radius, 0];
	let decaGeometry = new THREE.PolyhedronGeometry(...args);

	if (tempShowNumbers) {
		let g = decaGeometry;

		let tileDimension = new THREE.Vector2(4, 5);
		let tileSize = 512;

		let c = document.createElement("canvas");
		c.width = tileSize * tileDimension.x;
		c.height = tileSize * tileDimension.y;
		let ctx = c.getContext("2d");
		ctx.fillStyle = tempFillColor;
		ctx.fillRect(0, 0, c.width, c.height);

		let uvs = [];

		let baseUVs = [
			new THREE.Vector2(0.67, 1), // br
			new THREE.Vector2(0, 0.5), // bt
			new THREE.Vector2(1, 0.5), // tl
			new THREE.Vector2(0.67, 0), // bl
		];

		for (let i = 0; i < 10; i++) {
			let u = i % tileDimension.x;
			let v = Math.floor(i / tileDimension.x);
			uvs.push(
				(baseUVs[0].x + u) / tileDimension.x,
				(baseUVs[0].y + v) / tileDimension.y,
				(baseUVs[1].x + u) / tileDimension.x,
				(baseUVs[1].y + v) / tileDimension.y,
				(baseUVs[2].x + u) / tileDimension.x,
				(baseUVs[2].y + v) / tileDimension.y,
				(baseUVs[3].x + u) / tileDimension.x,
				(baseUVs[3].y + v) / tileDimension.y
			);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = `bold 175px Arial`;
			ctx.fillStyle = tempTextColor;
			let text = i + 1;
			if (i === 5) {
				text += ".";
			}
			ctx.fillText(
				text,
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
		decahedron = new THREE.Mesh(g, m);
	} else if (tempTransparent) {
		const decahedronTransaprentGeometry = decaGeometry;
		const wireframe = new THREE.WireframeGeometry(
			decahedronTransaprentGeometry
		);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			depthTest: true,
			opacity: 1,
			transparent: false,
		});
		const line = new THREE.LineSegments(wireframe, lineMaterial);
		decahedron = line;
	} else if (false) {
		const decaGeo = decaGeometry;

		const texture = new THREE.TextureLoader().load(
			sharedImageData != null ? sharedImageData : imageData
		);

		// Create material using the texture
		const material = new THREE.MeshPhongMaterial({ map: texture });

		// Create cube mesh with the material
		decahedron = new THREE.Mesh(decaGeo, material);
	} else {
		const decahedronGeometry = decaGeometry;

		const decaMaterial = new THREE.MeshStandardMaterial({
			color: sharedColor != null ? sharedColor : ctx.presentColor,
			wireframe: false,
		});

		decahedron = new THREE.Mesh(decahedronGeometry, decaMaterial);
	}

	decahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
	decahedron.castShadow = true;
	scene.add(decahedron);

	const t = (1 + Math.sqrt(5)) / 2;
	const r = 1 / t;
	const scaleFactor = 1.2; // Change this value to scale the shape (e.g., 2 for doubling the size)

	const verticesCannon = [];
	for (let i = 0; i < verticesGeo.length; i += 3) {
		verticesCannon.push(
			new CANNON.Vec3(
				verticesGeo[i] * scaleFactor,
				verticesGeo[i + 1] * scaleFactor,
				verticesGeo[i + 2] * scaleFactor
			)
		);
	}

	const facesCannon = [];
	for (let i = 0; i < facesGeo.length; i += 3) {
		facesCannon.push([facesGeo[i], facesGeo[i + 1], facesGeo[i + 2]]);
	}

	// Create a ConvexPolyhedron shape from the scaled vertices and faces
	const decahedronShape = new CANNON.ConvexPolyhedron({
		vertices: verticesCannon,
		faces: facesCannon,
	});

	let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
	let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
	let y = yCoordinateShared == null ? 10 : yCoordinateShared;

	const decahedronBody = new CANNON.Body({
		mass: 2, // Set mass
		shape: decahedronShape,
		position: new CANNON.Vec3(x, y, z),
		friction: -1,
		restitution: 5,
	});
	// if (tempShowNumbers) {
	// 	decahedronBody.addEventListener("sleep", () => {
	// 		sleepCounter++;
	// 		getDecaScore(decahedron);
	// 	});
	// }
	world.addBody(decahedronBody);
	decahedronBody.angularVelocity.set(0.5, 0.5, 0.5);
	decahedronBody.applyImpulse(ctx.offset, ctx.rollingForce);
	decahedron.position.copy(decahedronBody.position); // this merges the physics body to threejs mesh
	decahedron.quaternion.copy(decahedronBody.quaternion);

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
	]);
}
