import { z } from 'zod'

export const querySchema = z.strictObject({
	token: z.string().uuid(),
	domain: z.string(),
	ipv4: z.string().ip({ version: 'v4' }).or(z.string().max(0)),
	ipv6: z.string().ip({ version: 'v6' }).or(z.string().max(0)),
})

export type QuerySchema = z.infer<typeof querySchema>
