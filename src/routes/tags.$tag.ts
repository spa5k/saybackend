import { createFileRoute } from '@tanstack/react-router'

/**
 * Tag archives were retired. Production traffic is intercepted by the edge
 * worker (src/worker.ts), which redirects mapped tags to topic hubs and
 * returns 410 for the rest. This route mirrors that behavior for direct
 * SSR requests (dev server, previews).
 */
export const Route = createFileRoute('/tags/$tag')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const tag = decodeURIComponent(params.tag).toLowerCase()
        const topicMap: Record<string, string> = {
          kafka: 'kafka-streaming',
          'apache-kafka': 'kafka-streaming',
          'kafka-with-docker': 'kafka-streaming',
          'kafka-local-cluster': 'kafka-streaming',
          'kafka-local-setup': 'kafka-streaming',
          'local-kafka-setup': 'kafka-streaming',
          'kafka-kraft-cluster': 'kafka-streaming',
          'kafka-without-zookeeper': 'kafka-streaming',
          'kafka-broker-setup': 'kafka-streaming',
          'message-queue': 'kafka-streaming',
          docker: 'docker-deployment',
          'docker-compose': 'docker-deployment',
          devops: 'docker-deployment',
          deployment: 'docker-deployment',
          production: 'docker-deployment',
          'local-development': 'docker-deployment',
          golang: 'go-backend',
          go: 'go-backend',
          gin: 'go-backend',
          zap: 'go-backend',
          slog: 'go-backend',
          logging: 'go-backend',
          'structured-logging': 'go-backend',
          'production-logging': 'go-backend',
          'log-sampling': 'go-backend',
          'contextual-logging': 'go-backend',
          'wide-events': 'go-backend',
          postgres: 'postgresql',
          postgresql: 'postgresql',
          database: 'postgresql',
          uuid: 'postgresql',
          uuidv7: 'postgresql',
          pgrx: 'postgresql',
          nextjs: 'nextjs',
          'next.js': 'nextjs',
          ssr: 'nextjs',
          rsc: 'nextjs',
          electron: 'nextjs',
          react: 'nextjs',
          vercel: 'nextjs',
          rag: 'ai-rag',
          ai: 'ai-rag',
          chunking: 'ai-rag',
          'rag-chunking-strategies': 'ai-rag',
          'text-preprocessing': 'ai-rag',
          embeddings: 'ai-rag',
          'semantic-search': 'ai-rag',
          llm: 'ai-rag',
          anthropic: 'ai-rag',
          'ai-research': 'ai-rag',
        }
        const topic = topicMap[tag]
        if (topic) {
          return Response.redirect(
            new URL(`/topics/${topic}/`, request.url).href,
            301,
          )
        }
        return new Response(
          'This tag archive was retired. Browse topics instead: /topics/',
          {
            status: 410,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Robots-Tag': 'noindex, follow',
            },
          },
        )
      },
    },
  },
})
