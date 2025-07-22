import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check if environment variables are configured
    const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY')
    const PINECONE_ENV = Deno.env.get('PINECONE_ENV')
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'SPARK AI Edge Function',
      version: '1.0.0',
      environment: {
        pinecone_configured: !!PINECONE_API_KEY && !!PINECONE_ENV,
        openai_configured: !!OPENAI_API_KEY,
        pinecone_env: PINECONE_ENV || 'not_set',
        pinecone_index: Deno.env.get('PINECONE_INDEX') || 'audiencelab-embeddings-1024'
      },
      endpoints: {
        search: '/spark-ai-search',
        health: '/spark-ai-health'
      }
    }

    return new Response(
      JSON.stringify(healthStatus, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: `Health check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 