import time
import statistics
from main_optimized import find_matching_segments, initialize_services

def run_performance_test():
    """Run comprehensive performance tests."""
    
    print("🚀 SPARK AI Performance Test Suite")
    print("=" * 50)
    
    # Initialize services
    print("📋 Initializing services...")
    initialize_services()
    
    # Test queries
    test_queries = [
        "learn digital marketing",
        "start a business",
        "lose weight",
        "improve productivity",
        "get better sleep",
        "learn to code",
        "invest in stocks",
        "plan a vacation",
        "buy a house",
        "start a podcast"
    ]
    
    # Warm-up run
    print("🔥 Warming up with 3 queries...")
    for i in range(3):
        find_matching_segments(test_queries[i], 5)
    
    # Performance test
    print(f"\n⚡ Running performance test with {len(test_queries)} queries...")
    times = []
    
    for i, query in enumerate(test_queries, 1):
        print(f"Query {i}/{len(test_queries)}: '{query}'")
        
        start_time = time.time()
        results = find_matching_segments(query, 5)
        end_time = time.time()
        
        query_time = end_time - start_time
        times.append(query_time)
        
        print(f"  ⏱️  Time: {query_time:.3f}s")
        print(f"  📊 Results: {len(results)} segments found")
        if results:
            print(f"  🎯 Top score: {results[0]['score']:.4f}")
        print()
    
    # Statistics
    print("📈 Performance Statistics")
    print("=" * 30)
    print(f"Total queries: {len(times)}")
    print(f"Average time: {statistics.mean(times):.3f}s")
    print(f"Median time: {statistics.median(times):.3f}s")
    print(f"Min time: {min(times):.3f}s")
    print(f"Max time: {max(times):.3f}s")
    print(f"Standard deviation: {statistics.stdev(times):.3f}s")
    
    # Throughput calculation
    avg_time = statistics.mean(times)
    queries_per_second = 1 / avg_time
    print(f"\n🚀 Throughput: {queries_per_second:.1f} queries/second")
    
    # Production readiness assessment
    print("\n🎯 Production Readiness Assessment")
    print("=" * 40)
    
    if avg_time < 0.5:
        print("✅ Excellent! Ready for production use.")
        print("   - Sub-second response times")
        print("   - Can handle high traffic")
    elif avg_time < 1.0:
        print("✅ Good! Suitable for production with monitoring.")
        print("   - Response times under 1 second")
        print("   - Consider caching for high traffic")
    elif avg_time < 2.0:
        print("⚠️  Acceptable for production with optimizations.")
        print("   - Response times 1-2 seconds")
        print("   - Consider async processing")
    else:
        print("❌ Needs optimization before production.")
        print("   - Response times over 2 seconds")
        print("   - Consider model optimization or caching")
    
    return times

if __name__ == "__main__":
    run_performance_test() 