import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Политика: ошибки (error) ломают `next build`; предупреждения (warn) — техдолг.
 * Поэтапно поднимать warn→error по доменам (store → API → UI), не включать массово за один проход.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
      // Корневые артефакты вне src (согласовано с tsconfig exclude)
      "lib/**",
      "data/**",
      "types/**",
    ],
  },
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React specific rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-vars": "off", // Handled by @typescript-eslint/no-unused-vars
      "no-undef": "off", // Handled by TypeScript
      "no-redeclare": "error",
      "no-unreachable": "error",
      "no-empty": ["warn", { allowEmptyCatch: false }],
      "no-fallthrough": ["warn", { commentPattern: ".*[Ff]alls?[ -]?through.*" }],
    },
  },
  // Строже по неиспользуемым символам в store (типы уже чистятся через TS noUnused*)
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
  // Домен src/lib: основной покрываемый тестами слой — warn→error по ключевым правилам P1
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
