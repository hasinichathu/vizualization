import { colorLuminance } from "./helpers";
import { ClassData, ExtendedMesh, ExtendedMeshBasicMaterial, MethodData, Variable } from "./interfaces";
import { SceneManager } from "./scene_manager";
import * as THREE from 'three';
import * as _ from 'underscore';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Scene } from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export class Position {
  x: number;
  y: number;
  z: number;

}
export abstract class Block {
  protected color: THREE.Color;
  public fit: { x: number, y: number };
  public addWidth: number;

  public w: number = 0;
  public h: number = 0;
  public d: number = 0;
  public depth: number;
  // d and depth are two different things. d means height. for base its 1. 
  constructor(protected name: string, protected parent: Block) {
    this.depth = parent === null ? 0 : parent.depth + 1;
    // console.log(this.depth + " " + this.name);
  }

  abstract render(scene: THREE.Scene, depth: number, isInterface?: boolean): void;

  public getColor(): THREE.Color {
    if (!this.color) {
      this.color = new THREE.Color(parseInt(colorLuminance(this.parent.getColor().getHex(), 0.3).substring(1).toUpperCase(), 16));
    }

    return this.color;
  }

  public setColor(color: number) {
    this.color = new THREE.Color(color);
  }

  public getX(): number {
    return (this.parent === null) ? this.fit.x : this.parent.getX() + this.fit.x;
  }

  public getY(): number {
    return (this.parent === null) ? this.fit.y : this.parent.getY() + this.fit.y;
  }

  public getTrackerText() {
    return this.name;
  }
}

export class ForestClass extends Block {
  public methods: MethodTree[] = [];
  public gVariables: GVariable[] = [];
  constructor(public parent: Island,
    height: number,
    //data about building like attributes, extends , no.of lines of codes etc.
    public data: ClassData,
    public heightLevels: number[],
    public widthLevels: number[],
    public heightAttr: string,
    public widthAttr: string) {
    super(data.name, parent);
    this.d = height;
  }

  public render(scene: THREE.Scene, depth: number) {
    var options: THREE.MeshBasicMaterialParameters = { color: 0x3D550C };
    if (this.data.abstract) {
      options.color = 0x2fbdab;
      options.opacity = 0.5
      options.transparent = true;
    } else if (this.data.type === "interface") {
      options.color = 0xDAA520;
    }
    // var wood = new THREE.TextureLoader().load('textures/wood.jpg');
    // var grass = new THREE.TextureLoader().load('textures/grass.jpg');

    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var materialWood = new THREE.MeshBasicMaterial({ map: wood });
    // var materialGrass = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial({ color: 0x3D550C });

    // materialGrass.defaultColor = materialGrass.originalColor = 0x3D550C;


    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial(options);

    material.defaultColor = <number>options.color;
    material.originalColor = <number>options.color;

    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

    var mesh: ExtendedMesh = <ExtendedMesh><unknown>new THREE.Mesh(geometry, material);
    mesh.name = this.name ? this.name : '';

    var mesh2: ExtendedMesh = <ExtendedMesh><unknown>new THREE.Mesh(geometry, material);


    mesh.position.set(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1);
    mesh.scale.set(this.w - 2, this.d / 2, this.h - 2);

    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.renderOrder = 1; // make sure wireframes are rendered 2nd

    scene.add(mesh);
    SceneManager.objects.push(mesh);

    mesh.add(line);

    if (!this.data.is_secure) {
      // this.loadGLTF(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene);
      // this.loadObj(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene);
      this.loadObj(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene, this.w - 2, this.h - 2);

    }
    // console.log(this.data.quality + this.data.name);
    if (this.data.quality === "low") {
      console.log(this.data.quality + this.data.name);

      this.addFog(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene, this.w - 2, this.h - 2, this.data.quality);
      // this.loadObj(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene);

    } else if (this.data.quality === "medium") {
      console.log(this.data.quality + this.data.name);

      this.addFog(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene, this.w - 2, this.h - 2, this.data.quality);
      // this.loadObj(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1, scene);

    }

    mesh.block = this;
    if (this.data.type === "interface") {
      _.each(this.methods, (e) => e.render(scene, depth + 1, true));
    }
    else {
      _.each(this.methods, (e) => e.render(scene, depth + 1, false));
    }
    _.each(this.gVariables, (e) => e.render(scene, depth + 1));


  }
  public addFog(x: number, y: number, z: number, scene: Scene, w: number, l: number, quality: string) {
    var positions: Position[] = [];
    var center = { x: x + w / 2, y: y, z: z + l / 2 };
    var spread;
    var options: THREE.MeshBasicMaterialParameters;

    if (w > l) {
      spread = l / 2;
    } else {
      spread = w / 2;
    }

    const geometry = new THREE.SphereGeometry(0.11, 5, 10);

    if (quality == "low") {
      options = { color: 0xff0000 };

    } else if (quality == "medium") {
      options = { color: 0xffffff };
    }

    for (var i = 0; i < 20; i++) {
      x = center.x + this.randFloat(-spread, spread);
      y = this.randFloat(5, spread * 0.5);
      z = center.z + this.randFloat(-spread, spread);
      positions.push({ x: x, y: y, z: z });
      const sphere = new THREE.Mesh(geometry, material);
      var material = new THREE.MeshBasicMaterial(options);
      scene.add(sphere);

      sphere.position.set(x, y, z);


    }
  }

