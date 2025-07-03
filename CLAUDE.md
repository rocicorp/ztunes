# Code Style Guidelines for Zero Records

## Whitespace Rules
- **NO trailing spaces on ANY lines** - Remove all trailing whitespace from code lines and blank lines
- Keep blank lines completely empty with zero characters
- Use proper indentation but ensure no trailing spaces anywhere

This codebase follows strict whitespace rules. When editing files, ensure that:
1. No line has trailing spaces or tabs
2. Blank lines are completely empty (zero characters)

## Type Safety Rules
- **Avoid unnecessary null assertions (`!`)** - If you've already checked for truthiness, don't use `!`
- **Avoid type casting/downcasts** - Use proper TypeScript patterns instead of `as any` or type assertions
- **Prefer type guards** - Use `if (value)` checks instead of asserting with `!`

## Variable Usage Rules
- **Omit unused variables** - Don't destructure or declare variables that aren't used
- **Remove unused parameters** - Only include function parameters that are actually needed
- **Clean imports** - Remove unused imports and identifiers

## Examples

### Type Safety
```javascript
// ✅ Good - no null assertion needed after truthiness check
if (context.zero) {
  const query = context.zero.query.artist; // TypeScript knows it's not null
}

// ❌ Bad - unnecessary null assertion
if (context.zero) {
  const query = context.zero!.query.artist; // Don't use ! here
}
```

### Variable Usage
```javascript
// ✅ Good - only destructure what you use
loader: async ({ context, location }) => {
  // Use context and location
}

// ❌ Bad - unused params parameter
loader: async ({ context, params, location }) => {
  // params is never used
}
```

## Whitespace Example
```javascript
function example() {
  const a = 1;

  const b = 2;
}
```

NOT:
```javascript
function example() {
  const a = 1;   // <- trailing spaces - WRONG
  
  const b = 2;
}
```

## Reminder
- Always check for and remove ALL trailing whitespace when editing code
- Avoid unnecessary type assertions and null assertions
- Let TypeScript's type narrowing work naturally