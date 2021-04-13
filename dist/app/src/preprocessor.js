import { Building, District } from './blocks';
import { SceneManager } from './scene_manager';
import * as _ from 'underscore';
import * as $ from 'jQuery';
export function processJSONInput(input) {
    var reader = new FileReader();
    reader.onload = function (evt) {
        var json;
        try {
            json = JSON.parse(evt.target.result);
        }
        catch (e) {
            alert('Could not parse input file. Did you upload valid JSON?');
            return;
        }
        var preprocessor = new Preprocessor(json);
        SceneManager.preprocessor = preprocessor;
        preprocessor.processJSON($(input).get(0).files[0].name.split('.')[0]);
    };
    reader.readAsText($(input).get(0).files[0], 'UTF-8');
}
var Preprocessor = /** @class */ (function () {
    function Preprocessor(json) {
        this.json = json;
        this.heightLevels = [];
        this.widthLevels = [];
        this.jsonLength = json.length;
    }
    Preprocessor.prototype.processJSON = function (fileName) {
        SceneManager.cleanUp();
        this.widthType = $('input[name="width-type"]:checked').val();
        this.heightType = $('input[name="height-type"]:checked').val();
        this.widthAttr = $('#width-attribute').val();
        this.heightAttr = $('#height-attribute').val();
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
        this.city.districts['base'].setColor(0x0e4467);
        // find out max depth of a district
        var maxDepth = _.max(this.city.districts, function (e) { return e.depth; });
        // var maxDepth = _.max(this.city.districts, (e) => e.depth).depth;
        // set margin for each district by finding his nesting level
        _.each(this.city.districts, function (e) { return e.addWidth = maxDepth - e.depth; });
        // calculate minimal dimensions for blocks
        base.getWidth();
        base.render(SceneManager.scene, 0);
        // fill selects
        var _extends = _.countBy(this.city.buildings, function (e) { return e.data.extends; });
        delete _extends['null'];
        var _implements = _.countBy(this.city.buildings, function (e) { return e.data.implements; });
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
    };
    Preprocessor.prototype.detectLevels = function () {
        console.log("inside detect levels");
        var sorted = _.sortBy(this.json, this.heightAttr);
        var sorted_length = sorted.length;
        var json_length = this.json.length;
        if (this.heightType == "evenly") {
            this.heightLevels = [
                sorted[Math.floor(json_length / 5)][this.heightAttr],
                sorted[Math.floor(json_length / 5 * 2)][this.heightAttr],
                sorted[Math.floor(json_length / 5 * 3)][this.heightAttr],
                sorted[Math.floor(json_length / 5 * 4)][this.heightAttr],
                sorted[sorted_length - 1][this.heightAttr],
            ];
        }
        else {
            this.heightLevels = [
                Math.floor(sorted[sorted_length - 1][this.heightAttr] / 5),
                Math.floor(sorted[sorted_length - 1][this.heightAttr] / 4),
                Math.floor(sorted[sorted_length - 1][this.heightAttr] / 3),
                Math.floor(sorted[sorted_length - 1][this.heightAttr] / 2),
                Math.floor(sorted[sorted_length - 1][this.heightAttr] / 1),
            ];
        }
        for (var i_1 = 1; i_1 < sorted_length; i_1++) {
            if (this.heightLevels[i_1] == this.heightLevels[i_1 - 1]) {
                this.heightLevels[i_1]++;
            }
            else if (this.heightLevels[i_1] < this.heightLevels[i_1 - 1]) {
                this.heightLevels[i_1] = this.heightLevels[i_1 - 1] + 1;
            }
            else if (!this.heightLevels[i_1]) {
                break;
            }
        }
        sorted = _.sortBy(this.json, this.widthAttr);
        if (this.widthType == "evenly") {
            this.widthLevels = [
                sorted[Math.floor(json_length / 5)][this.widthAttr],
                sorted[Math.floor(json_length / 5 * 2)][this.widthAttr],
                sorted[Math.floor(json_length / 5 * 3)][this.widthAttr],
                sorted[Math.floor(json_length / 5 * 4)][this.widthAttr],
                sorted[sorted_length - 1].no_attrs,
            ];
        }
        else {
            this.widthLevels = [
                Math.floor(sorted[sorted_length - 1][this.widthAttr] / 5),
                Math.floor(sorted[sorted_length - 1][this.widthAttr] / 4),
                Math.floor(sorted[sorted_length - 1][this.widthAttr] / 3),
                Math.floor(sorted[sorted_length - 1][this.widthAttr] / 2),
                Math.floor(sorted[sorted_length - 1][this.widthAttr] / 1),
            ];
        }
        for (var i = 1; i < sorted.length; i++) {
            if (this.widthLevels[i] == this.widthLevels[i - 1]) {
                this.widthLevels[i]++;
            }
            else if (this.widthLevels[i] < this.widthLevels[i - 1]) {
                this.widthLevels[i] = this.widthLevels[i - 1] + 1;
            }
            else if (!this.widthLevels[i]) {
                break;
            }
        }
    };
    Preprocessor.prototype.buildCity = function () {
        for (var i = 0; i < this.jsonLength; i++) {
            this.createBlock(this.json[i]);
        }
    };
    Preprocessor.prototype.createBlock = function (obj) {
        var currentDistrict = this.buildDistricts(obj.namespace);
        var building = new Building(currentDistrict, obj, this.heightLevels, this.widthLevels, this.heightAttr, this.widthAttr);
        currentDistrict.addBuilding(building);
        this.city.buildings.push(building);
    };
    Preprocessor.prototype.buildDistricts = function (namespace) {
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
    };
    Preprocessor.prototype.findOrCreateDistrict = function (name, height, parent) {
        if (this.city.districts[name] !== undefined) {
            return this.city.districts[name];
        }
        //when district  is undefined
        var district = new District(name, height, parent);
        this.city.districts[name] = district;
        parent.addChildDistrict(district);
        return district;
    };
    return Preprocessor;
}());
export { Preprocessor };
//# sourceMappingURL=preprocessor.js.map