  public loadObj(x: number, y: number, z: number, scene: Scene, w: number, l: number) {
    console.log(" inside obj loader");
    var center = { x: x + w / 2, y: y, z: z + l / 2 };
    var options: THREE.MeshBasicMaterialParameters = { color: 0x800000 };
    options.color = 0x800000;
    options.opacity = 0.5
    options.transparent = true;
    const loader = new OBJLoader();

    const mtlLoader = new MTLLoader();
    mtlLoader.load('app/src/models/flamered2.mtl', (mtl) => {
      mtl.preload();
      loader.setMaterials(mtl);

      loader.load('app/src/models/flamered2.obj', function (object) {

        object.scale.set(w * 0.05, w * 0.05, w * 0.05);
        scene.add(object);
        object.position.set(center.x, center.y, center.z);
        const axesHelper = new THREE.AxesHelper(5);
        object.add(axesHelper);
        const ambientLight = new THREE.AmbientLight("red", 10);
        object.add(ambientLight);
      },
        function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
          console.log('An error happened');
        }
      );
    });

  }
  public randFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  loadGLTF(x: number, y: number, z: number, scene: Scene) {
    var loader = new GLTFLoader();
    console.log(" inside loader");
    loader.load(
      'app/src/models/fireplace/model2.gltf',

      function (gltf) {
        var mesh = gltf.scene;
        mesh.position.set(x, y + 1, z);
        scene.add(mesh);

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

      },
      // called while loading is progressing
      function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      function (error) {

        console.log('An error happened');

      }
    );
  }

  public getTrackerText() {
    var text = `<em>&lt;&lt; ${this.data.type} &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    if (this.data.extends !== null) {
      text += ` extends <em>${this.data.extends}</em><br>`;
    }

    if (this.data.implements !== null) {
      text += ` implements <em>${this.data.implements}</em><br>`;
    }

    return text + `<br>Package: ${this.parent.getQualifiedName()}<br><br>Methods: ${this.data.no_methods}<br>Attributes: ${this.data.no_attrs}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }

  public getWidth(): number {
    //in first iteration check for base district
    let packer = new GrowingPacker();

    // console.log(this.buildings.length + "building count");

    // if the district is of a top level

    //length of building array
    let l = this.methods.length;
    // console.log("no of buildings "+l);

    //rearrange the building based on its width
    // let sorted = _.sortBy(this.methods, (e) => e.w).reverse();
    let sorted;
    if (this.gVariables.length > 0) {
      sorted = _.sortBy(((<Block[]>this.methods).concat(<Block[]>this.gVariables)), (e) => e.w).reverse();
    } else {
      sorted = _.sortBy((<Block[]>this.methods), (e) => e.w).reverse();

    }
    //send all the building data to fit method
    // console.log("building sorting started ");

    packer.fit(sorted);
    // console.log("building sorting ended ");

    //assign values to fit variables in block class
    this.w = packer.root.w + 2;
    this.h = packer.root.h + 2;
    this.fit = packer.root;
    // console.log("building dim "+this.w+", "+this.h+", "+this.fit.x+", "+this.fit.y);

    for (let i = 0; i < sorted.length; i++) {
      let block = sorted[i];

      for (let j = 0; j < this.methods.length; j++) {
        if (block instanceof MethodTree && this.methods[j].data.name === block.data.name) {
          this.methods[j].fit = block.fit;
        }
      }
      //check the building array of respective District and add x,y coordinates
      for (let j = 0; j < this.gVariables.length; j++) {
        if (block instanceof GVariable && this.gVariables[j].data.name === block.data.name) {
          this.gVariables[j].fit = block.fit;
        }
      }
    }
    return this.w;
  }

  public getQualifiedName(): string {
    if (this.parent === null) {
      return '';
    }

    if (this.name == 'none') {
      return '<em>No package</em>';
    }

    return `${(<Island>this.parent).getQualifiedName()}\\${this.name}`;
  }

  public addMethod(method: MethodTree) {
    this.methods.push(method);
    // console.log(method.data.name+" method added to "+this.data.name);

  }

  public addGVariable(variable: GVariable) {
    this.gVariables.push(variable);
    // console.log(method.data.name+" method added to "+this.data.name);

  }
}

