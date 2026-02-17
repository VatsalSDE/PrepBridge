// Mock data for companies and alumni insights

export const CITIES = [
  'All Cities',
  'Bangalore',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Chennai',
  'Delhi NCR',
  'Pan India'
];

export const INDUSTRIES = [
  'Technology',
  'E-Commerce',
  'IT Services',
  'Finance',
  'Consulting'
];

export const COMPANIES = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    city: 'Bangalore',
    industry: 'Technology',
    websiteUrl: 'https://careers.google.com',
    jd: `Software Engineer L3
Location: Bangalore, India

Responsibilities:
- Design, develop, test, deploy, maintain, and improve software
- Manage individual project priorities, deadlines and deliverables
- Participate in code reviews and design discussions

Requirements:
- Bachelor's degree in Computer Science or related technical field
- 1-3 years of software development experience
- Experience with one or more general purpose programming languages (Java, C++, Python, Go)
- Strong understanding of data structures and algorithms
- Experience with distributed systems and microservices
- Knowledge of SQL and NoSQL databases
- Understanding of system design principles

Preferred:
- Master's degree in Computer Science
- Experience with cloud platforms (GCP preferred)
- Contributions to open source projects`,
    interviewPattern: 'DSA-heavy',
    focusDistribution: { dsa: 45, coreCS: 20, systemDesign: 25, hr: 10 },
    alumniInsights: [
      'Expect 5-6 rounds including phone screen, onsite coding, and system design',
      'DSA questions are typically LeetCode medium to hard difficulty',
      'Focus heavily on time complexity analysis - they expect optimal solutions',
      'System design round focuses on scalability and Google-scale problems',
      'Behavioral questions use STAR format extensively',
      'Googliness round assesses cultural fit and collaboration skills'
    ],
    guidelines: [
      'Master graph algorithms, dynamic programming, and sliding window techniques',
      'Practice explaining your thought process while coding',
      'Study Google-specific system design case studies (YouTube, Maps, Search)',
      'Prepare 5-6 strong STAR stories from past experiences',
      'Review distributed systems concepts: CAP theorem, consensus algorithms',
      'Practice coding in a shared document without IDE autocomplete'
    ],
    approved: true,
    rawAlumniInput: ''
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '🪟',
    city: 'Hyderabad',
    industry: 'Technology',
    websiteUrl: 'https://careers.microsoft.com',
    jd: `Software Development Engineer
Location: Hyderabad, India

About the Role:
Join Microsoft's engineering team to build impactful software at scale.

Responsibilities:
- Write clean, maintainable, and well-tested code
- Collaborate with cross-functional teams
- Participate in architecture and design discussions
- Mentor junior developers

Qualifications:
- Bachelor's degree in CS/IT or equivalent
- 0-3 years of experience
- Proficiency in C++, C#, or Java
- Strong foundation in data structures and algorithms
- Experience with object-oriented design patterns
- Familiarity with Agile methodologies
- Understanding of version control systems

Preferred:
- Experience with Azure or cloud technologies
- Knowledge of .NET framework
- Experience with CI/CD pipelines`,
    interviewPattern: 'Tech-heavy',
    focusDistribution: { dsa: 35, coreCS: 30, systemDesign: 20, hr: 15 },
    alumniInsights: [
      '4-5 rounds including online assessment, technical screens, and onsite',
      'Strong focus on object-oriented design and design patterns',
      'LeetCode medium problems are standard, occasionally hard',
      'Low-level design questions are common (design a parking lot, etc.)',
      'Emphasis on clean code principles and SOLID patterns',
      'Behavioral round focuses on growth mindset and learning ability'
    ],
    guidelines: [
      'Practice OOP design problems - LLD is crucial',
      'Review SOLID principles and be ready to apply them',
      'Study common design patterns: Factory, Observer, Strategy, Singleton',
      'Prepare for system design at moderate scale',
      'Practice coding in C++ or C# if applying for relevant teams',
      'Prepare examples showing your growth mindset and adaptability'
    ],
    approved: true,
    rawAlumniInput: ''
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    city: 'Bangalore',
    industry: 'E-Commerce',
    jd: `SDE-1 (Software Development Engineer)
Location: Bangalore, India

About Amazon:
Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.

Basic Qualifications:
- Bachelor's degree in Computer Science or equivalent
- 0-2 years of experience in software development
- Proficiency in at least one programming language (Java, Python, C++)
- Knowledge of data structures, algorithms, and complexity analysis
- Experience with object-oriented design
- Familiarity with SQL databases

Preferred Qualifications:
- Experience with distributed computing
- Knowledge of AWS services
- Understanding of scalable system design
- Experience with microservices architecture`,
    interviewPattern: 'DSA-heavy',
    focusDistribution: { dsa: 40, coreCS: 15, systemDesign: 20, hr: 25 },
    alumniInsights: [
      '4-5 rounds with heavy emphasis on Leadership Principles',
      'Every answer should tie back to Amazon Leadership Principles',
      'DSA is standard LeetCode medium, focus on optimal solutions',
      'System design focuses on scalability and fault tolerance',
      'Expect deep-dive questions on your resume projects',
      'Bar raiser round can happen - be prepared for tough questions'
    ],
    guidelines: [
      'Memorize all 16 Amazon Leadership Principles with examples',
      'Prepare 2-3 stories for each Leadership Principle',
      'Practice explaining your resume projects in depth',
      'Focus on array, string, and tree problems in DSA prep',
      'Study AWS services basics: EC2, S3, DynamoDB, Lambda',
      'Practice the STAR method for behavioral questions'
    ],
    approved: true,
    rawAlumniInput: ''
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: '🛒',
    city: 'Bangalore',
    industry: 'E-Commerce',
    jd: `SDE-1 (Software Development Engineer)
Location: Bangalore, India

About Flipkart:
India's leading e-commerce marketplace.

Requirements:
- B.Tech/M.Tech in Computer Science or related field
- Strong coding skills in Java or Python
- Solid understanding of data structures and algorithms
- Knowledge of databases and SQL
- Understanding of web technologies
- Good problem-solving abilities

Nice to Have:
- Experience with distributed systems
- Knowledge of Kafka, Redis
- Understanding of microservices
- Experience with system design`,
    interviewPattern: 'Tech-heavy',
    focusDistribution: { dsa: 35, coreCS: 25, systemDesign: 30, hr: 10 },
    alumniInsights: [
      '3-4 rounds including machine coding round',
      'Machine coding round is unique - 90 minutes to build a working system',
      'LLD (Low Level Design) is very important',
      'DSA is LeetCode easy to medium difficulty',
      'Expect real-world scenarios in system design',
      'Focus on e-commerce specific problems in design rounds'
    ],
    guidelines: [
      'Practice machine coding - build mini projects in 90 minutes',
      'Master LLD concepts: class diagrams, interfaces, design patterns',
      'Study e-commerce system design: cart, inventory, payments',
      'Practice clean code principles and SOLID patterns',
      'Review Java collections and multithreading concepts',
      'Prepare for questions on handling scale (millions of users)'
    ],
    approved: true,
    rawAlumniInput: ''
  },
  {
    id: 'tcs',
    name: 'TCS Digital',
    logo: '💼',
    city: 'Pan India',
    industry: 'IT Services',
    jd: `Digital Developer
Location: Pan India

Eligibility:
- B.E./B.Tech/M.E./M.Tech in any stream
- 60% or above in academics
- No backlogs at the time of joining

Role Requirements:
- Strong aptitude and logical reasoning
- Basic programming knowledge (any language)
- Understanding of data structures basics
- Communication skills
- Willingness to learn and adapt

Preferred Skills:
- Knowledge of DBMS
- Web development basics
- Understanding of SDLC`,
    interviewPattern: 'HR-heavy',
    focusDistribution: { dsa: 20, coreCS: 25, systemDesign: 10, hr: 45 },
    alumniInsights: [
      'National Qualifier Test (NQT) is the first round',
      'Focus on aptitude, verbal, and programming MCQs',
      'Interview rounds focus heavily on communication',
      'Basic DSA questions - arrays, strings, patterns',
      'HR round assesses adaptability and willingness to relocate',
      'Expect questions about TCS values and company culture'
    ],
    guidelines: [
      'Practice aptitude: quant, logical reasoning, verbal',
      'Learn basic programming patterns and outputs',
      'Study DBMS fundamentals: normalization, SQL queries',
      'Prepare for HR questions: Why TCS? Strengths/weaknesses?',
      'Be ready to discuss your academic projects in detail',
      'Research TCS services and recent initiatives'
    ],
    approved: true,
    rawAlumniInput: ''
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: '🏢',
    city: 'Bangalore',
    industry: 'IT Services',
    jd: `Systems Engineer
Location: Mysore/Bangalore, India

Requirements:
- B.E./B.Tech/M.E./M.Tech in any stream
- 65% or above throughout academics
- Good communication skills
- Basic programming knowledge

Skills:
- Problem-solving aptitude
- Any programming language
- Basic understanding of databases
- Team collaboration skills`,
    interviewPattern: 'HR-heavy',
    focusDistribution: { dsa: 15, coreCS: 30, systemDesign: 5, hr: 50 },
    alumniInsights: [
      'Online assessment includes aptitude, reasoning, and pseudocode',
      'Technical interview is basic - CS fundamentals only',
      'HR round is crucial - assess communication and attitude',
      'Questions about Infosys Springboard and certifications help',
      'Expect situational questions about handling pressure',
      'Group discussion may be part of the selection process'
    ],
    guidelines: [
      'Complete Infosys Springboard courses for bonus points',
      'Focus on aptitude and verbal ability preparation',
      'Review CS basics: OOPS, DBMS, OS, Networks',
      'Practice English communication and presentation skills',
      'Prepare for group discussions on current affairs topics',
      'Research Infosys values, recent projects, and leadership'
    ],
    approved: true,
    rawAlumniInput: ''
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: '💳',
    city: 'Bangalore',
    industry: 'Finance',
    jd: `Software Engineer
Location: Bangalore, India

About Razorpay:
India's leading full-stack financial solutions company.

Requirements:
- B.Tech/M.Tech in CS or related field
- Strong programming skills in any language
- Understanding of data structures and algorithms
- Knowledge of databases and SQL
- Familiarity with web technologies

Preferred:
- Experience with payment systems
- Knowledge of fintech domain
- Understanding of microservices`,
    interviewPattern: 'Tech-heavy',
    focusDistribution: { dsa: 30, coreCS: 25, systemDesign: 35, hr: 10 },
    alumniInsights: [],
    guidelines: [],
    approved: false,
    rawAlumniInput: ''
  }
];

