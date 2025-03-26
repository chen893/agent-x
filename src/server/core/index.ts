import { ProductManagerAgent } from "./agents/productManager";

const productManager = new ProductManagerAgent("productManager");

try {
  const result = await productManager.performTask("需求分析");
  console.log(result);
} catch (error) {
  console.error(error);
}
