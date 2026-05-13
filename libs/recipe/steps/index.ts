import { registerSteps } from "../registry";
import { encodingSteps } from "./encoding";
import { cryptoSteps } from "./crypto";
import { textSteps } from "./text";
import { formatSteps } from "./format";
import { generatorSteps } from "./generator";
import { visualSteps } from "./visual";

const allSteps = [
  ...encodingSteps,
  ...cryptoSteps,
  ...textSteps,
  ...formatSteps,
  ...generatorSteps,
  ...visualSteps,
];

registerSteps(allSteps);

export { allSteps };