export class Island extends Block {
  protected children: Island[] = [];
  protected forestClass: ForestClass[] = [];

  constructor(name: string, height: number, parent: Block) {
    super(name, parent);

    this.d = height;
  }

  public render(scene: THREE.Scene, depth: number) {

    var color = this.getColor().getHex();
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial({ color: color });
    var baseMaterial = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial({ color: 0x2F69E7 });

    material.defaultColor = material.originalColor = color;

    var wood = new THREE.TextureLoader().load('textures/wood.jpg');
    var grass = new THREE.TextureLoader().load('textures/grass.jpg');

    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var materialWood = new THREE.MeshBasicMaterial({ map: wood });
    var materialGrass = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial({ color: 0x007500 });

    baseMaterial.defaultColor = baseMaterial.originalColor = 0x2F69E7;
    materialGrass.defaultColor = materialGrass.originalColor = 0x007500;

    // const islandMaterials = [
    //   materialWood,
    //   materialGrass,
    //   materialWood

    // ];
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
    if (this.name === 'base') {
      var mesh: ExtendedMesh = <ExtendedMesh><unknown>new THREE.Mesh(geometry, baseMaterial);
      mesh.scale.set(this.w - 2 + 10, this.d / 2, this.h - 2 + 10);
      mesh.position.set(this.getX() - 1 * this.addWidth - 5, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.addWidth - 5);

    } else {
      var mesh: ExtendedMesh = <ExtendedMesh><unknown>new THREE.Mesh(geometry, material);
      mesh.scale.set(this.w - 2, this.d / 2, this.h - 2);
      mesh.position.set(this.getX() - 1 * this.addWidth, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.addWidth);

    }
    mesh.name = this.name ? this.name : '';

    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.renderOrder = 1; // make sure wireframes are rendered 2nd

    scene.add(mesh);
    mesh.add(line);

    SceneManager.objects.push(mesh);

    mesh.block = this;

    _.each(this.children, (e) => e.render(scene, depth + 1));
    _.each(this.forestClass, (e) => {
      e.render(scene, depth + 1);

    });
  }

  viewCityStructure() {
    if (this.children.length === 0) {
      for (let j = 0; j < this.forestClass.length; j++) {
        console.log(this.forestClass[j]);
      }
    } else if (this.children.length != 0) {
      // console.log("no of distrcits "+l);

      for (let j = 0; j < this.children.length; j++) {
        // console.log(this.children[j]);
        this.children[j].viewCityStructure();
      }
    }
  }

  viewBuildingNames() {
    for (let j = 0; j < this.forestClass.length; j++) {
      console.log(this.forestClass[j]);
    }
  }

