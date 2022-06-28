import Person from "./person.mjs";
import Employee from "./employee.mjs";

const p1 = new Person("Bill", 20);
const p2 = new Employee("David", 30, "D007");

console.log(p1);
console.log("" + p1);
console.log(p2);
console.log("" + p2);
