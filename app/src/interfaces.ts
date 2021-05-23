import { Building, District, Block } from './blocks'
import * as THREE from 'three';

export interface BuildingData {
  abstract: boolean;
  anonymous: boolean;
  extends: string;
  file: string;
  final: boolean;
  implements: string;
  name: string;
  no_attrs: number;
  no_lines: number;
  no_methods: number;
  quality : string;
  trait: boolean;
  type: string;
  // You are defining an index signature which enforces the return type for all properties to match the index signature return type.
  [key: string]: string|number|boolean|Method[]|Variable[];
  // methodData : MethodData;
  methods: Method[];
  globle_variables :Variable[];

}

export interface Method {
  [key: string]: string|number|boolean|Variable[];
  name: string;
  no_attrs: number;
  no_lines: number;
  variables :Variable[];
}

export interface Variable {
  [key: string]: string|number|boolean|Variable[];
  name: string;
  type : string;
}

export interface City {
  districts: { [propName: string]: District };
  buildings: Array<Building>;
}

export interface InputObject extends BuildingData {
  namespace?: string;
}

export interface ExtendedMesh extends THREE.Mesh {
  block: Block;
  material: ExtendedMeshBasicMaterial;
  // edges: THREE.EdgesHelper;
  edges:THREE.EdgesGeometry;
  lines:THREE.LineSegments;
}

export interface ExtendedMeshBasicMaterial extends THREE.MeshBasicMaterial {
  defaultColor: number;
  originalColor: number;
}

// export interface ExtendedMeshBasicMaterial extends THREE.MeshBasicMaterial {
//   defaultColor: map;
//   originalColor: number;
// }