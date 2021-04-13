// http://www.sitepoint.com/javascript-generate-lighter-darker-color/
export function colorLuminance(hex, lum) {
    var hex_string = ('000000' + hex.toString(16)).slice(-6);
    var rgb = "#";
    lum = lum || 0;
    for (var i = 0; i < 3; i++) {
        var num_color = parseInt(hex_string.substr(i * 2, 2), 16);
        var str_color = Math.round(Math.min(Math.max(0, num_color + (num_color * lum)), 255)).toString(16);
        rgb += ("00" + str_color).substr(str_color.length);
    }
    return rgb;
}
//# sourceMappingURL=helpers.js.map