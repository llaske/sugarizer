const sides = 10;
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

	const radius = 1.3;
	const verticesGeo = [
		[0, 0, 1],
		[0, 0, -1],
	].flat();

	const sides = 10;
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
    const decaGeometry = new THREE.PolyhedronGeometry(verticesGeo, facesGeo, 1.3, 0);


	if (tempShowNumbers) {
		let vertStep = THREE.MathUtils.degToRad(36);
		let vertices = [
			[0, 0, 1],
			[Math.cos(vertStep * 0), Math.sin(vertStep * 0), 0.105],
			[Math.cos(vertStep * 1), Math.sin(vertStep * 1), -0.105],
			[Math.cos(vertStep * 2), Math.sin(vertStep * 2), 0.105],
		].map((p) => {
			return new THREE.Vector3(...p);
		});
		let h = vertices[0].distanceTo(vertices[2]);
		let w = vertices[1].distanceTo(vertices[3]);
		let u = (w / h) * 0.5;
		let v01 = new THREE.Vector3().subVectors(vertices[1], vertices[0]);
		let v02 = new THREE.Vector3().subVectors(vertices[2], vertices[0]);
		let dot = v02.clone().normalize().dot(v01);
		let v = 1 - dot / h;

		let gSide = new THREE.BufferGeometry()
			.setFromPoints(vertices)
			.rotateZ(-vertStep);
		gSide.setIndex([0, 1, 2, 0, 2, 3]);
		gSide.setAttribute(
			"uv",
			new THREE.Float32BufferAttribute(
				[0.5, 1, 0.5 - u, v, 0.5, 0, 0.5 + u, v],
				2
			)
		);
		gSide.computeVertexNormals();
		gSide = gSide.toNonIndexed();

		// all sides
		let gs = [];

		for (let i = 0; i < 5; i++) {
			let a = vertStep * 2 * i;
			let g1 = gSide.clone().rotateZ(-a);
			recomputeUVs(g1, i * 2 + 0);
			let g2 = gSide
				.clone()
				.rotateX(Math.PI)
				.rotateZ(vertStep + a);
			recomputeUVs(g2, i * 2 + 1);
			gs.push(g1, g2);
		}
		let g = BufferGeometryUtils.mergeBufferGeometries(gs);

		let m = new THREE.MeshLambertMaterial({
			map: getNumbers(),
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

	let angVel1 =
		sharedAngVel1 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel1;
	let angVel2 =
		sharedAngVel2 == null ? Math.random() * (1 - 0.1) + 0.1 : sharedAngVel2;

	decahedronBody.angularVelocity.set(angVel1, angVel2, 0.5);
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
		angVel1,
		angVel2,
	]);
}

function recomputeUVs(g, idx) {
	let tiles = {
		x: 4,
		y: 4,
	};
	let x = idx % tiles.x;
	let y = Math.floor(idx / tiles.x);

	let uvs = g.attributes.uv;
	for (let i = 0; i < uvs.count; i++) {
		let u = (uvs.getX(i) + x) / tiles.x;
		let v = (uvs.getY(i) + y) / tiles.y;
		uvs.setXY(i, u, v);
	}
}

function getNumbers() {
	let tileSize = 256;
	let tiles = {
		x: 4,
		y: 4,
	};

	let c = document.createElement("canvas");
	let ctx = c.getContext("2d");
	c.width = tileSize * 4;
	c.height = tileSize * 4;
	let u = (val) => tileSize * 0.01 * val;

	ctx.fillStyle = "rgba(0, 127, 255, 1)";
	ctx.fillRect(0, 0, c.width, c.height);

	ctx.font = `bold ${u(40)}px Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#f80";

	for (let i = 0; i < sides; i++) {
		let y = Math.floor(i / tiles.x);
		let x = i % tiles.x;
		let text = i + 1;

		ctx.save();
		ctx.translate(x * tileSize, c.height - y * tileSize);

		ctx.fillText(text, u(50), -u(40));
		if (text == 6 || text == 9) {
			ctx.fillText("_", u(50), -u(40));
		}
		ctx.restore();
	}

	let tex = new THREE.CanvasTexture(c);
	tex.colorSpace = "srgb";
	// tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
	tex.needsUpdate = true;

	return tex;
}
