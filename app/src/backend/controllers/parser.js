const { parse } = require("java-parser");
const javaText = `
public class HelloWorldExample{
  public static void main(String args[]){
    System.out.println("Hello World !");
  }
}
`;

const cst = parse(javaText);
console.log("sdsd");



// explore the CST
const {
  BaseJavaCstVisitor,
  BaseJavaCstVisitorWithDefaults
} = require("java-parser");

// Use "BaseJavaCstVisitor" if you need to implement all the visitor methods yourself.
class LambdaArrowsPositionCollector extends BaseJavaCstVisitorWithDefaults {
  constructor() {
    super();
    this.customResult = [];
    this.validateVisitor();
  }

  lambdaExpression(ctx) {
    // Collects all the starting offsets of lambda arrows in lambdas with short (no parenthesis)
    // single argument lists: e.g:
    // - n -> n*n (will be collected)
    // - (n) -> n*n (not collected)
    if (ctx.lambdaParameters[0].children.Identifier) {
      console.log("sdsd");

      this.customResult.push(ctx.Arrow[0].startOffset);
    }
  }
}

const lambdaArrowsCollector = new LambdaArrowsPositionCollector();
// The CST result from the previous code snippet
lambdaArrowsCollector.visit(cst);
lambdaArrowsCollector.customResult.forEach((arrowOffset) => {
  console.log("sdsd");

  console.log(arrowOffset);
});