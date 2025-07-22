import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface SearchRequest {
  query: string;
  top_k?: number;
}

interface SearchResult {
  topic: string;
  topic_id: string;
  score: number;
  segment_id: string;
  description?: string;
  metadata?: any;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_time: number;
  embedding_time: number;
  query_time: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, top_k = 5 }: SearchRequest = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get environment variables
    const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY')
    const PINECONE_ENV = Deno.env.get('PINECONE_ENV')
    const PINECONE_INDEX = Deno.env.get('PINECONE_INDEX') || 'audiencelab-embeddings-1024'

    if (!PINECONE_API_KEY || !PINECONE_ENV) {
      return new Response(
        JSON.stringify({ error: 'Pinecone credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const startTime = Date.now()

    // Step 1: Generate embedding using OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small',
        dimensions: 1024
      })
    })

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text()
      return new Response(
        JSON.stringify({ error: `OpenAI embedding failed: ${errorText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    const embeddingTime = Date.now() - startTime

    // Step 2: Query Pinecone
    const pineconeResponse = await fetch(`https://${PINECONE_INDEX}-pqox9r2.svc.${PINECONE_ENV}.pinecone.io/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: embedding,
        topK: top_k,
        includeMetadata: true
      })
    })

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text()
      return new Response(
        JSON.stringify({ error: `Pinecone query failed: ${errorText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const pineconeData = await pineconeResponse.json()
    const totalTime = Date.now() - startTime
    const queryTime = totalTime - embeddingTime

    // Step 3: Process results
    const results: SearchResult[] = pineconeData.matches.map((match: any) => ({
      topic: match.metadata?.topic || 'Unknown',
      topic_id: match.metadata?.topic_ID || 'Unknown',
      score: match.score,
      segment_id: match.id,
      description: match.metadata?.description,
      metadata: match.metadata
    }))

    const response: SearchResponse = {
      results,
      query,
      total_time: totalTime / 1000, // Convert to seconds
      embedding_time: embeddingTime / 1000,
      query_time: queryTime / 1000
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 