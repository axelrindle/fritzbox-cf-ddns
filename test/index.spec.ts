import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/index'

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

describe('fritzbox-cf-ddns', () => {
	it('/api.txt responds with ddns template url', async () => {
		const request = new IncomingRequest('http://ddns.local/api.txt')
		const ctx = createExecutionContext()
		const response = await worker.fetch(request, env, ctx)

		await waitOnExecutionContext(ctx)

		expect(await response.text()).toMatchInlineSnapshot(
			`"http://ddns.local/?token=<passwd>&domain=<domain>&ipv4=<ipaddr>&ipv6=<ip6addr>"`,
		)
	})
})
