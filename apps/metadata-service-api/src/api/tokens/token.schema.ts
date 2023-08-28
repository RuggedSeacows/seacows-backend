import z from "zod";

export const QueryTokensArgs = z.object({
  from_block: z.number().optional(),
  to_block: z.number().optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
  q: z.string(),
  filter: z.enum([
    "name",
    "description",
    "attributes",
    "global",
    "name,description",
    "name,attributes",
    "description,attributes",
    "name,description,attributes",
  ]),
  cursor: z.string().optional(),
  limit: z.number().optional(),
});

export interface QueryTokensArgs {
  /**
   * The minimum block number from which to start the search
   * * Provide the param 'from_block' or 'from_date'
   * * If 'from_date' and 'from_block' are provided, 'from_block' will be used.
   */
  from_block?: number;
  /**
   * The maximum block number from which to end the search
   * * Provide the param 'to_block' or 'to_date'
   * * If 'to_date' and 'to_block' are provided, 'to_block' will be used.
   */
  to_block?: number;
  /**
   * The date from which to start the search (any format that is accepted by momentjs)
   * * Provide the param 'from_block' or 'from_date'
   * * If 'from_date' and 'from_block' are provided, 'from_block' will be used.
   */
  from_date?: string;
  /**
   * Get search results up until this date (any format that is accepted by momentjs)
   * * Provide the param 'to_block' or 'to_date'
   * * If 'to_date' and 'to_block' are provided, 'to_block' will be used.
   */
  to_date?: string;
  /** The search string */
  q: string;
  /** What fields the search should match on. To look into the entire metadata set the value to 'global'. To have a better response time you can look into a specific field like name */
  filter:
    | "name"
    | "description"
    | "attributes"
    | "global"
    | "name,description"
    | "name,attributes"
    | "description,attributes"
    | "name,description,attributes";
  /** The cursor returned in the previous response (used for getting the next page). */
  cursor?: string;
  /** The desired page size of the result. */
  limit?: number;
}
