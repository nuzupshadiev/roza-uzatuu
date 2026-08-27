/** Marks where the bride's name interrupts `customMessage`. */
const BRIDE_TOKEN = "{{bride}}";

/**
 * Splits the invitation message around the bride's name.
 *
 * The two languages place the name differently in the same sentence: Kyrgyz
 * runs the sentence through it and continues underneath, while Russian finishes
 * the clause before it and leaves only the closing punctuation. So a tail that
 * carries no letters is returned as `suffix`, to sit on the name's own line,
 * rather than as `rest`, which would set a lone "!" as a paragraph.
 *
 * A message written without the token still renders: the name opens the block
 * and the whole message follows it.
 */
export function splitBrideMessage(message: string) {
  const text = message.trim();
  const index = text.indexOf(BRIDE_TOKEN);
  if (index === -1) return { lead: "", suffix: "", rest: text };

  const lead = text.slice(0, index).trim();
  const after = text.slice(index + BRIDE_TOKEN.length).trim();
  if (after && !/\p{L}/u.test(after)) return { lead, suffix: after, rest: "" };
  return { lead, suffix: "", rest: after };
}
