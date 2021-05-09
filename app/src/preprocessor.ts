import { City, InputObject, Method, Variable } from './interfaces';
import { Building, District, Block, MethodTree,GVariable,LVariable } from './blocks';
import { SceneManager } from './scene_manager';
import * as _ from 'underscore';
import * as $ from 'jQuery';
import { TreeMesh } from './Tree';

export function processJSONInput(input: HTMLInputElement) {
  var reader = new FileReader();

  reader.onload = (evt) => {
    let json: Array<InputObject>;

    try {
      json = JSON.parse(<string>evt.target.result);
    } catch (e) {
      alert('Could not parse input file. Did you upload valid JSON?');
      return;
    }

    let preprocessor = new Preprocessor(json);
    SceneManager.preprocessor = preprocessor;

    preprocessor.processJSON($(input).get(0).files[0].name.split('.')[0]);
  }

  reader.readAsText($(input).get(0).files[0], 'UTF-8');
}

export class Preprocessor {
  private jsonLength: number;
  private heightLevels: number[] = [];
  private widthLevels: number[] = [];

  private widthType: string;
  private heightType: string;
  private widthAttr: string;
  private heightAttr: string;

  private city: City;

  constructor(private json: Array<InputObject>) {
    this.jsonLength = json.length;
  }

  public processJSON(fileName?: string) {
    SceneManager.cleanUp();

    this.widthType = <string>$('input[name="width-type"]:checked').val();
    this.heightType = <string>$('input[name="height-type"]:checked').val();
    this.widthAttr = <string>$('#width-attribute').val();
    this.heightAttr = <string>$('#height-attribute').val();

    if (fileName) {
      $('#project-name').text(fileName);
    }

    $('#project-objects').text(this.json.length);

    this.city = {
      districts: { base: new District('base', 1, null) },
      buildings: []
    };

    this.detectLevels();
    this.buildCity();

    var buildingCount = this.city.buildings.length;
    var districtsCount = _.size(this.city.districts);
    var base = this.city.districts['base'];
    this.city.districts['base'].setColor(0xf25a07);

    // find out max depth of a district
    var maxDepth = <District>_.max(this.city.districts, (e) => { return e.depth; });

    // set margin for each district by finding his nesting level
    _.each(this.city.districts, (e) => { e.addWidth = maxDepth.depth - e.depth });

    var maxDepthBuilding = <Building>_.max(this.city.buildings, (e) => { return e.depth; });
    _.each(this.city.buildings, (e) => { e.addWidth = maxDepthBuilding.depth - e.depth });

    // calculate minimal dimensions for blocks
    base.getWidth();
    // base.viewCityStructure();

    base.render(SceneManager.scene, 0);
    // var treeMesh = new TreeMesh();
    // treeMesh.createTree(SceneManager.scene);

    // fill selects
    let _extends = _.countBy(this.city.buildings, (e) => e.data.extends);
    delete _extends['null'];

    let _implements = _.countBy(this.city.buildings, (e) => e.data.implements);
    delete _implements['null'];

    var eKeys = Object.keys(_extends).sort();
    var iKeys = Object.keys(_implements).sort();

    $('#class-extends').find('option').remove().end().append('<option>-</option>').val('');

    for (var i = 0; i < eKeys.length; i++) {
      $('<option/>').val(eKeys[i]).html('(' + _extends[eKeys[i]] + ') ' + eKeys[i]).appendTo('#class-extends');
    }

    $('#class-implements').find('option').remove().end().append('<option>-</option>').val('');

    for (var i = 0; i < iKeys.length; i++) {
      $('<option/>').val(iKeys[i]).html('(' + _implements[iKeys[i]] + ') ' + iKeys[i]).appendTo('#class-implements');
    }
  }

