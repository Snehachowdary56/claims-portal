import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