  public getWidth(): number {
    //in first iteration check for base district
    let packer = new GrowingPacker();

    // if the district is of a top level
    if (this.children.length === 0) {

      //length of building array
      let l = this.forestClass.length;
      // console.log("no of buildings "+l);

      for (let i = 0; i < l; i++) {
        this.forestClass[i].getWidth();
      }

      //rearrange the building based on its width
      let sorted = _.sortBy(this.forestClass, (e) => e.w).reverse();

      //send all the building data to fit method
      packer.fit(sorted);

      //assign values to fit variables in block class
      this.w = packer.root.w + 2;
      this.h = packer.root.h + 2;
      this.fit = packer.root;

      for (let i = 0; i < sorted.length; i++) {
        let block = sorted[i];
        //check the building array of respective District and add x,y coordinates
        for (let j = 0; j < l; j++) {
          if (this.forestClass[j].data.file === block.data.file) {
            this.forestClass[j].fit = block.fit;
          }
        }
      }
      // if has child districts
    } else if (this.children.length != 0) {
      //children means districts
      let l = this.forestClass.length;
      // console.log("no of distrcits "+l);

      // first calculate w/h on children
      // during creation of district width is not defined.
      //but in building creation width is defined.
      //by adding loop distrivts and building will be double printed
      this.childrenWidth();
      // }
      for (let i = 0; i < l; i++) {
        this.forestClass[i].getWidth();
        // this.getBuildingWidth(this.buildings[i]);
      }

      let sorted = _.sortBy(((<Block[]>this.children).concat(<Block[]>this.forestClass)), (e) => e.w).reverse();

      packer.fit(sorted);

      this.w = packer.root.w + 2;

      this.h = packer.root.h + 2;
      this.fit = packer.root;

      // insert x,y values into building array
      for (let i = 0; i < sorted.length; i++) {
        let block = sorted[i];

        for (let j = 0; j < this.forestClass.length; j++) {
          if (block instanceof ForestClass && this.forestClass[j].data.file === block.data.file) {
            this.forestClass[j].fit = block.fit;
          }
        }
        for (let j = 0; j < this.children.length; j++) {
          if (block instanceof Island && this.children[j].name === block.name) {
            this.children[j].fit = block.fit;
          }
        }
      }
    }
    return this.w;
  }

  public childrenWidth() {
    let l = this.children.length;
    let width = 0;

    for (let i = 0; i < l; i++) {
      width += this.children[i].getWidth();
    }

    return width;
  }


  public addBuilding(building: ForestClass) {
    this.forestClass.push(building);
  }


  public addChildDistrict(district: Island) {
    this.children.push(district);
  }

  public getQualifiedName(): string {
    if (this.parent === null) {
      return '';
    }

    if (this.name == 'none') {
      return '<em>No package</em>';
    }

    return `${(<Island>this.parent).getQualifiedName()}\\${this.name}`;
  }

  public getChildBuildingsCount(): number {
    var sum = _.reduce(this.children, (memo: number, e: Island): number => memo + e.getChildBuildingsCount(), 0);

    return sum + this.forestClass.length;
    // return 5;
  }

  public getTrackerText() {
    if (this.depth == 0) {
      return `<em>Ocean</em><br><em>Islands:</em>${this.getChildBuildingsCount()}`
    }

    return `<em>Package:</em><strong>${this.getQualifiedName()}</strong><br><em>Islands:</em>${this.getChildBuildingsCount()}`;
  }
}

export class MethodTree extends Block {
  lVariables: LVariable[] = [];
  parameters: Parameter[] = [];

  constructor(public parent: ForestClass,

    //data about building like attributes, extends , no.of lines of codes etc.
    public data: MethodData,
    public heightLevels: number[],
    public widthLevels: number[],
    public heightAttr: string,
    public widthAttr: string) {
    super(data.name, parent);

    this.calculateBlockWidth(widthAttr, widthLevels);
    this.calculateBlockHeight(heightAttr, heightLevels);
  }

  private calculateBlockWidth(widthAttr: string, widthLevels: number[]) {
    for (var i = 0; i < 5; i++) {
      if (this.data[widthAttr] <= widthLevels[i]) {

        this.w = (i * 2 + 2) + 2;   // +2 as base width; +2 for margin
        // console.log("width of buildingW "+this.data.name + " = "+this.w );

        this.h = (i * 2 + 2) + 2;   // +2 as base width; +2 for margin
        // console.log("height of buildingW "+this.data.name + " = "+this.h );

        break;
      }
    }
  }

  private calculateBlockHeight(heightAttr: string, heightLevels: number[]) {
    for (let i = 0; i < 5; i++) {
      if (this.data[heightAttr] <= heightLevels[i]) {
        this.d = (i + 1) * 4;
        // console.log("height of treeH " + this.data.name + " = " + this.h);

        break;
      }
    }
  }


