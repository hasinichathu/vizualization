import { SceneManager } from "./scene_manager";
import { processJSONInput, Preprocessor } from './preprocessor';
import { Building } from './blocks';
import * as $ from 'jQuery';
window.onload = function () {
    SceneManager.initialize();
    $("input[type=file]").on('change', function (e) { return processJSONInput(e.target); });
    $('input[name="filter-type"]').on('change', function (e) {
        var val = $('input[name="filter-type"]:checked').val();
        var l = SceneManager.objects.length;
        for (var i = 0; i < l; i++) {
            var block = SceneManager.objects[i].block;
            if (block instanceof Building) {
                SceneManager.determineVisibility(SceneManager.objects[i], block, val);
            }
        }
    });
    $('#class-extends').on('change', function (e) {
        $('#class-implements').val('');
        var val = $('#class-extends').val();
        var l = SceneManager.objects.length;
        for (var i = 0; i < l; i++) {
            var object = SceneManager.objects[i];
            var block = SceneManager.objects[i].block;
            if (block instanceof Building) {
                object.material.color.setHex(block.data.extends == val ? 0xeead12 : (object.material.defaultColor == 0xeead12 ? object.material.originalColor : object.material.defaultColor));
                object.material.defaultColor = block.data.extends == val ? 0xeead12 : object.material.originalColor;
            }
        }
    });
    $('#class-implements').on('change', function (e) {
        $('#class-extends').val('');
        var val = $('#class-implements').val();
        var l = SceneManager.objects.length;
        for (var i = 0; i < l; i++) {
            var object = SceneManager.objects[i];
            var block = SceneManager.objects[i].block;
            if (block instanceof Building) {
                object.material.color.setHex(block.data.implements == val ? 0xeead12 : (object.material.defaultColor == 0xeead12 ? object.material.originalColor : object.material.defaultColor));
                object.material.defaultColor = block.data.implements == val ? 0xeead12 : object.material.originalColor;
            }
        }
    });
    $('#settings-form').on('submit', function (e) {
        e.preventDefault();
        SceneManager.preprocessor.processJSON();
    });
    //start from here
    $('#demo-project-select').on('change', function (e) {
        var projectName = $('#demo-project-select').val();
        console.log("project name is " + projectName);
        $.getJSON('http://localhost:8080/data/' + projectName, function (data) {
            var preprocessor = new Preprocessor(data);
            SceneManager.preprocessor = preprocessor;
            preprocessor.processJSON(projectName);
        });
    });
};
//# sourceMappingURL=main.js.map