  private detectLevels() {
    // console.log("inside detect levels");
    // let sorted: InputObject[] = _.sortBy(this.json, this.heightAttr);
    // let sorted_length = sorted.length;
    let json_length = this.json.length;
    let methods: Method[]=[];

    var k = 0;
    for (let i = 0; i < this.json.length; i++) {
      for (let j = 0; j < this.json[i].methods.length; j++) {
        methods[k] = this.json[i].methods[j];
        k++;
      }
    }

    let sorted_methods: Method[] = _.sortBy(methods, this.heightAttr);
    let sorted_length = sorted_methods.length;

    if (this.heightType == "evenly") {
      this.heightLevels = [
        <number>sorted_methods[Math.floor(json_length / 5)][this.heightAttr],
        <number>sorted_methods[Math.floor(json_length / 5 * 2)][this.heightAttr],
        <number>sorted_methods[Math.floor(json_length / 5 * 3)][this.heightAttr],
        <number>sorted_methods[Math.floor(json_length / 5 * 4)][this.heightAttr],
        <number>sorted_methods[sorted_length - 1][this.heightAttr],
      ];
    } else {
      this.heightLevels = [
        Math.floor(<number>sorted_methods[sorted_length - 1][this.heightAttr] / 5),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.heightAttr] / 4),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.heightAttr] / 3),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.heightAttr] / 2),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.heightAttr] / 1),
      ];

    }
    for (let i = 1; i < sorted_length; i++) {
      if (this.heightLevels[i] == this.heightLevels[i - 1]) {
        this.heightLevels[i]++;
      } else if (this.heightLevels[i] < this.heightLevels[i - 1]) {
        this.heightLevels[i] = this.heightLevels[i - 1] + 1;
      } else if (!this.heightLevels[i]) {
        break;
      }
    }
    // console.log(this.heightLevels);

    sorted_methods = _.sortBy(methods, this.widthAttr);

    // sorted = _.sortBy(this.json, this.widthAttr);

    if (this.widthType == "evenly") {
      this.widthLevels = [
        <number>sorted_methods[Math.floor(json_length / 5)][this.widthAttr],
        <number>sorted_methods[Math.floor(json_length / 5 * 2)][this.widthAttr],
        <number>sorted_methods[Math.floor(json_length / 5 * 3)][this.widthAttr],
        <number>sorted_methods[Math.floor(json_length / 5 * 4)][this.widthAttr],
        <number>sorted_methods[sorted_length - 1].no_attrs,
      ];
    } else {
      this.widthLevels = [
        Math.floor(<number>sorted_methods[sorted_length - 1][this.widthAttr] / 5),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.widthAttr] / 4),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.widthAttr] / 3),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.widthAttr] / 2),
        Math.floor(<number>sorted_methods[sorted_length - 1][this.widthAttr] / 1),
      ];
    }

    for (var i = 1; i < sorted_methods.length; i++) {
      if (this.widthLevels[i] == this.widthLevels[i - 1]) {
        this.widthLevels[i]++;
      } else if (this.widthLevels[i] < this.widthLevels[i - 1]) {
        this.widthLevels[i] = this.widthLevels[i - 1] + 1;
      } else if (!this.widthLevels[i]) {
        break;
      }
    }
  }

  private buildCity() {
    for (let i = 0; i < this.jsonLength; i++) {
      this.createBlock(this.json[i]);
    }

  }

  private createBlock(obj: InputObject) {
    const currentDistrict = this.buildDistricts(obj.namespace);

    const building = new Building(currentDistrict, 1, obj, this.heightLevels, this.widthLevels, this.heightAttr, this.widthAttr);
    // console.log(building.data.name + " building");

    currentDistrict.addBuilding(building);
    this.city.buildings.push(building);
    this.addMethods(building, obj.methods);
    this.addGlobleVar(building, obj.globle_variables);

  }

  private buildDistricts(namespace: string) {
    var parentDistrict = this.city.districts['base'];

    if (!namespace || namespace === '') {
      return this.findOrCreateDistrict('none', 1, parentDistrict);
    }

    //when there is namespace
    var districtNames = namespace.split('\\');
    var length = districtNames.length;

    for (var i = 0; i < length; i++) {
      var district = this.findOrCreateDistrict(districtNames[i], 1, parentDistrict);
      parentDistrict = district;
    }

    return district;
  }

  private findOrCreateDistrict(name: string, height: number, parent: District) {
    if (this.city.districts[name] !== undefined) {
      return this.city.districts[name];
    }

    //when district  is undefined
    var district = new District(name, height, parent);
    this.city.districts[name] = district;

    parent.addChildDistrict(district);

    return district;
  }

  private addMethods(parent: Building, method: Method[]) {
    // console.log(method);
    for (let i = 0; i < method.length; i++) {
      var methodTree = new MethodTree(parent, method[i], this.heightLevels, this.widthLevels, this.heightAttr, this.widthAttr);
      parent.addMethod(methodTree);
      this.addLocalVar(methodTree, method[i].variables);
      console.log(method[i].variables.length);
    }
  }

  private addGlobleVar(parent: Building, variables: Variable[]) {
    // console.log(method);
    for (let i = 0; i < variables.length; i++) {
      var gVariable = new GVariable(parent,1, variables[i]);
      parent.addGVariable(gVariable);
    }
  }
  private addLocalVar(parent:MethodTree, variables: Variable[]){
    for (let i = 0; i < variables.length; i++) {
      var lVariable = new LVariable(parent,1, variables[i]);
      parent.addLVariable(lVariable);
    }
  }
  
}

