export class CesiumColor {
  red:number = 0;
  green:number = 0;
  blue:number = 0;
  alpha:number = 1;

  static fromCesiumColor(color:any) : CesiumColor {
    let cesiumColor = new CesiumColor();
    cesiumColor.red = color.red;
    cesiumColor.green = color.green;
    cesiumColor.blue = color.blue;
    cesiumColor.alpha = color.alpha;
    return cesiumColor;
  }
}
