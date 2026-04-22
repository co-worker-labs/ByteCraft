import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

const eslintConfig = [...nextCoreWebVitals, prettier];

export default eslintConfig;
