"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, Search, Check } from "lucide-react"
import { AudienceCard } from "@/components/ui/audience-card"
import axios from 'axios'

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  results?: SearchResult[]
  type: "spark" | "claude" | "general"
  generatedQueries?: string[]
  pendingQueries?: boolean
  audienceDescriptions?: { [segmentId: string]: string }
  awaitingConfirmation?: boolean
  selectedQuery?: string
}

interface SearchResult {
  topic: string
  topic_id: string
  score: number
  segment_id: string
  method: string
}

interface SearchResponse {
  results: SearchResult[]
  query: string
  total_time: number
  embedding_time: number
  query_time: number
}

interface ClaudeResponse {
  text: string
}

export function Chat() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm SPARK AI + OpenAI. I can help you find audience segments through natural conversation: First, I'll ask you a few questions one at a time to understand your needs, then generate optimized search queries that you can click to execute. Try asking me something like 'learn digital marketing' or 'start a business' for audience segments, or ask OpenAI anything else!",
      role: "assistant",
      timestamp: new Date(),
      type: "general"
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to detect if the query is for audience segments
  const isAudienceSegmentQuery = (query: string): boolean => {
    const audienceKeywords = [
      'audience', 'segment', 'marketing', 'business', 'learn', 'start', 'improve',
      'digital', 'social', 'content', 'seo', 'ads', 'email', 'brand', 'product',
      'service', 'customer', 'target', 'demographic', 'niche', 'market'
    ]
    
    const queryLower = query.toLowerCase()
    return audienceKeywords.some(keyword => queryLower.includes(keyword))
  }

  // Function to extract queries from Claude's response
  const extractQueries = (text: string): string[] => {
    // Match multiple query formats:
    // 1. "**Query:** "small business owners in e-commerce..."
    // 2. "Query: homeowners actively searching..."
    // 3. Query: homeowners actively searching...
    // 4. 1. "Query: homeowners actively searching..."
    const queryRegex = /(?:^\d+\.\s*)?(?:\*\*Query:\*\*\s*["']([^"']+)["']|["']?Query:\s*([^"'\n]+)["']?|"Query:\s*([^"]+)")/gm
    const queries: string[] = []
    let match
    
    while ((match = queryRegex.exec(text)) !== null) {
      // Use the first non-null group
      const query = match[1] || match[2] || match[3]
      if (query && query.trim()) {
        queries.push(query.trim())
      }
    }
    
    // If no queries found with the main regex, try a simpler approach
    if (queries.length === 0) {
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.includes('Query:') || line.includes('**Query:**')) {
          // Try different patterns
          const patterns = [
            /\*\*Query:\*\*\s*["']([^"']+)["']/,  // **Query:** "text"
            /Query:\s*["']([^"']+)["']/,          // Query: "text"
            /Query:\s*(.+)/                       // Query: text
          ]
          
          for (const pattern of patterns) {
            const queryMatch = line.match(pattern)
            if (queryMatch) {
              queries.push(queryMatch[1].trim().replace(/^["']|["']$/g, ''))
              break
            }
          }
        }
      }
    }
    
    console.log('Extracted queries from text:', queries)
    return queries
  }

  // Function to execute search for a specific query
  const executeSearch = async (query: string, messageId: string) => {
    // CRITICAL: This function should NEVER send search results to the AI
    // All topic names must remain exactly as returned from the backend
    // No AI processing, no description generation, no topic name alterations
    try {
      console.log('Executing search for query:', query)
      
      const response = await axios.post<SearchResponse>('http://localhost:8000/search', {
        query: query,
        top_k: 5
      })

      console.log('Search response:', response.data)
      console.log('Raw topic names from backend:', response.data.results.map(r => r.topic))

      if (response.data.results.length > 0) {
        // Generate simple, predictable descriptions without sending topic names to AI
        const descriptions: { [segmentId: string]: string } = {}
        response.data.results.forEach((result) => {
          // Create simple description based on the exact topic name
          descriptions[result.segment_id] = `People interested in ${result.topic}`
          console.log(`Created description for ${result.segment_id}: "${result.topic}" -> "People interested in ${result.topic}"`)
        })

        const resultsText = `Found ${response.data.results.length} audience segments for "${query}":\n\n${response.data.results.map((result, index) => 
          `${index + 1}. **${result.topic}** (Score: ${result.score.toFixed(3)})\n   Segment ID: ${result.segment_id}\n   Method: ${result.method}\n`
        ).join('\n')}`

        console.log('Final results text:', resultsText)

        const searchMessage: Message = {
          id: Date.now().toString(),
          content: resultsText,
          role: "assistant",
          timestamp: new Date(),
          results: response.data.results,
          type: "spark",
          audienceDescriptions: descriptions
        }

        console.log('Created search message with results:', searchMessage.results?.map(r => r.topic))
        setMessages((prev) => [...prev, searchMessage])
      } else {
        const resultsText = `No audience segments found for "${query}". Try a different search term.`
        const searchMessage: Message = {
          id: Date.now().toString(),
          content: resultsText,
          role: "assistant",
          timestamp: new Date(),
          type: "spark"
        }
        setMessages((prev) => [...prev, searchMessage])
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Sorry, I couldn't search for "${query}". Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the SPARK AI backend is running on port 8000.`,
        role: "assistant",
        timestamp: new Date(),
        type: "general"
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
      type: "general"
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Check if this is a confirmation response
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.awaitingConfirmation && lastMessage?.generatedQueries) {
      // Handle query selection
      const queryIndex = parseInt(input.trim()) - 1
      if (queryIndex >= 0 && queryIndex < lastMessage.generatedQueries.length) {
        const selectedQuery = lastMessage.generatedQueries[queryIndex]
        
        const confirmationMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `You selected: "${selectedQuery}"\n\nAre you sure you want to search with this query? Type 'yes' to confirm or 'no' to cancel.`,
          role: "assistant",
          timestamp: new Date(),
          type: "general",
          selectedQuery: selectedQuery
        }
        
        setMessages((prev) => [...prev, confirmationMessage])
        setIsLoading(false)
        return
      }
    }

    // Check if this is a final confirmation
    const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop()
    if (lastAssistantMessage?.selectedQuery) {
      if (input.trim().toLowerCase() === 'yes') {
        // Execute the search
        await executeSearch(lastAssistantMessage.selectedQuery, lastAssistantMessage.id)
        setIsLoading(false)
        return
      } else if (input.trim().toLowerCase() === 'no') {
        const cancelMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Search cancelled. You can try a different query or ask something else.",
          role: "assistant",
          timestamp: new Date(),
          type: "general"
        }
        setMessages((prev) => [...prev, cancelMessage])
        setIsLoading(false)
        return
      }
    }

    try {
      // Determine if this is an audience segment query or general chat
      if (isAudienceSegmentQuery(input.trim())) {
        // Build conversation history for Claude
        const conversationHistory = messages
          .filter(msg => msg.role === "user" || msg.role === "assistant")
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }))

        // Use OpenAI to generate optimized queries first
        const openaiResponse = await axios.post<ClaudeResponse>('/api/openai', {
          prompt: input.trim(),
          conversationHistory: conversationHistory
        })

        const queries = extractQueries(openaiResponse.data.text)
        console.log('Extracted queries:', queries)
        console.log('OpenAI response text:', openaiResponse.data.text)
        const hasQueries = queries.length > 0

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: openaiResponse.data.text,
          role: "assistant",
          timestamp: new Date(),
          type: "claude",
          generatedQueries: hasQueries ? queries : undefined,
          pendingQueries: hasQueries,
          awaitingConfirmation: hasQueries
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        // Build conversation history for Claude
        const conversationHistory = messages
          .filter(msg => msg.role === "user" || msg.role === "assistant")
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }))

        // Use OpenAI for general conversation
        const openaiResponse = await axios.post<ClaudeResponse>('/api/openai', {
          prompt: input.trim(),
          conversationHistory: conversationHistory
        })

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: openaiResponse.data.text,
          role: "assistant",
          timestamp: new Date(),
          type: "claude"
        }

        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "Sorry, I couldn't process your request right now. Please try again.";
      
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 503) {
          errorMessage = "OpenAI API is temporarily overloaded. Please try again in a few moments.";
        } else if (error.response?.status === 401) {
          errorMessage = "OpenAI API key is invalid or missing. Please check your configuration.";
        } else if (error.response?.status === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: "assistant",
        timestamp: new Date(),
        type: "general"
      }
      setMessages((prev) => [...prev, errorMessageObj])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageIcon = (message: Message) => {
    if (message.role === "user") {
      return <User className="h-4 w-4 text-gray-600" />
    }
    
    switch (message.type) {
      case "spark":
        return <Sparkles className="h-4 w-4 text-blue-600" />
      case "claude":
        return <Bot className="h-4 w-4 text-purple-600" />
      default:
        return <Bot className="h-4 w-4 text-blue-600" />
    }
  }

  const getMessageBadge = (message: Message) => {
    if (message.role === "user") return null
    
    switch (message.type) {
      case "spark":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">SPARK AI</span>
      case "claude":
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">OpenAI</span>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 p-4 border-b">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="font-semibold">SPARK AI + OpenAI Chat</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  message.type === "spark" ? "bg-blue-100" : 
                  message.type === "claude" ? "bg-purple-100" : "bg-gray-100"
                }`}>
                  {getMessageIcon(message)}
                </div>
              )}
              
              <div
                className={`flex max-w-[80%] flex-col gap-2 ${
                  message.role === "user"
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {/* Only show content if there are no results to display as cards */}
                  {(!message.results || message.results.length === 0) && message.content}
                </div>
                
                {getMessageBadge(message)}
                
                {/* Generated Queries Section */}
                {message.generatedQueries && message.generatedQueries.length > 0 && (
                  <div className="w-full space-y-2">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Generated Search Queries - Please select one by typing the number:
                    </div>
                    {message.generatedQueries.map((query, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-900">
                              {query}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-gray-600 mt-2">
                      Type the number (1-{message.generatedQueries.length}) to select a query.
                    </div>
                  </div>
                )}
                
                {message.results && message.results.length > 0 && (
                  <div className="w-full space-y-3">
                    <div className="text-sm text-gray-600 mb-2">
                      Found {message.results.length} audience segments for your search
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      📋 Audience Suggestions
                    </div>
                    {message.results.map((result, index) => (
                      <AudienceCard
                        key={result.segment_id}
                        topic={result.topic}
                        topic_id={result.topic_id}
                        score={result.score}
                        segment_id={result.segment_id}
                        method={result.method}
                        audienceDescription={message.audienceDescriptions?.[result.segment_id]}
                      />
                    ))}
                  </div>
                )}
                
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              {message.role === "user" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex max-w-[80%] flex-col gap-2 items-start">
                <div className="rounded-lg px-4 py-2 text-sm bg-gray-100 text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    Generating optimized queries with OpenAI...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about audience segments or chat with OpenAI..."
            disabled={isLoading}
            className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
} 