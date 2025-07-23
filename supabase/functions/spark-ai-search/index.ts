import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://trapevyvbakrzhmqnvdm.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXBldnl2YmFrcnpobXFudmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM0NTYsImV4cCI6MjA2ODY2OTQ1Nn0.2bmquNWzujFRcopi_nYigXPD2ybxZ-eObUk3SLtc4s8'
const supabase = createClient(supabaseUrl, supabaseKey)

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
    const results: SearchResult[] = await Promise.all(pineconeData.matches.map(async (match: any) => {
      const topic = match.metadata?.topic || 'Unknown';
      
      // Try to get description from Supabase database with improved matching
      let description = 'No description available';
      try {
        // First try exact case-insensitive match
        let { data: descData, error } = await supabase
          .from('audience_descriptions')
          .select('topic_description')
          .ilike('topic', topic)
          .limit(1)
          .single();
        
        // If no exact match, try partial matching
        if (error || !descData) {
          const { data: partialData, error: partialError } = await supabase
            .from('audience_descriptions')
            .select('topic_description')
            .ilike('topic', `%${topic}%`)
            .limit(1)
            .single();
          
          if (!partialError && partialData) {
            descData = partialData;
          }
        }
        
        // If still no match, try matching without special characters
        if (!descData) {
          const cleanTopic = topic.replace(/[^a-zA-Z0-9\s]/g, '').trim();
          if (cleanTopic && cleanTopic !== topic) {
            const { data: cleanData, error: cleanError } = await supabase
              .from('audience_descriptions')
              .select('topic_description')
              .ilike('topic', `%${cleanTopic}%`)
              .limit(1)
              .single();
            
            if (!cleanError && cleanData) {
              descData = cleanData;
            }
          }
        }
        
        if (descData) {
          description = descData.topic_description;
        }
      } catch (e) {
        console.log(`No description found for topic: ${topic}`);
      }
      
      return {
        topic: topic,
        topic_id: match.metadata?.topic_ID || 'Unknown',
        score: match.score,
        segment_id: match.id,
        description: description,
        metadata: match.metadata
      };
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