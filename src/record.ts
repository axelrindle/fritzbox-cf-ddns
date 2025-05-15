import type Cloudflare from 'cloudflare'
import type { QuerySchema } from './query'

type Props = {
	client: Cloudflare
	env: Env
	params: QuerySchema
	type: 'A' | 'AAAA'
}

function getContent(type: Props['type'], params: QuerySchema) {
	switch (type) {
		case 'A':
			return params.ipv4
		case 'AAAA':
			return params.ipv6
		default:
			throw new Error(`invalid type ${type}`)
	}
}

export async function syncRecord({ client, env, params, type }: Props) {
	const records = await client.dns.records.list({
		zone_id: env.CLOUDFLARE_ZONE_ID,
		type,
		name: {
			exact: params.domain,
		},
	})

	if (records.result.length === 0) {
		await client.dns.records.create({
			zone_id: env.CLOUDFLARE_ZONE_ID,
			type,
			name: params.domain,
			content: getContent(type, params),
			ttl: 360,
			proxied: true,
		})
	} else {
		await client.dns.records.batch({
			zone_id: env.CLOUDFLARE_ZONE_ID,
			patches: records.result.map((record) => ({
				id: record.id,
				type,
				name: params.domain,
				content: getContent(type, params),
				ttl: 360,
				proxied: true,
			})),
		})
	}
}