  public render(scene: THREE.Scene, depth: number, isInterface: boolean) {
    var height = this.d;
    var heightStem = height * 0.5;
    var heightBush = height * 0.5;
    var radiusStem = this.w * 0.04;
    var radius = (this.w) / 3;


    let x = this.getX() - 1 * this.parent.addWidth + 1 + radius;
    let z = this.getY() - 1 * this.parent.addWidth + 1 + radius;
    let y = 0 + depth / 2 + depth * 0.05 + heightBush;

    if (isInterface) {
      console.log("inside interface");
      const stemGeometry = new THREE.CylinderGeometry(radiusStem, radiusStem + 0.2, height, 5);
      stemGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

      const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x341a00 });
      const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);
      scene.add(stemMesh);
      stemMesh.position.set(x, y - 1, z);

    }
    else {

      const bushGeometry = new THREE.ConeGeometry(radius, heightBush, 32);
      bushGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

      const bushMaterial = new THREE.MeshBasicMaterial({ color: 0x006700 });
      const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);
      bushMesh.castShadow = true;

      scene.add(bushMesh);

      bushMesh.name = this.name ? this.name : '';

      bushMesh.position.set(x, y, z);

      // const axesHelper = new THREE.AxesHelper(15);
      // bushMesh.add(axesHelper);

      const stemGeometry = new THREE.CylinderGeometry(radiusStem, radiusStem, heightStem, 32);
      const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x341a00 });
      const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);
      bushMesh.add(stemMesh);

      scene.updateMatrixWorld(true);
      stemMesh.position.set(0.5, -heightBush / 2, 0.5);

      // if(){

      // }
      // bushMesh.block = this;
      ////////////

      var segments = 4;
      var deltaAngle = 2.0 * Math.PI / segments;
      var angle_0 = [];
      for (var i = 0; i < segments; i++) {
        angle_0[i] = i * deltaAngle;
      }
      var inclination = heightBush / radius;
      var y_pos: number;
      var x_pos: number;
      // var x_pos = x_pos;

      var variableRows = Math.ceil(this.lVariables.length / 4);
      var allocatedBushHeight = heightBush / 2;
      var heightPerRow = allocatedBushHeight / variableRows;

      // let n: number ;
      let row: number;

      for (let i = 0; i < this.lVariables.length; i++) {

        let n = angle_0[i % 4];
        row = Math.floor(i / 4) + 1;
        y_pos = - row * heightPerRow + row / 2;
        x_pos = (allocatedBushHeight + -1 * y_pos) / inclination;
        _.each(this.lVariables, (e) => e.render(bushMesh, x_pos * Math.sin(n) + 0.5, y_pos + 0.5, x_pos * Math.cos(n) + 0.5, heightBush, this.w));
      }

      var parameterRows = Math.ceil(this.parameters.length / 4);
      allocatedBushHeight = heightBush / 4;
      heightPerRow = allocatedBushHeight / parameterRows;

      for (let i = 0; i < this.parameters.length; i++) {
        let n = angle_0[i % 4];
        row = Math.floor(i / 4) + 1;
        y_pos = row * heightPerRow - row / 2;
        x_pos = (allocatedBushHeight * 2 - y_pos) / inclination;
        _.each(this.parameters, (e) => e.render(bushMesh, x_pos * Math.sin(n) + 0.5, y_pos + 0.5
          , x_pos * Math.cos(n) + 0.5, heightBush, this.w));
      }
    }
  }


  public addLVariable(lVariable: LVariable) {
    this.lVariables.push(lVariable);
  }

  public addParameters(parameter: Parameter) {
    this.parameters.push(parameter);
  }

  public getTrackerText() {
    var text = `<em>&lt;&lt; Method &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    return text + `<br>Package: ${this.parent.getQualifiedName()}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }

  addTree(scene: Scene, heightBush: number) {

    const group = new THREE.Group()
    const level1 = new THREE.Mesh(
      new THREE.ConeGeometry((this.w - 2) / 4, heightBush / 3, 8),
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    )
    level1.position.y = 4
    group.add(level1)
    const level2 = new THREE.Mesh(
      new THREE.ConeGeometry((this.w - 2) / 3, heightBush / 3, 8),
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    )
    level2.position.y = 3
    group.add(level2)
    const level3 = new THREE.Mesh(
      new THREE.ConeGeometry((this.w - 2) / 2, heightBush / 3, 8),
      new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    )
    level3.position.y = 2
    group.add(level3)
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 2),
      new THREE.MeshLambertMaterial({ color: 0xbb6600 })
    )
    trunk.position.y = 0
    group.add(trunk)
    scene.add(group);
    group.position.set(0, heightBush, 0);
  }

}


