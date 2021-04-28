// http://www.sitepoint.com/javascript-generate-lighter-darker-color/

export function colorLuminance(hex: number, lum?: number) {
  let hex_string = ('000000' + hex.toString(16)).slice(-6);
  let rgb = "#";

  lum = lum || 0;

  for (let i = 0; i < 3; i++) {
    let num_color = parseInt(hex_string.substr(i * 2, 2), 16);
    let str_color = Math.round(Math.min(Math.max(0, num_color + (num_color * lum)), 255)).toString(16);

    rgb += ("00" + str_color).substr(str_color.length);
  }

  return rgb;
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function lerp(a: number, b: number, alpha: number) { 
	return a + (b-a) * alpha; 
};