export const DEFAULT_RESUME_SKILLS = [
  'Java', 'Python', 'JavaScript', 'React', 'Node.js',
  'SQL', 'MongoDB', 'Git', 'Data Structures', 'Algorithms',
  'HTML', 'CSS', 'REST APIs', 'Problem Solving', 'Communication'
];

export const SKILL_KEYWORDS = {
  dsa: ['data structures', 'algorithms', 'leetcode', 'complexity', 'arrays', 'trees', 'graphs', 'dynamic programming', 'sorting', 'searching'],
  coreCS: ['operating systems', 'dbms', 'networking', 'oops', 'sql', 'nosql', 'databases', 'os', 'computer networks'],
  systemDesign: ['system design', 'scalability', 'distributed', 'microservices', 'architecture', 'caching', 'load balancing', 'api design'],
  web: ['react', 'angular', 'vue', 'node', 'javascript', 'typescript', 'html', 'css', 'web', 'frontend', 'backend'],
  cloud: ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'devops', 'ci/cd'],
  languages: ['java', 'python', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift']
};

// Simulated guideline generation from raw alumni input
export const generateGuidelinesFromInput = (rawInput) => {
  // This would be AI-powered in production
  const lines = rawInput.split('\n').filter(line => line.trim());
  const generatedGuidelines = {
    rounds: 'Multiple rounds including technical and HR',
    focusAreas: ['DSA', 'Core CS', 'System Design'],
    commonTopics: ['Arrays', 'Strings', 'Trees', 'Graphs', 'OOP'],
    difficulty: 'Medium to Hard',
    tips: [
      'Focus on problem-solving approach over memorization',
      'Practice explaining your thought process clearly',
      'Review company-specific preparation materials',
      'Prepare behavioral stories using STAR method',
      'Research company culture and recent developments',
      'Practice mock interviews with peers',
      'Focus on time management during coding rounds'
    ]
  };
  return generatedGuidelines;
};