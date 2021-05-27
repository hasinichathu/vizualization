import { ForestClass, District, Block } from './blocks'
import * as THREE from 'three';

export interface ClassData {
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
  [key: string]: string|number|boolean|MethodData[]|Variable[];
  // methodData : MethodData;
  methods: MethodData[];
  globle_variables :Variable[];
  is_secure:boolean;

}

export interface MethodData {
  [key: string]: string|number|boolean|Variable[];
  name: string;
  no_attrs: number;
  no_lines: number;
  variables :Variable[];
  is_secure : boolean;
}

export interface Variable {
  [key: string]: string|number|boolean|Variable[];
  name: string;
  type : string;
}

export interface City {
  districts: { [propName: string]: District };
  buildings: Array<ForestClass>;
}

export interface InputObject extends ClassData {
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