export class GVariable extends Block {

  constructor(public parent: ForestClass,
    height: number,
    public data: Variable,
  ) {
    super(data.name, parent);
    this.d = height;
    this.w = 1;
    this.h = 1;
  }

  public render(scene: THREE.Scene, depth: number) {
    var options: THREE.MeshBasicMaterialParameters = { color: 0xffbf00 };

    // var geometry = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.SphereGeometry(0.5, 1, 1);
    var material = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial(options);
    var options: THREE.MeshBasicMaterialParameters = { color: 0xffbf00 };

    // const geometry = new THREE.SphereGeometry(1 * 0.05, 5, 10);
    // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);

    material.defaultColor = <number>options.color;
    material.originalColor = <number>options.color;

    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

    var mesh: ExtendedMesh = <ExtendedMesh><unknown>new THREE.Mesh(geometry, material);
    mesh.name = this.name ? this.name : '';

    mesh.position.set(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1);
    mesh.scale.set(this.w - 2, this.d / 2, this.h - 2);

    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.renderOrder = 1; // make sure wireframes are rendered 2nd

    scene.add(mesh);
    SceneManager.objects.push(mesh);

    mesh.add(line);

    mesh.block = this;
  }

  public getTrackerText() {
    var text = `<em>&lt;&lt; ${this.data.type} &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    if (this.data.extends !== null) {
      text += ` extends <em>${this.data.extends}</em><br>`;
    }

    if (this.data.implements !== null) {
      text += ` implements <em>${this.data.implements}</em><br>`;
    }

    return text + `<br>Package: ${this.parent.getQualifiedName()}<br><br>Methods: ${this.data.no_methods}<br>Attributes: ${this.data.no_attrs}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }


  // public getQualifiedName(): string {
  //   if (this.parent === null) {
  //     return '';
  //   }

  //   if (this.name == 'none') {
  //     return '<em>No package</em>';
  //   }

  //   return `${(<District>this.parent).getQualifiedName()}\\${this.name}`;
  // }

}
export class LVariable {

  constructor(public parent: MethodTree, height: number, public data: Variable) {
  }

