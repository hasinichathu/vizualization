import * as THREE from 'three';
import { randFloat } from "./helpers";

export class TreeMesh {
	createTree(scene: THREE.Scene) {
		// ConeGeometry(radius : Float, height : Float, radialSegments : Integer, 
		//heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
		var height = 10;
		var heightStem = height * 0.5;
		var heightBush = height * 0.5;
		var radiusStem = 0.4;
		var radiusBush = 3;

		var colorStem = 0x34432C;

		var colorBush_0 = new THREE.Color(0x3B7D4E);
		var colorBush_1 = new THREE.Color(0x225749);

		const bushGeometry = new THREE.ConeGeometry(radiusBush, heightBush, 32);
		const bushMaterial = new THREE.MeshBasicMaterial({ color: 0x006700 });
		const cone = new THREE.Mesh(bushGeometry, bushMaterial);
		cone.castShadow = true;

		const axesHelper = new THREE.AxesHelper(10);
		scene.add(axesHelper);

		scene.add(cone);
		var edges = new THREE.EdgesGeometry(bushGeometry);
		var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffff00 }));
		line.renderOrder = 1;
		cone.add(line);
		cone.position.set(0, heightBush, 0);

		// CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, 
		// heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)

		const cylGeometry = new THREE.CylinderGeometry(radiusStem - 0.01, radiusStem, heightStem, 32);
		const cylMaterial = new THREE.MeshBasicMaterial({ color: 0x341a00 });
		const cylinder = new THREE.Mesh(cylGeometry, cylMaterial);
		scene.add(cylinder);
		cylinder.position.set(0, 0, 0);
		// cylinder.lookAt(cone.normal);
		scene.updateMatrixWorld(true);
	

		const geometry = new THREE.SphereGeometry(0.22, 5, 32);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const sphere = new THREE.Mesh(geometry, material);
		scene.add(sphere);

		var inclination = radiusBush / heightBush;
		var y_pos = height * 0.1;
		var x_pos = inclination * y_pos;

		sphere.position.set(x_pos, ((heightStem/2+heightBush)-y_pos), 0);

		const sphere2 = new THREE.Mesh(geometry, material);
		scene.add(sphere2);


		sphere2.position.set(0, ((heightStem/2+heightBush)-y_pos), x_pos);

	}

}

// export function makeTreeAt(a_pos) {
// 	var geo = new THREE.Geometry();

// 	var heightStem = randFloat(0.4, 0.6);
// 	var heightBush = heightStem * randFloat(1.5, 2.0);
// 	var radiusStem = 0.04;
// 	var radiusBush = heightBush * 0.3;

// 	var colorStem = 0x34432C;

// 	var colorBush_0 = new THREE.Color(0x3B7D4E);
// 	var colorBush_1 = new THREE.Color(0x225749);
// 	var colorBush = colorBush_0.clone();
// 	colorBush.lerp(colorBush_1, randFloat(0.0, 1.0));

// 	var y_0 = 0.0;
// 	var y_1 = heightStem;
// 	var y_2 = y_1 + heightBush;

// 	var segments = 4;
// 	var deltaAngle = 2.0 * Math.PI / segments;

// 	for (var i = 0; i < segments; i++) {
// 		var angle_0 = i * deltaAngle;
// 		var angle_1 = (i + 1) * deltaAngle;

// 		var dir_x_0 = Math.cos(angle_0);
// 		var dir_z_0 = Math.sin(angle_0);
// 		var dir_x_1 = Math.cos(angle_1);
// 		var dir_z_1 = Math.sin(angle_1);




// 		var stem_x_0 = a_pos.x + radiusStem * dir_x_0;
// 		var stem_z_0 = a_pos.z + radiusStem * dir_z_0;
// 		var stem_x_1 = a_pos.x + radiusStem * dir_x_1;
// 		var stem_z_1 = a_pos.z + radiusStem * dir_z_1;

// 		var bush_x_0 = a_pos.x + radiusBush * dir_x_0;
// 		var bush_z_0 = a_pos.z + radiusBush * dir_z_0;
// 		var bush_x_1 = a_pos.x + radiusBush * dir_x_1;
// 		var bush_z_1 = a_pos.z + radiusBush * dir_z_1;

// 		// stem
// 		geo.vertices.push(new THREE.Vector3(stem_x_0, y_0, stem_z_0));
// 		geo.vertices.push(new THREE.Vector3(stem_x_1, y_0, stem_z_1));
// 		geo.vertices.push(new THREE.Vector3(stem_x_1, y_1, stem_z_1));
// 		geo.vertices.push(new THREE.Vector3(stem_x_0, y_1, stem_z_0));

// 		var face = new THREE.Face3(geo.vertices.length - 4, geo.vertices.length - 2, geo.vertices.length - 3);
// 		face.color.setHex(colorStem);
// 		geo.faces.push(face);

// 		var face = new THREE.Face3(geo.vertices.length - 4, geo.vertices.length - 1, geo.vertices.length - 2);
// 		face.color.setHex(colorStem);
// 		geo.faces.push(face);

// 		// bush
// 		geo.vertices.push(new THREE.Vector3(bush_x_0, y_1, bush_z_0));
// 		geo.vertices.push(new THREE.Vector3(bush_x_1, y_1, bush_z_1));
// 		geo.vertices.push(new THREE.Vector3(a_pos.x, y_2, a_pos.z));

// 		var face = new THREE.Face3(geo.vertices.length - 3, geo.vertices.length - 1, geo.vertices.length - 2);
// 		face.color = colorBush;
// 		geo.faces.push(face);
// 	}

// 	var vertexColorMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });

// 	var mesh = new THREE.Mesh(
// 		geo,
// 		vertexColorMaterial
// 	);

// 	mesh.doubleSided = false;
// 	mesh.overdraw = false;
// 	g_scene.add(mesh);
// }