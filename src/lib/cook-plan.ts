/** Turns a dish on or off in the list of meals the person is about to cook. */
export function togglePlanned(planned: string[], id: string): string[] {
  return planned.includes(id) ? planned.filter((p) => p !== id) : [...planned, id];
}
