export class ModelError extends Error {
  constructor(category, message, options = {}) {
    super(message, options);
    this.name = 'ModelError';
    this.category = category;
    this.status = options.status ?? null;
  }
}

export function createModelClient({
  baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  model = process.env.AI_MODEL,
  apiKey = process.env.AI_API_KEY || '',
  timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000),
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof model !== 'string' || model.trim() === '') {
    throw new ModelError('configuration_error', 'AI_MODEL must name an OpenAI-compatible model.');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
    throw new ModelError('configuration_error', 'AI_REQUEST_TIMEOUT_MS must be an integer from 1,000 through 120,000.');
  }
  if (typeof fetchImpl !== 'function') {
    throw new ModelError('configuration_error', 'This Node.js runtime does not provide fetch.');
  }

  let endpoint;
  try {
    const parsedBaseUrl = new URL(baseUrl);
    if (!['https:', 'http:'].includes(parsedBaseUrl.protocol)
      || parsedBaseUrl.username || parsedBaseUrl.password
      || parsedBaseUrl.search || parsedBaseUrl.hash) {
      throw new Error('unsupported URL form');
    }
    if (apiKey && parsedBaseUrl.protocol !== 'https:' && !isLoopback(parsedBaseUrl.hostname)) {
      throw new Error('credentials require HTTPS for non-local endpoints');
    }
    endpoint = new URL(`${parsedBaseUrl.toString().replace(/\/+$/, '')}/chat/completions`);
  } catch (error) {
    throw new ModelError('configuration_error', 'AI_BASE_URL must be a valid HTTP(S) endpoint without embedded credentials or query parameters.', { cause: error });
  }

  return {
    async generate({ systemPrompt, input }) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const headers = { 'content-type': 'application/json' };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model,
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(input) },
            ],
          }),
        });

        if (!response.ok) {
          throw new ModelError(
            'provider_error',
            `AI provider returned HTTP ${response.status}.`,
            { status: response.status }
          );
        }

        let body;
        try {
          body = await response.json();
        } catch (error) {
          throw new ModelError('provider_error', 'AI provider returned an invalid response envelope.', { cause: error });
        }
        const content = body?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new ModelError('invalid_model_output', 'AI provider response did not contain text output.');
        }
        return content;
      } catch (error) {
        if (error instanceof ModelError) throw error;
        if (controller.signal.aborted) {
          throw new ModelError('provider_error', `AI provider request timed out after ${timeoutMs} ms.`, { cause: error });
        }
        throw new ModelError('provider_error', 'AI provider request failed before a response was received.', { cause: error });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function isLoopback(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}
