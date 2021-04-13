import { SceneManager } from "./scene_manager";
import { ExtendedMesh, ExtendedMeshBasicMaterial } from "./interfaces";
import { processJSONInput, Preprocessor } from './preprocessor';
import { Building } from './blocks';
import * as $ from 'jQuery';

window.onload = function() {
  SceneManager.initialize();

  $("input[type=file]").on('change', (e) => processJSONInput(<HTMLInputElement>e.target));

  $('input[name="filter-type"]').on('change', (e) => {
    let val = $('input[name="filter-type"]:checked').val();
    let l = SceneManager.objects.length;

    for (var i = 0; i < l; i++) {
      let block = SceneManager.objects[i].block;

      if (block instanceof Building) {
        SceneManager.determineVisibility(SceneManager.objects[i], block, <string>val);
      }
    }
  });

  $('#class-extends').on('change', (e) => {
    $('#class-implements').val('');

    let val = $('#class-extends').val();
    let l = SceneManager.objects.length;

    for (let i = 0; i < l; i++) {
      let object = SceneManager.objects[i];
      let block = SceneManager.objects[i].block;

      if (block instanceof Building) {
        object.material.color.setHex(block.data.extends == val ? 0xeead12 : (object.material.defaultColor == 0xeead12 ? object.material.originalColor : object.material.defaultColor));
        object.material.defaultColor = block.data.extends == val ? 0xeead12 : object.material.originalColor;
      }
    }
  });

  $('#class-implements').on('change', (e) => {
    $('#class-extends').val('');

    let val = $('#class-implements').val();
    let l = SceneManager.objects.length;

    for (let i = 0; i < l; i++) {
      let object = SceneManager.objects[i];
      let block = SceneManager.objects[i].block;

      if (block instanceof Building) {
        object.material.color.setHex(block.data.implements == val ? 0xeead12 : (object.material.defaultColor == 0xeead12 ? object.material.originalColor : object.material.defaultColor));
        object.material.defaultColor = block.data.implements == val ? 0xeead12 : object.material.originalColor;
      }
    }
  });

  $('#settings-form').on('submit', (e) => {
    e.preventDefault();
    SceneManager.preprocessor.processJSON();
  });

  //start from here
  $('#demo-project-select').on('change', (e) => {
    let projectName = $('#demo-project-select').val();
    // console.log("project name is "+ projectName);
      $.getJSON('http://localhost:8080/data/'+projectName, (data) => {

      let preprocessor = new Preprocessor(data);
      SceneManager.preprocessor = preprocessor;

      preprocessor.processJSON(<string>projectName);
    });
  });
}