import { zValidator } from '@hono/zod-validator'
import Cloudflare from 'cloudflare'
import { Hono } from 'hono'
import { querySchema } from './query'
import { syncRecord } from './record'

const app = new Hono<{ Bindings: Env }>()

app.get('/api.txt', (c) => {
	const url = new URL(c.req.url)

	url.pathname = '/'
	url.search = new URLSearchParams({
		token: '<passwd>',
		domain: '<domain>',
		ipv4: '<ipaddr>',
		ipv6: '<ip6addr>',
	}).toString()

	const formatted = url.toString()

	return c.text(decodeURI(formatted))
})

app.get(
	'/',
	zValidator('query', querySchema),
	(c, next) => {
		const { token } = c.req.valid('query')

		if (token !== c.env.APP_TOKEN) {
			return c.json({ ok: false, error: 'Unauthorized' }, 403)
		}

		return next()
	},
	async (c) => {
		const params = c.req.valid('query')

		const client = new Cloudflare({
			apiToken: c.env.CLOUDFLARE_API_KEY,
		})

		// IPv4
		if (params.ipv4.length > 0) {
			await syncRecord({ client, env: c.env, params, type: 'A' })
		}

		// IPv6
		if (params.ipv6.length > 0) {
			await syncRecord({ client, env: c.env, params, type: 'AAAA' })
		}

		return c.json({ ok: true })
	},
)

export default app
