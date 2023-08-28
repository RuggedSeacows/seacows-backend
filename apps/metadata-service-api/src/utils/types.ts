/**
 * A type-hint to improve DX when dealing with intersected types ( i.e A & B )
 * This does not change the underlying type. It only helps the typescript
 * compiler ( and language-server ) show a refined version of the type
 * which can be easier to read and debug.
 */
export type Pretty<T> = {
  [K in keyof T]: T[K];
} extends infer U
  ? U
  : never;
