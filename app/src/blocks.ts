import { colorLuminance } from "./helpers";
import { ClassData, ExtendedMesh, ExtendedMeshBasicMaterial, MethodData, Variable } from "./interfaces";
import { SceneManager } from "./scene_manager";
import * as THREE from 'three';
import * as _ from 'underscore';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Scene } from "three";


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

  abstract render(scene: THREE.Scene, depth: number): void;

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
  constructor(public parent: District,
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
      options.color = 0x3c2fbd;
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

    mesh.position.set(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1);
    mesh.scale.set(this.w - 2, this.d / 2, this.h - 2);

    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.renderOrder = 1; // make sure wireframes are rendered 2nd

    scene.add(mesh);
    SceneManager.objects.push(mesh);

    mesh.add(line);

    mesh.block = this;
    _.each(this.methods, (e) => e.render(scene, depth + 1));
    _.each(this.gVariables, (e) => e.render(scene, depth + 1));


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
    let sorted = _.sortBy(((<Block[]>this.methods).concat(<Block[]>this.gVariables)), (e) => e.w).reverse();

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

    return `${(<District>this.parent).getQualifiedName()}\\${this.name}`;
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

export class District extends Block {
  protected children: District[] = [];
  protected buildings: ForestClass[] = [];

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
    _.each(this.buildings, (e) => {
      e.render(scene, depth + 1);

    });
  }

  viewCityStructure() {
    if (this.children.length === 0) {
      for (let j = 0; j < this.buildings.length; j++) {
        console.log(this.buildings[j]);
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
    for (let j = 0; j < this.buildings.length; j++) {
      console.log(this.buildings[j]);
    }
  }

  public getWidth(): number {
    //in first iteration check for base district
    let packer = new GrowingPacker();

    // let packer = new GrowingPacker(this);
    // console.log(this.buildings.length + "building count");

    // if the district is of a top level
    if (this.children.length === 0) {

      //length of building array
      let l = this.buildings.length;
      // console.log("no of buildings "+l);

      for (let i = 0; i < l; i++) {
        this.buildings[i].getWidth();
        // this.getBuildingWidth(this.buildings[i]);
      }

      // for (let i = 0; i < l; i++) {
      //   console.log (this.buildings[i].methods[i].w+"building data");
      //   // this.getBuildingWidth(this.buildings[i]);
      // }
      //rearrange the building based on its width
      let sorted = _.sortBy(this.buildings, (e) => e.w).reverse();

      //send all the building data to fit method
      // console.log("building sorting started ");

      packer.fit(sorted);
      // console.log("building sorting ended ");
      // for (let j = 0; j < this.buildings.length; j++) {
      //   console.log(this.buildings[j]);
      // }
      //assign values to fit variables in block class
      this.w = packer.root.w + 2;
      this.h = packer.root.h + 2;
      this.fit = packer.root;
      // console.log("district dim "+this.w+", "+this.h+", "+this.fit.x+", "+this.fit.y);

      for (let i = 0; i < sorted.length; i++) {
        let block = sorted[i];

        //check the building array of respective District and add x,y coordinates
        for (let j = 0; j < l; j++) {
          if (this.buildings[j].data.file === block.data.file) {
            this.buildings[j].fit = block.fit;
          }
        }
      }
      // if has child districts
    } else if (this.children.length != 0) {
      //children means districts
      let l = this.buildings.length;
      // console.log("no of distrcits "+l);

      // first calculate w/h on children
      // for (let i = 0; i < l; i++) {
      // during creation of district width is not defined.
      //but in building creation width is defined.
      //by adding loop distrivts and building will be double printed
      this.childrenWidth();
      // }
      for (let i = 0; i < l; i++) {
        this.buildings[i].getWidth();
        // this.getBuildingWidth(this.buildings[i]);
      }

      // for (let i = 0; i < l; i++) {
      //   console.log (this.buildings[i].methods[i].w+"building data");
      //   // this.getBuildingWidth(this.buildings[i]);
      // }
      let sorted = _.sortBy(((<Block[]>this.children).concat(<Block[]>this.buildings)), (e) => e.w).reverse();
      // console.log("children sorting started " + this.name);
      // for (let j = 0; j < sorted.length; j++) {
      //   console.log(sorted[j]);
      // }

      packer.fit(sorted);
      // console.log("children sorting ended ");

      this.w = packer.root.w + 2;
      // console.log("inside else " + this.w+" this.w");

      this.h = packer.root.h + 2;
      this.fit = packer.root;
      // console.log(this.fit.x + " this.fit");
      // console.log("district dim "+this.w+", "+this.h+", "+this.fit.x+", "+this.fit.y);

      // insert x,y values into building array
      for (let i = 0; i < sorted.length; i++) {
        let block = sorted[i];

        for (let j = 0; j < this.buildings.length; j++) {
          if (block instanceof ForestClass && this.buildings[j].data.file === block.data.file) {
            this.buildings[j].fit = block.fit;
          }
        }
        for (let j = 0; j < this.children.length; j++) {
          if (block instanceof District && this.children[j].name === block.name) {
            this.children[j].fit = block.fit;
            // console.log(this.children[j].name + " district " + this.children[j].fit.x + ", " + this.children[j].fit.y);

          }
        }
      }
    }
    return this.w;
  }

  public childrenWidth() {
    let l = this.children.length;
    let width = 0;
    // console.log("chidrenwidth method "+ this.name);

    for (let i = 0; i < l; i++) {
      // console.log("chidrenwidth method "+ this.name + " " + i);

      // console.log("chidrenwidth method calling "+ this.children[i].name);

      width += this.children[i].getWidth();
    }

    return width;
  }


  public addBuilding(building: ForestClass) {
    this.buildings.push(building);
  }


  public addChildDistrict(district: District) {
    this.children.push(district);
  }

  public getQualifiedName(): string {
    if (this.parent === null) {
      return '';
    }

    if (this.name == 'none') {
      return '<em>No package</em>';
    }

    return `${(<District>this.parent).getQualifiedName()}\\${this.name}`;
  }

  public getChildBuildingsCount(): number {
    var sum = _.reduce(this.children, (memo: number, e: District): number => memo + e.getChildBuildingsCount(), 0);

    return sum + this.buildings.length;
    // return 5;
  }

  public getTrackerText() {
    if (this.depth == 0) {
      return `<em>City base</em><br><em>Buildings:</em>${this.getChildBuildingsCount()}`
    }

    return `<em>Package:</em><strong>${this.getQualifiedName()}</strong><br><em>Buildings:</em>${this.getChildBuildingsCount()}`;
  }
}

export class MethodTree extends Block {
  lVariables: LVariable[] = [];
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


  public render(scene: THREE.Scene, depth: number) {
    var height = this.d;
    var heightStem = height * 0.5;
    var heightBush = height * 0.5;
    var radiusStem = this.w * 0.04;

    const bushGeometry = new THREE.ConeGeometry((this.w - 2) / 2, heightBush, 32);
    bushGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

    const bushMaterial = new THREE.MeshBasicMaterial({ color: 0x006700 });
    const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial);
    bushMesh.castShadow = true;

    scene.add(bushMesh);

    bushMesh.name = this.name ? this.name : '';

    let x = this.getX() - 1 * this.parent.addWidth + 1 + (this.w - 2) / 2;
    let z = this.getY() - 1 * this.parent.addWidth + 1 + (this.w - 2) / 2;
    let y = 0 + depth / 2 + depth * 0.05 + heightBush;
    bushMesh.position.set(x, y, z);

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
    var inclination = heightBush / (this.w -2) / 2;
    var y_pos = heightBush * 0.1;
    var x_pos = y_pos/inclination;
    var x_pos = x_pos;

    for (let i = 0; i < this.lVariables.length; i++) {
      let n: number = angle_0[i % 4];
      _.each(this.lVariables, (e) => e.render(bushMesh, x_pos * Math.sin(n)+0.5, y_pos, x_pos * Math.cos(n)+0.5, heightBush, this.w));
    }
    ///////////////////////


    // const group = new THREE.Group()
    // const level1 = new THREE.Mesh(
    //   new THREE.ConeGeometry((this.w - 2) / 4, heightBush/3, 8),
    //   new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    // )
    // level1.position.y = 4
    // group.add(level1)
    // const level2 = new THREE.Mesh(
    //   new THREE.ConeGeometry((this.w - 2)/3, heightBush/3, 8),
    //   new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    // )
    // level2.position.y = 3
    // group.add(level2)
    // const level3 = new THREE.Mesh(
    //   new THREE.ConeGeometry((this.w - 2) / 2, heightBush/3, 8),
    //   new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    // )
    // level3.position.y = 2
    // group.add(level3)
    // const trunk = new THREE.Mesh(
    //   new THREE.CylinderGeometry(0.5, 0.5, 2),
    //   new THREE.MeshLambertMaterial({ color: 0xbb6600 })
    // )
    // trunk.position.y = 0
    // group.add(trunk)
    // scene.add(group);
    // group.position.set(0, heightBush, 0);

  }

  public addLVariable(lVariable: LVariable) {
    this.lVariables.push(lVariable);
  }

  public getTrackerText() {
    var text = `<em>&lt;&lt; ${this.data.type} &gt;&gt;</em><br><strong>${this.name}</strong><br>`;

    return text + `<br>Package: ${this.parent.getQualifiedName()}<br>Attributes: ${this.data.no_attrs}<br>LOC: ${this.data.no_lines}<br><br>File: ${this.data.file}`;
  }

  loadGLTF(x: number, y: number, z: number, scene: Scene) {
    var loader = new GLTFLoader();

    loader.load(
      'app/src/models/fireplace/model2.gltf',

      function (gltf) {
        var mesh = gltf.scene;
        mesh.position.set(x, y, z);
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
    var options: THREE.MeshBasicMaterialParameters = { color: 0x87697e };

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = <ExtendedMeshBasicMaterial>new THREE.MeshBasicMaterial(options);

    // material.defaultColor = <number>options.color;
    // material.originalColor = <number>options.color;

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
    // _.each(this.methods, (e) => e.render(scene, depth + 1));


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

  constructor(public parent: MethodTree,
    height: number,
    public data: Variable,
  ) {

  }

  public render(scene: THREE.Mesh, x_pos: number, y_pos: number, z_pos: number, heightBush: number, w: number) {
    var options: THREE.MeshBasicMaterialParameters = { color: 0x87697e };
    const geometry = new THREE.SphereGeometry(w * 0.05, 5, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // sphere.position.set(x_pos, ((heightBush / 2 - y_pos)), z_pos);
    sphere.position.set(x_pos,  y_pos+0.5, z_pos);

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