  public render(scene: THREE.Mesh, x_pos: number, y_pos: number, z_pos: number, heightBush: number, w: number) {
    var options: THREE.MeshBasicMaterialParameters = { color: 0x87697e };
    const geometry = new THREE.SphereGeometry(w * 0.05, 5, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(x_pos, y_pos, z_pos);
    // console.log(x_pos + " inside l " +y_pos + " "+z_pos );
  }

  public getTrackerText() {
    // var text = `<em>&lt;&lt; ${this.data.type} &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    // if (this.data.extends !== null) {
    //   text += ` extends <em>${this.data.extends}</em><br>`;
    // }

    // if (this.data.implements !== null) {
    //   text += ` implements <em>${this.data.implements}</em><br>`;
    // }

    // return text + `<br><br>Methods: ${this.data.no_methods}<br>Attributes: ${this.data.no_attrs}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }

  // public getQualifiedName(): string {
  // if (this.parent === null) {
  //   return '';
  // }

  // if (this.name == 'none') {
  //   return '<em>No package</em>';
  // }

  // return `${(<District>this.parent).getQualifiedName()}\\${this.name}`;
  // }

}

export class Parameter {

  constructor(public parent: MethodTree,
    height: number,
    public data: Variable,
  ) {

  }

  public render(scene: THREE.Mesh, x_pos: number, y_pos: number, z_pos: number, heightBush: number, w: number) {
    var options: THREE.MeshBasicMaterialParameters = { color: 0x87697e };


    const geometry = new THREE.TorusKnotGeometry(w * 0.05, 0.3, 5, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x800080 });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    torusKnot.position.set(x_pos, y_pos, z_pos);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    // instantiate a loader
    // const loader = new OBJLoader();

    // load a resource
    // loader.load(
    //   // resource URL
    //   'app/src/models/flowerpurple.obj',
    //   // called when resource is loaded
    //   function (object) {
    //     const quaternion = new THREE.Quaternion();
    //     quaternion.setFromAxisAngle( new THREE.Vector3(x_pos, y_pos, z_pos ), Math.PI / 2 );

    //     const vector = new THREE.Vector3( x_pos, y_pos, z_pos);
    //     vector.applyQuaternion( quaternion );
    //     object.lookAt(vector);
    //     object.scale.set(w * 0.05,w * 0.05,w * 0.05); 
    //     scene.add(object);

    //   },
    //   // called when loading is in progresses
    //   function (xhr) {

    //     console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    //   },
    //   // called when loading has errors
    //   function (error) {

    //     console.log('An error happened');

    //   }
    // );


  }

  loadObj(x: number, y: number, z: number, scene: Scene) {
    console.log(" inside obj loader");
    // Set up lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    // instantiate a loader
    const loader = new OBJLoader();

    // load a resource
    loader.load(
      // resource URL
      'app/src/models/flowerpurple.obj',
      // called when resource is loaded
      function (object) {

        scene.add(object);

      },
      // called when loading is in progresses
      function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      function (error) {

        console.log('An error happened');

      }
    );
  }

  public getTrackerText() {
    // var text = `<em>&lt;&lt; ${this.data.type} &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    // if (this.data.extends !== null) {
    //   text += ` extends <em>${this.data.extends}</em><br>`;
    // }

    // if (this.data.implements !== null) {
    //   text += ` implements <em>${this.data.implements}</em><br>`;
    // }

    // return text + `<br><br>Methods: ${this.data.no_methods}<br>Attributes: ${this.data.no_attrs}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }

  // public getQualifiedName(): string {
  //   if (this.parent === null) {
  //     return '';
  //   }

  //   if (this.name == 'none') {
  //     return '<em>No package</em>';
  //   }

  //   return `${(<District>this.parent).getQualifiedName()}\\${this.name}`;
  // }

}
export class GrowingPacker {
  root: { x: number, y: number, w: number, h: number, used?: boolean, down?: any, right?: any };

  public fit(blocks: Block[]) {
    var n, node, block, len = blocks.length;
    var w = len > 0 ? blocks[0].w : 0;
    var h = len > 0 ? blocks[0].h : 0;
    this.root = { x: 0, y: 0, w: w, h: h };
    for (n = 0; n < len; n++) {
      block = blocks[n];
      if (node = this.findNode(this.root, block.w, block.h)) {
        block.fit = this.splitNode(node, block.w, block.h);
      } else {
        block.fit = this.growNode(block.w, block.h);
      }
    }
  }

  public findNode(root: any, w: number, h: number): Block {
    if (root.used)
      return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
    else if ((w <= root.w) && (h <= root.h))
      return root;
    else
      return null;
  }

  public splitNode(node: any, w: number, h: number): any {
    node.used = true;
    node.down = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
    node.right = { x: node.x + w, y: node.y, w: node.w - w, h: h };

    return node;
  }

  public growNode(w: number, h: number): any {
    var canGrowDown = (w <= this.root.w);
    var canGrowRight = (h <= this.root.h);

    var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w)); // attempt to keep square-ish by growing right when height is much greater than width
    var shouldGrowDown = canGrowDown && (this.root.w >= (this.root.h + h)); // attempt to keep square-ish by growing down  when width  is much greater than height

    if (shouldGrowRight)
      return this.growRight(w, h);
    else if (shouldGrowDown)
      return this.growDown(w, h);
    else if (canGrowRight)
      return this.growRight(w, h);
    else if (canGrowDown)
      return this.growDown(w, h);
    else
      return null; // need to ensure sensible root starting size to avoid this happening
  }

  public growRight(w: number, h: number): any {
    var node;
    this.root = {
      used: true,
      x: 0,
      y: 0,
      w: this.root.w + w,
      h: this.root.h,
      down: this.root,
      right: { x: this.root.w, y: 0, w: w, h: this.root.h }
    };
    if (node = this.findNode(this.root, w, h))
      return this.splitNode(node, w, h);
    else
      return null;
  }

  public growDown(w: number, h: number): any {
    var node;
    this.root = {
      used: true,
      x: 0,
      y: 0,
      w: this.root.w,
      h: this.root.h + h,
      down: { x: 0, y: this.root.h, w: this.root.w, h: h },
      right: this.root
    };
    if (node = this.findNode(this.root, w, h))
      return this.splitNode(node, w, h);
    else
      return null;
  }

}
