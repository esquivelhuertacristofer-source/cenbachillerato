import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Respeta la convención de "intencionalmente sin usar" con prefijo _.
      // Permite conservar parámetros que documentan una firma (p. ej. firmas
      // de stubs o callbacks de useFrame) sin disparar el warning.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Desplegamos en Cloudflare Workers (plan FREE) SIN el optimizador de
      // imágenes de Next. Migrar a next/Image obligaría a `unoptimized` en
      // todos los usos —cero beneficio sobre <img> y riesgo de romper el
      // render—, además de la nota del propio warning sobre posible costo.
      // Por eso usamos <img> de forma deliberada.
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // La extensión .cjs SIGNIFICA CommonJS: en esos archivos `require` no es un
    // estilo antiguo, es la única forma de importar que existe. La regla estaba
    // marcando como error la sintaxis correcta del formato, y siete "errores"
    // que no se pueden arreglar sin romper el archivo enseñan a ignorar el
    // informe completo. El resto de reglas sigue aplicando.
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
