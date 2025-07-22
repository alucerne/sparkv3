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

    // Step 1: Generate embedding using BAAI/bge-large-en-v1.5
    const BGE_API_URL = 'https://api-inference.huggingface.co/models/BAAI/bge-large-en-v1.5'
    const HF_TOKEN = Deno.env.get('HF_TOKEN') // Hugging Face token for BGE model
    
    if (!HF_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face token not configured for BGE model' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format query for BGE model (add "Query:" prefix for asymmetric search)
    const formattedQuery = `Query: ${query}`

    const embeddingResponse = await fetch(BGE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formattedQuery,
        normalize: true
      })
    })

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text()
      return new Response(
        JSON.stringify({ error: `BGE embedding failed: ${errorText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const embeddingData = await embeddingResponse.json()
    
    // Hugging Face API returns the embedding as a JSON array
    let embedding = embeddingData
    
    // If it's an array of arrays, take the first element
    if (Array.isArray(embedding) && embedding.length > 0 && Array.isArray(embedding[0])) {
      embedding = embedding[0]
    }
    
    // Ensure we have a proper 1024-dimensional vector
    if (!Array.isArray(embedding) || embedding.length !== 1024) {
      return new Response(
        JSON.stringify({ error: `Invalid embedding dimensions: ${embedding?.length}, expected 1024` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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
    const results: SearchResult[] = pineconeData.matches.map((match: any) => {
      const topic = match.metadata?.topic || 'Unknown';
      const description = match.metadata?.description || generateDescription(topic);
      
      return {
        topic: topic,
        topic_id: match.metadata?.topic_ID || 'Unknown',
        score: match.score,
        segment_id: match.id,
        description: description,
        metadata: match.metadata
      };
    })

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

// Helper function to generate descriptions for topics
function generateDescription(topic: string): string {
  const descriptions: { [key: string]: string } = {
    'TikTok Advertising': 'Audience segments interested in TikTok advertising and marketing campaigns',
    'TikTok Marketing': 'Users engaged with TikTok marketing strategies and content creation',
    'TikTok For Business': 'Business professionals using TikTok for brand promotion and customer engagement',
    'TikTok Shop': 'Consumers and businesses active in TikTok e-commerce and shopping features',
    'TikTok': 'General TikTok users and content creators across various niches',
    'Social Media Marketing': 'Professionals and businesses focused on social media marketing strategies',
    'Digital Advertising': 'Audience interested in digital advertising platforms and campaigns',
    'Content Creation': 'Creators and professionals involved in digital content production',
    'E-commerce': 'Online retailers and consumers engaged in e-commerce activities',
    'Influencer Marketing': 'Brands and influencers involved in influencer marketing campaigns'
  };
  
  return descriptions[topic] || `Audience segment focused on ${topic.toLowerCase()} and related activities`;
} 