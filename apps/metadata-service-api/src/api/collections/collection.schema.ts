import z from "zod";

export const SearchCollectionName = z.string().max(50).min(3);
