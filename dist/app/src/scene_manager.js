import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
var SceneManager = /** @class */ (function () {
    function SceneManager() {
    }
    SceneManager.cleanUp = function () {
        // for (let obj of this.objects) {
        //     SceneManager.scene.remove(obj);
        //     SceneManager.scene.remove(obj.edges);
        //     obj.edges.geometry.dispose();
        //     obj.edges.material.dispose();
        //     obj.geometry.dispose();
        //     obj.material.dispose();
        // }
        // SceneManager.objects = [];
    };
    SceneManager.init = function () {
        // SceneManager.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        SceneManager.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('canvas') });
        SceneManager.renderer.domElement.addEventListener('mousemove', SceneManager.onDocumentMouseMove, false);
        document.body.appendChild(SceneManager.renderer.domElement);
        SceneManager.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(SceneManager.renderer.domElement);
        SceneManager.renderer.setClearColor(0xcccccc, 1);
        SceneManager.camera.position.z = 2;
        // SceneManager.camera.position.set(70, 70, 150);
        SceneManager.scene.add(SceneManager.camera);
        // add light
        SceneManager.scene.add(new THREE.AmbientLight(0xcccccc));
        //creating cube
        SceneManager.geometry = new THREE.BoxGeometry();
        SceneManager.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        SceneManager.cube = new THREE.Mesh(SceneManager.geometry, SceneManager.material);
        SceneManager.scene.add(SceneManager.cube);
        // create an event listener that resizes the renderer with the browser window.
        window.addEventListener('resize', function () {
            var width = window.innerWidth;
            var height = window.innerHeight;
            SceneManager.renderer.setSize(width, height);
            SceneManager.camera.aspect = width / height;
            SceneManager.camera.updateProjectionMatrix();
        });
        // Add OrbitControls so that we can pan around with the mouse.
        SceneManager.controls = new OrbitControls(SceneManager.camera, SceneManager.renderer.domElement);
    };
    // Renders the scene and updates the render as needed.
    SceneManager.animate = function () {
        requestAnimationFrame(SceneManager.animate);
        SceneManager.cube.rotation.x += 0.01;
        SceneManager.cube.rotation.y += 0.01;
        SceneManager.controls.update();
        SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);
    };
    ;
    SceneManager.initialize = function () {
        console.log("inside initialize");
        SceneManager.init();
        SceneManager.animate();
    };
    SceneManager.determineVisibility = function (mesh, building, val) {
        mesh.visible = true;
        // switch (val) {
        //     case 'all':
        //         mesh.visible = mesh.edges.visible = true;
        //         break;
        //     case 'abstract':
        //         mesh.visible = mesh.edges.visible = building.data.abstract;
        //         break;
        //     case 'final':
        //         mesh.visible = mesh.edges.visible = building.data.final;
        //         break;
        //     case 'interface':
        //         mesh.visible = mesh.edges.visible = building.data.type === 'interface';
        //         break;
        //     case 'trait':
        //         mesh.visible = mesh.edges.visible = building.data.trait;
        //         break;
        // }
    };
    SceneManager.onDocumentMouseMove = function (event) {
        event.preventDefault();
        var intersectColor = 0x00D66B;
        var coords = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        };
        SceneManager.raycaster.setFromCamera(coords, SceneManager.camera);
        // let intersections: THREE.Intersection[] = SceneManager.raycaster.intersectObjects(SceneManager.objects);
        // let tracker = $('#tracker');
        // if (intersections.length > 0) {
        //     if (SceneManager.intersectedBlock != intersections[0].object) {
        //         if (SceneManager.intersectedBlock) SceneManager.intersectedBlock.material.color.setHex(SceneManager.intersectedBlock.material.defaultColor);
        //         SceneManager.intersectedBlock = <ExtendedMesh>intersections[0].object;
        //         SceneManager.intersectedBlock.material.color.setHex(intersectColor);
        //         tracker.html(SceneManager.intersectedBlock.block.getTrackerText());
        //     }
        //     tracker.css({ top: `${event.clientY + 10}px`, left: `${event.clientX + 10}px`, display: 'block' });
        //     document.body.style.cursor = 'pointer';
        // } else if (SceneManager.intersectedBlock) {
        //     SceneManager.intersectedBlock.material.color.setHex(SceneManager.intersectedBlock.material.defaultColor);
        //     SceneManager.intersectedBlock = null;
        //     tracker.css('display', 'none');
        //     document.body.style.cursor = 'auto';
        // }
    };
    SceneManager.scene = new THREE.Scene();
    SceneManager.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    SceneManager.objects = [];
    SceneManager.raycaster = new THREE.Raycaster();
    return SceneManager;
}());
export { SceneManager };
//# sourceMappingURL=scene_manager.js.map