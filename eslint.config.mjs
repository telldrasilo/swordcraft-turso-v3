import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Next.js 16: `eslint-config-next` отдаёт flat config; `FlatCompat.extends("next/...")` даёт
 * циклические структуры с ESLint 9. См. https://nextjs.org/docs/app/api-reference/config/eslint
 *
 * Политика: ошибки (error) ломают CI; предупреждения (warn) — техдолг.
 */
const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "examples/**",
      "skills",
      "swordcraft/**",
      "docs/**",
      "lib/**",
      "data/**",
      "types/**",
      "scripts/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "error",
      "no-unreachable": "error",
      "no-empty": ["warn", { allowEmptyCatch: false }],
      "no-fallthrough": ["warn", { commentPattern: ".*[Ff]alls?[ -]?through.*" }],
    },
  },
  {
    files: ["src/store/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/lib/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "import/no-anonymous-default-export": "error",
    },
  },
];

export default eslintConfig;
