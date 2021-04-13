var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { colorLuminance } from "./helpers";
import { SceneManager } from "./scene_manager";
import * as THREE from 'three';
import * as _ from 'underscore';
// var GrowingPacker: any;
var Block = /** @class */ (function () {
    // d and depth are two different things. d means height. for base its 1. 
    function Block(name, parent) {
        this.name = name;
        this.parent = parent;
        this.w = 0;
        this.h = 0;
        this.d = 0;
        this.depth = parent === null ? 0 : parent.depth + 1;
    }
    Block.prototype.getColor = function () {
        if (!this.color) {
            this.color = new THREE.Color(parseInt(colorLuminance(this.parent.getColor().getHex(), 0.3).substring(1).toUpperCase(), 16));
        }
        return this.color;
    };
    Block.prototype.setColor = function (color) {
        this.color = new THREE.Color(color);
    };
    Block.prototype.getX = function () {
        return (this.parent === null) ? this.fit.x : this.parent.getX() + this.fit.x;
    };
    Block.prototype.getY = function () {
        return (this.parent === null) ? this.fit.y : this.parent.getY() + this.fit.y;
    };
    Block.prototype.getTrackerText = function () {
        return this.name;
    };
    return Block;
}());
export { Block };
var Building = /** @class */ (function (_super) {
    __extends(Building, _super);
    function Building(parent, 
    //data about building like attributes, extends , no.of lines of codes etc.
    data, heightLevels, widthLevels, heightAttr, widthAttr) {
        var _this = _super.call(this, data.name, parent) || this;
        _this.parent = parent;
        _this.data = data;
        _this.heightLevels = heightLevels;
        _this.widthLevels = widthLevels;
        _this.heightAttr = heightAttr;
        _this.widthAttr = widthAttr;
        _this.calculateBlockWidth(widthAttr, widthLevels);
        _this.calculateBlockHeight(heightAttr, heightLevels);
        return _this;
    }
    Building.prototype.calculateBlockWidth = function (widthAttr, widthLevels) {
        for (var i = 0; i < 5; i++) {
            if (this.data[widthAttr] <= widthLevels[i]) {
                this.w = (i * 2 + 2) + 2; // +2 as base width; +2 for margin
                this.h = (i * 2 + 2) + 2; // +2 as base width; +2 for margin
                break;
            }
        }
    };
    Building.prototype.calculateBlockHeight = function (heightAttr, heightLevels) {
        for (var i = 0; i < 5; i++) {
            if (this.data[heightAttr] <= heightLevels[i]) {
                this.d = (i + 1) * 4;
                break;
            }
        }
    };
    Building.prototype.render = function (scene, depth) {
        var options = { color: 0x2f9dbd };
        if (this.data.abstract) {
            options.color = 0x2fbdab;
            options.opacity = 0.5;
            options.transparent = true;
        }
        else if (this.data.type === "interface") {
            options.color = 0x3c2fbd;
        }
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial(options);
        material.defaultColor = options.color;
        material.originalColor = options.color;
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = this.name ? this.name : '';
        mesh.position.set(this.getX() - 1 * this.parent.addWidth + 1, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.parent.addWidth + 1);
        mesh.scale.set(this.w - 2, this.d, this.h - 2);
        mesh.block = this;
        // var edges = new THREE.EdgesHelper(mesh, 0x000000);
        // var edges = new THREE.EdgesGeometry(mesh);
        // mesh.edges = edges;
        SceneManager.objects.push(mesh);
        scene.add(mesh);
        // scene.add(edges);
    };
    Building.prototype.getTrackerText = function () {
        var text = "<em>&lt;&lt; " + this.data.type + " &gt;&gt;</em><br><strong>" + this.name + "</strong><br>";
        if (this.data.extends !== null) {
            text += " extends <em>" + this.data.extends + "</em><br>";
        }
        if (this.data.implements !== null) {
            text += " implements <em>" + this.data.implements + "</em><br>";
        }
        return text + ("<br>Package: " + this.parent.getQualifiedName() + "<br><br>Methods: " + this.data.no_methods + "<br>Attributes: " + this.data.no_attrs + "<br>LOC: " + this.data.no_lines + "<br><br>File: " + this.data.file);
    };
    return Building;
}(Block));
export { Building };
var District = /** @class */ (function (_super) {
    __extends(District, _super);
    function District(name, height, parent) {
        var _this = _super.call(this, name, parent) || this;
        _this.children = [];
        _this.buildings = [];
        _this.d = height;
        return _this;
    }
    District.prototype.render = function (scene, depth) {
        var color = this.getColor().getHex();
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: color });
        material.defaultColor = material.originalColor = color;
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        // var mesh = new THREE.Mesh(geometry, material);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = this.name ? this.name : '';
        mesh.position.set(this.getX() - 1 * this.addWidth, 0 + depth / 2 + depth * 0.05, this.getY() - 1 * this.addWidth);
        mesh.scale.set(this.w - 2, this.d / 2, this.h - 2);
        // var edges = new THREE.EdgesHelper(mesh, 0x000000);
        // var edges = new THREE.EdgesGeometry(mesh);
        // var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        // mesh.edges = edges;
        scene.add(mesh);
        // scene.add(line);
        SceneManager.objects.push(mesh);
        mesh.block = this;
        _.each(this.children, function (e) { return e.render(scene, depth + 1); });
        _.each(this.buildings, function (e) { return e.render(scene, depth + 1); });
    };
    District.prototype.getWidth = function () {
        console.log("inside getWidth");
        //in first iteration check for base district
        var packer = new GrowingPacker(this);
        // if the district is of a top level
        if (this.children.length === 0) {
            //length of building array
            var l = this.buildings.length;
            var sorted = _.sortBy(this.buildings, function (e) { return e.w; }).reverse();
            //send all the building data to fit method
            packer.fit(sorted);
            //assign values to fit variables in block class
            this.w = packer.root.w + 2;
            this.h = packer.root.h + 2;
            this.fit = packer.root;
            for (var i = 0; i < sorted.length; i++) {
                var block = sorted[i];
                //check the building array of District. 
                for (var j = 0; j < l; j++) {
                    if (this.buildings[j].data.file === block.data.file) {
                        this.buildings[j].fit = block.fit;
                    }
                }
            }
            // if has child districts
        }
        else if (this.children.length != 0) {
            var l = this.children.length;
            // first calculate w/h on children
            for (var i = 0; i < l; i++) {
                this.childrenWidth();
            }
            var sorted = _.sortBy(this.children.concat(this.buildings), function (e) { return e.w; }).reverse();
            packer.fit(sorted);
            this.w = packer.root.w + 2;
            this.h = packer.root.h + 2;
            this.fit = packer.root;
            for (var i = 0; i < sorted.length; i++) {
                var block = sorted[i];
                for (var j = 0; j < this.buildings.length; j++) {
                    if (block instanceof Building && this.buildings[j].data.file === block.data.file) {
                        this.buildings[j].fit = block.fit;
                    }
                }
            }
        }
        return this.w;
    };
    District.prototype.childrenWidth = function () {
        var l = this.children.length;
        var width = 0;
        for (var i = 0; i < l; i++) {
            width += this.children[i].getWidth();
        }
        return width;
    };
    District.prototype.addBuilding = function (building) {
        this.buildings.push(building);
    };
    District.prototype.addChildDistrict = function (district) {
        this.children.push(district);
    };
    District.prototype.getQualifiedName = function () {
        if (this.parent === null) {
            return '';
        }
        if (this.name == 'none') {
            return '<em>No package</em>';
        }
        return this.parent.getQualifiedName() + "\\" + this.name;
    };
    District.prototype.getChildBuildingsCount = function () {
        var sum = _.reduce(this.children, function (memo, e) { return memo + e.getChildBuildingsCount(); }, 0);
        return sum + this.buildings.length;
        // return 5;
    };
    District.prototype.getTrackerText = function () {
        if (this.depth == 0) {
            return "<em>City base</em><br><em>Buildings:</em>" + this.getChildBuildingsCount();
        }
        return "<em>Package:</em><strong>" + this.getQualifiedName() + "</strong><br><em>Buildings:</em>" + this.getChildBuildingsCount();
    };
    return District;
}(Block));
export { District };
var GrowingPacker = /** @class */ (function () {
    function GrowingPacker(block) {
        this.newBlock = block;
    }
    GrowingPacker.prototype.fit = function (blocks) {
        var n, node, block;
        for (n = 0; n < blocks.length; n++) {
            block = blocks[n];
            if (node = this.findNode(this.root, block.w, block.h))
                node = this.splitNode(node, block.w, block.h);
            this.newBlock.fit = { x: node.fit.x, y: node.fit.y };
        }
    };
    GrowingPacker.prototype.findNode = function (root, w, h) {
        console.log(root.used + " root.used");
        if (root.used)
            return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
        else if ((w <= root.w) && (h <= root.h))
            return root;
        else
            return null;
    };
    GrowingPacker.prototype.splitNode = function (node, w, h) {
        node.used = true;
        node.down = { x: node.x, y: node.y + h, w: node.w, h: node.h - h };
        // console.log(node.down.x + " x " + node.down.y + " y " + node.down.w+ " w "  +node.down.h+ " h " );
        node.right = { x: node.x + w, y: node.y, w: node.w - w, h: h };
        // console.log(node.right.x + " x " + node.right.y + " y " + node.right.w+ " w "  +node.right.h+ " h " );
        return node;
    };
    return GrowingPacker;
}());
export { GrowingPacker };
var Node = /** @class */ (function () {
    function Node() {
    }
    return Node;
}());
export { Node };
//# sourceMappingURL=blocks.js.map