(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('cannon'), require('three')) :
    typeof define === 'function' && define.amd ? define(['cannon', 'three'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.CannonDebugger = factory(global.CANNON, global.THREE));
  })(this, (function (cannon, three) { 'use strict';
  
    function CannonDebugger(scene, world, _temp) {
      let {
        color = 0x00ff00,
        scale = 1,
        onInit,
        onUpdate
      } = _temp === void 0 ? {} : _temp;
      const _meshes = [];
  
      const _material = new THREE.MeshBasicMaterial({
        color: color != null ? color : 0x00ff00,
        wireframe: true
      });
  
      const _tempVec0 = new CANNON.Vec3();
  
      const _tempVec1 = new CANNON.Vec3();
  
      const _tempVec2 = new CANNON.Vec3();
  
      const _tempQuat0 = new CANNON.Quaternion();
  
      const _sphereGeometry = new THREE.SphereGeometry(1);
  
      const _boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  
      const _planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10); // Move the planeGeometry forward a little bit to prevent z-fighting
  
  
      _planeGeometry.translate(0, 0, 0.0001);
  
      function createConvexPolyhedronGeometry(shape) {
        const geometry = new THREE.BufferGeometry(); // Add vertices
  
        const positions = [];
  
        for (let i = 0; i < shape.vertices.length; i++) {
          const vertex = shape.vertices[i];
          positions.push(vertex.x, vertex.y, vertex.z);
        }
  
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); // Add faces
  
        const indices = [];
  
        for (let i = 0; i < shape.faces.length; i++) {
          const face = shape.faces[i];
          const a = face[0];
  
          for (let j = 1; j < face.length - 1; j++) {
            const b = face[j];
            const c = face[j + 1];
            indices.push(a, b, c);
          }
        }
  
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();
        return geometry;
      }
  
      function createTrimeshGeometry(shape) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const v0 = _tempVec0;
        const v1 = _tempVec1;
        const v2 = _tempVec2;
  
        for (let i = 0; i < shape.indices.length / 3; i++) {
          shape.getTriangleVertices(i, v0, v1, v2);
          positions.push(v0.x, v0.y, v0.z);
          positions.push(v1.x, v1.y, v1.z);
          positions.push(v2.x, v2.y, v2.z);
        }
  
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();
        return geometry;
      }
  
      function createHeightfieldGeometry(shape) {
        const geometry = new THREE.BufferGeometry();
        const s = shape.elementSize || 1; // assumes square heightfield, else i*x, j*y
  
        const positions = shape.data.flatMap((row, i) => row.flatMap((z, j) => [i * s, j * s, z]));
        const indices = [];
  
        for (let xi = 0; xi < shape.data.length - 1; xi++) {
          for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
            const stride = shape.data[xi].length;
            const index = xi * stride + yi;
            indices.push(index + 1, index + stride, index + stride + 1);
            indices.push(index + stride, index + 1, index);
          }
        }
  
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();
        return geometry;
      }
  
      function createMesh(shape) {
        let mesh = new THREE.Mesh();
        const {
          SPHERE,
          BOX,
          PLANE,
          CYLINDER,
          CONVEXPOLYHEDRON,
          TRIMESH,
          HEIGHTFIELD
        } = CANNON.Shape.types;
  
        switch (shape.type) {
          case SPHERE:
            {
              mesh = new THREE.Mesh(_sphereGeometry, _material);
              break;
            }
  
          case BOX:
            {
              mesh = new THREE.Mesh(_boxGeometry, _material);
              break;
            }
  
          case PLANE:
            {
              mesh = new THREE.Mesh(_planeGeometry, _material);
              break;
            }
  
          case CYLINDER:
            {
              const geometry = new THREE.CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, shape.numSegments);
              mesh = new THREE.Mesh(geometry, _material);
              shape.geometryId = geometry.id;
              break;
            }
  
          case CONVEXPOLYHEDRON:
            {
              const geometry = createConvexPolyhedronGeometry(shape);
              mesh = new THREE.Mesh(geometry, _material);
              shape.geometryId = geometry.id;
              break;
            }
  
          case TRIMESH:
            {
              const geometry = createTrimeshGeometry(shape);
              mesh = new THREE.Mesh(geometry, _material);
              shape.geometryId = geometry.id;
              break;
            }
  
          case HEIGHTFIELD:
            {
              const geometry = createHeightfieldGeometry(shape);
              mesh = new THREE.Mesh(geometry, _material);
              shape.geometryId = geometry.id;
              break;
            }
        }
  
        scene.add(mesh);
        return mesh;
      }
  
      function scaleMesh(mesh, shape) {
        const {
          SPHERE,
          BOX,
          PLANE,
          CYLINDER,
          CONVEXPOLYHEDRON,
          TRIMESH,
          HEIGHTFIELD
        } = CANNON.Shape.types;
  
        switch (shape.type) {
          case SPHERE:
            {
              const {
                radius
              } = shape;
              mesh.scale.set(radius * scale, radius * scale, radius * scale);
              break;
            }
  
          case BOX:
            {
              mesh.scale.copy(shape.halfExtents);
              mesh.scale.multiplyScalar(2 * scale);
              break;
            }
  
          case PLANE:
            {
              break;
            }
  
          case CYLINDER:
            {
              mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
              break;
            }
  
          case CONVEXPOLYHEDRON:
            {
              mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
              break;
            }
  
          case TRIMESH:
            {
              mesh.scale.copy(shape.scale).multiplyScalar(scale);
              break;
            }
  
          case HEIGHTFIELD:
            {
              mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
              break;
            }
        }
      }
  
      function typeMatch(mesh, shape) {
        if (!mesh) return false;
        const {
          geometry
        } = mesh;
        return geometry instanceof THREE.SphereGeometry && shape.type === CANNON.Shape.types.SPHERE || geometry instanceof THREE.BoxGeometry && shape.type === CANNON.Shape.types.BOX || geometry instanceof THREE.PlaneGeometry && shape.type === CANNON.Shape.types.PLANE || geometry.id === shape.geometryId && shape.type === CANNON.Shape.types.CYLINDER || geometry.id === shape.geometryId && shape.type === CANNON.Shape.types.CONVEXPOLYHEDRON || geometry.id === shape.geometryId && shape.type === CANNON.Shape.types.TRIMESH || geometry.id === shape.geometryId && shape.type === CANNON.Shape.types.HEIGHTFIELD;
      }
  
      function updateMesh(index, shape) {
        let mesh = _meshes[index];
        let didCreateNewMesh = false;
  
        if (!typeMatch(mesh, shape)) {
          if (mesh) scene.remove(mesh);
          _meshes[index] = mesh = createMesh(shape);
          didCreateNewMesh = true;
        }
  
        scaleMesh(mesh, shape);
        return didCreateNewMesh;
      }
  
      function update() {
        const meshes = _meshes;
        const shapeWorldPosition = _tempVec0;
        const shapeWorldQuaternion = _tempQuat0;
        let meshIndex = 0;
  
        for (const body of world.bodies) {
          for (let i = 0; i !== body.shapes.length; i++) {
            const shape = body.shapes[i];
            const didCreateNewMesh = updateMesh(meshIndex, shape);
            const mesh = meshes[meshIndex];
  
            if (mesh) {
              // Get world position
              body.quaternion.vmult(body.shapeOffsets[i], shapeWorldPosition);
              body.position.vadd(shapeWorldPosition, shapeWorldPosition); // Get world quaternion
  
              body.quaternion.mult(body.shapeOrientations[i], shapeWorldQuaternion); // Copy to meshes
  
              mesh.position.copy(shapeWorldPosition);
              mesh.quaternion.copy(shapeWorldQuaternion);
              if (didCreateNewMesh && onInit instanceof Function) onInit(body, mesh, shape);
              if (!didCreateNewMesh && onUpdate instanceof Function) onUpdate(body, mesh, shape);
            }
  
            meshIndex++;
          }
        }
  
        for (let i = meshIndex; i < meshes.length; i++) {
          const mesh = meshes[i];
          if (mesh) scene.remove(mesh);
        }
  
        meshes.length = meshIndex;
      }
  
      return {
        update
      };
    }
  
    return CannonDebugger;
  
  }));
  