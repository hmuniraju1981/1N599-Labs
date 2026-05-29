// =============================================================================
// FILE: src/lib/utils.ts
// PURPOSE: Utility helper functions used throughout the application.
//          Keeps reusable logic in one place for DRY (Don't Repeat Yourself).
// =============================================================================

/**
 * Combines multiple class name strings into one, filtering out falsy values.
 * Useful for conditionally applying Tailwind classes in components.
 *
 * @param classes - Array of class strings or undefined/null values
 * @returns A single space-separated class string with falsy values removed
 *
 * @example
 * cn("text-white", isActive && "bg-blue-500", undefined)
 * // Returns: "text-white bg-blue-500" (skips undefined)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  // Filter removes any falsy values (false, undefined, null, "")
  // Join combines remaining strings with a space separator
  return classes.filter(Boolean).join(" ");
}
