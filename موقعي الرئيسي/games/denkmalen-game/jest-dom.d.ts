// @testing-library/jest-dom ships its own type augmentations (toBeInTheDocument,
// etc.) inside its package folder rather than under node_modules/@types, so
// TypeScript's implicit "include every @types/* package" rule doesn't pick it
// up — it needs an explicit reference somewhere in the compiled project.
/// <reference types="@testing-library/jest-dom" />
