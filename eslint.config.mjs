import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
    },
  },
  prettier,
];

export default eslintConfig;
