import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Preprocessor } from './preprocessor';
import { ExtendedMesh } from './interfaces';
import { ForestClass, District } from './blocks';
import * as $ from 'jQuery';
import { Mesh } from '../libraries/three';



export class SceneManager {

    static scene: THREE.Scene = new THREE.Scene();

    static camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    static geometry: THREE.BoxGeometry;
    static material: THREE.MeshBasicMaterial;

    static cube: THREE.Mesh;

    static objects: ExtendedMesh[] = [];
    static meshObjects: Mesh[] = [];

    static preprocessor: Preprocessor;

    static raycaster = new THREE.Raycaster();
    static renderer: THREE.WebGLRenderer;
    // static camera: THREE.PerspectiveCamera;
    static controls: OrbitControls;

    static intersectedBlock: ExtendedMesh;


    static cleanUp() {
        for (let obj of this.objects) {
            SceneManager.scene.remove(obj);
            SceneManager.scene.remove(obj);

            // SceneManager.scene.remove(obj.edges);

            // obj.edges.geometry.dispose();
            // obj.edges.material.dispose();

            obj.geometry.dispose();
            obj.material.dispose();
        }

        SceneManager.objects = [];
        SceneManager.meshObjects = [];
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            let child = this.scene.children[i];
            this.scene.remove(child);
        }

    }
    static init() {
        // SceneManager.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        SceneManager.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: <HTMLCanvasElement>document.getElementById('canvas') });

        SceneManager.renderer.domElement.addEventListener('mousemove', SceneManager.onDocumentMouseMove, false);
        document.body.appendChild(SceneManager.renderer.domElement);
        SceneManager.renderer.setSize(window.innerWidth - 36, window.innerHeight - 110);
        document.body.appendChild(SceneManager.renderer.domElement);
        SceneManager.renderer.setClearColor(0xcccccc, 1);
        //light grey
        // SceneManager.camera.position.z = 12;
        SceneManager.camera.position.set(70, 70, 130);
        SceneManager.scene.add(SceneManager.camera);

        // add light
        SceneManager.scene.add(new THREE.AmbientLight(0xcccccc));

        // create an event listener that resizes the renderer with the browser window.
        window.addEventListener('resize', () => {
            let width = window.innerWidth;
            let height = window.innerHeight;

            SceneManager.renderer.setSize(width, height);
            SceneManager.camera.aspect = width / height;
            SceneManager.camera.updateProjectionMatrix();
        });

        // Add OrbitControls so that we can pan around with the mouse.
        SceneManager.controls = new OrbitControls(SceneManager.camera, SceneManager.renderer.domElement);
        this.controls.enablePan = true;
    }

    // Renders the scene and updates the render as needed.
    static animate() {
        requestAnimationFrame(SceneManager.animate)

        SceneManager.controls.update();
        SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);

    };



    static initialize() {
        SceneManager.init();
        SceneManager.animate();
    }
    static determineVisibility(mesh: ExtendedMesh, building: ForestClass, val: string) {
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
        // }
    }
    static onDocumentMouseMove(event: MouseEvent) {
        event.preventDefault();

        let intersectColor = 0x00D66B;
        let coords = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: - (event.clientY / window.innerHeight) * 2 + 1
        };

        SceneManager.raycaster.setFromCamera(coords, SceneManager.camera);

        let intersections: THREE.Intersection[] = SceneManager.raycaster.intersectObjects(SceneManager.objects);
        let tracker = $('#tracker');

        if (intersections.length > 0) {
            if (SceneManager.intersectedBlock != intersections[0].object) {
                if (SceneManager.intersectedBlock) SceneManager.intersectedBlock.material.color.setHex(SceneManager.intersectedBlock.material.defaultColor);

                SceneManager.intersectedBlock = <ExtendedMesh>intersections[0].object;
                SceneManager.intersectedBlock.material.color.setHex(intersectColor);

                tracker.html(SceneManager.intersectedBlock.block.getTrackerText());
            }

            tracker.css({ top: `${event.clientY + 10}px`, left: `${event.clientX + 10}px`, display: 'block' });

            document.body.style.cursor = 'pointer';
        } else if (SceneManager.intersectedBlock) {
            SceneManager.intersectedBlock.material.color.setHex(SceneManager.intersectedBlock.material.defaultColor);
            SceneManager.intersectedBlock = null;

            tracker.css('display', 'none');

            document.body.style.cursor = 'auto';
        }
    }

}