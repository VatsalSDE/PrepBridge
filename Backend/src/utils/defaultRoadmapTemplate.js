const getDefaultRoadmapTemplate = () => ({
  foundations: {
    dsa: {
      title: "DSA Roadmap",
      sections: [
        { name: "Arrays", topics: ["Two Pointers", "Sliding Window", "Prefix Sum", "Kadane's Algorithm"] },
        { name: "Linked Lists", topics: ["Reversal", "Fast & Slow Pointers", "Merge Lists"] },
        { name: "Trees", topics: ["BFS/DFS", "Binary Search Tree", "Tree DP"] },
        { name: "Graphs", topics: ["BFS/DFS", "Dijkstra", "Topological Sort", "Union Find"] },
        { name: "Dynamic Programming", topics: ["1D DP", "2D DP", "Knapsack", "LCS/LIS"] },
      ],
    },
    coreCS: {
      title: "Core CS Roadmap",
      sections: [
        { name: "DBMS", topics: ["SQL Basics", "Normalization", "Transactions & ACID", "Indexing"] },
        { name: "Operating Systems", topics: ["Process & Threads", "CPU Scheduling", "Memory Management", "Deadlocks"] },
        { name: "Computer Networks", topics: ["OSI Model", "TCP/UDP", "HTTP/HTTPS", "DNS"] },
        { name: "OOP", topics: ["4 Pillars", "SOLID Principles", "Design Patterns"] },
      ],
    },
    aptitude: {
      title: "Aptitude Roadmap",
      sections: [
        { name: "Quantitative", topics: ["Number System", "Percentages", "Profit & Loss", "Time & Work"] },
        { name: "Logical Reasoning", topics: ["Puzzles", "Blood Relations", "Coding-Decoding"] },
        { name: "Verbal", topics: ["Reading Comprehension", "Grammar", "Vocabulary"] },
      ],
    },
    systemDesign: {
      title: "System Design Roadmap",
      sections: [
        { name: "Basics", topics: ["Scalability", "Load Balancing", "Caching", "Database Sharding"] },
        { name: "Components", topics: ["Message Queues", "CDN", "API Gateway"] },
      ],
    },
  },
  domainRoles: [
    {
      roleId: "frontend",
      roleName: "Frontend Developer",
      skills: ["HTML/CSS", "JavaScript", "React/Vue/Angular", "State Management", "Testing"],
    },
    {
      roleId: "backend",
      roleName: "Backend Developer",
      skills: ["Node.js/Python/Java", "REST APIs", "Databases", "Authentication", "Cloud Basics"],
    },
    {
      roleId: "fullstack",
      roleName: "Fullstack Developer",
      skills: ["Frontend Framework", "Backend Framework", "Database Design", "DevOps Basics", "System Design"],
    },
  ],
});

module.exports = { getDefaultRoadmapTemplate };