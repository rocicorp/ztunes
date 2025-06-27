export function must<T>(
  value: T | undefined | null,
  message = 'Assertion failed. Required value is null or undefined.',
): T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
  return value;
}
