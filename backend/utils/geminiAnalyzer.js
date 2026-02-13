import { GoogleGenerativeAI } from "@google/generative-ai";

// Models to try in order (only working models from your API)
const GEMINI_MODELS = [
  "gemini-flash-latest",       // Alias with fresh quota pool
  "gemini-pro-latest",         // Alias with separate quota pool
  "gemini-2.0-flash",          // Fast, likely has quota
  "gemini-2.5-flash",          // Your original model
  "gemini-2.5-pro"             // More powerful, separate quota
];

// Helper function to try multiple models with timeout
async function tryMultipleModels(genAI, prompt, operation = "generation") {
  let lastError = null;
  
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`🤖 Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Create promise with 15 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const generatePromise = model.generateContent(prompt);
      
      // Race between generation and timeout
      const result = await Promise.race([generatePromise, timeoutPromise]);
      
      console.log(`✅ Success with ${modelName}`);
      return result;
    } catch (error) {
      lastError = error;
      const errorMsg = error.message.substring(0, 80);
      console.log(`⚠️ ${modelName} failed: ${errorMsg}`);
      
      // If it's a quota error, try next model immediately
      if (error.message.includes("429") || error.message.includes("quota")) {
        console.log(`   → Quota exceeded, trying next model...`);
        continue;
      }
      
      // If timeout, try next model
      if (error.message.includes("timeout")) {
        console.log(`   → Timeout, trying next model...`);
        continue;
      }
      
      // For other errors, try next model
      continue;
    }
  }
  
  // All models failed
  console.error(`❌ All models exhausted. Last error: ${lastError?.message}`);
  throw new Error(`All models failed. Last error: ${lastError?.message || "Unknown error"}`);
}

export const analyzeResume = async (resumeText) => {
  // Read API key inside the function, not at module load time
  const apiKey = process.env.GEMINI_API_KEY;

  // Debug: Check if API key is loaded
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in .env file!");
    console.log("⚠️ Using fallback skill extraction...");
    return extractSkillsFallback(resumeText);
  } else {
    console.log("✅ Gemini API Key loaded:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {

const prompt = `
Analyze the following resume text and extract ONLY technical skills that are explicitly mentioned.

CRITICAL RULES:
- Extract ONLY technologies, programming languages, frameworks, and tools that are EXPLICITLY mentioned
- Do NOT infer or guess skills
- Do NOT add generic skills
- Return empty arrays if nothing found

Return STRICT JSON format (no markdown, no extra text):

{
 "skills": [],
 "strengths": [],
 "weaknesses": [],
 "suggested_roles": [],
 "score": 0
}

Resume Text:
${resumeText}
`;

    console.log("🤖 Analyzing resume with Gemini (trying multiple models)...");
    const result = await tryMultipleModels(genAI, prompt, "resume analysis");
    const raw = result.response.text();
    
    console.log("📥 Gemini response received");

    // Extract JSON safely
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid AI response - no JSON found");
    }

    const jsonString = raw.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);
    
    console.log("✅ Gemini analysis successful");
    return parsed;
  
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    
    // Fallback: Extract skills using basic text matching
    console.log("⚠️ Using fallback skill extraction...");
    return extractSkillsFallback(resumeText);
  }
};

// Fallback function to extract skills without AI
function extractSkillsFallback(text) {
  const techSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'c ', 'react', 'angular', 'vue',
    'node', 'express', 'django', 'flask', 'spring', 'mongodb', 'mysql',
    'postgresql', 'sql', 'html', 'css', 'typescript', 'git', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'rest', 'api', 'graphql',
    'redis', 'firebase', 'nextjs', 'nuxt', 'tailwind', 'bootstrap',
    'machine learning', 'ml', 'ai', 'data science', 'tensorflow', 'pytorch',
    'pandas', 'numpy', 'scikit-learn', 'deep learning', 'nlp',
    'backend', 'frontend', 'fullstack', 'full stack', 'devops',
    'linux', 'bash', 'shell', 'ci/cd', 'jenkins', 'github actions',
    'reactjs', 'nodejs', 'vuejs', 'angularjs', 'jquery', 'webpack',
    'sass', 'scss', 'less', 'redux', 'flutter', 'dart', 'kotlin',
    'swift', 'go', 'rust', 'php', 'ruby', 'scala', 'r programming'
  ];
  
  const textLower = text.toLowerCase();
  
  // More strict matching - whole word boundaries
  const foundSkills = techSkills.filter(skill => {
    // Use word boundaries to avoid false matches
    const regex = new RegExp(`\\b${skill.replace(/\+/g, '\\+')}\\b`, 'i');
    return regex.test(textLower);
  });
  
  // Remove duplicates and capitalize
  const uniqueSkills = [...new Set(foundSkills)].map(skill => 
    skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  
  // Calculate more realistic score
  const skillCount = uniqueSkills.length;
  let score = 0;
  
  if (skillCount === 0) {
    score = 20; // Very low score for no technical skills
  } else if (skillCount <= 3) {
    score = 30 + (skillCount * 5); // 35-45 for 1-3 skills
  } else if (skillCount <= 6) {
    score = 45 + (skillCount * 5); // 50-75 for 4-6 skills
  } else if (skillCount <= 10) {
    score = 55 + (skillCount * 3); // 58-85 for 7-10 skills
  } else {
    score = Math.min(70 + (skillCount * 2), 95); // 72-95 for 11+ skills
  }
  
  // Check for projects, experience, education mentions
  const hasProjects = /project/i.test(text);
  const hasExperience = /experience|worked|internship|job/i.test(text);
  const hasEducation = /education|degree|university|college|b\.tech|b\.e\.|bachelor|master/i.test(text);
  
  // Adjust score based on resume completeness
  if (!hasExperience && !hasProjects) {
    score = Math.max(score - 15, 15); // Penalize heavily for no experience or projects
  }
  if (!hasEducation) {
    score = Math.max(score - 5, 15);
  }
  
  // Build response
  const strengths = [];
  const weaknesses = [];
  
  if (skillCount > 0) {
    strengths.push(`${skillCount} technical skill${skillCount > 1 ? 's' : ''} identified`);
  }
  if (hasProjects) {
    strengths.push('Has project experience');
  }
  if (hasExperience) {
    strengths.push('Has work experience');
  }
  
  if (skillCount === 0) {
    weaknesses.push('No technical skills mentioned in resume');
    weaknesses.push('Add programming languages and technologies');
  } else if (skillCount < 4) {
    weaknesses.push('Limited technical skills - add more relevant technologies');
  }
  
  if (!hasProjects) {
    weaknesses.push('No projects mentioned - add personal or academic projects');
  }
  if (!hasExperience) {
    weaknesses.push('No work experience listed - consider internships or freelance work');
  }
  if (text.length < 300) {
    weaknesses.push('Resume is too short - add more details');
  }
  
  // Default messages if empty
  if (strengths.length === 0) {
    strengths.push('Resume uploaded successfully');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Consider adding more specific technical details');
  }
  
  return {
    skills: uniqueSkills.length > 0 ? uniqueSkills : [],
    strengths: strengths,
    weaknesses: weaknesses,
    suggested_roles: getSuggestedRoles(uniqueSkills),
    score: Math.round(score)
  };
}

function getSuggestedRoles(skills) {
  // If no skills, suggest entry-level roles
  if (skills.length === 0) {
    return ['Entry Level Developer', 'Trainee Software Engineer', 'Junior Developer'];
  }
  
  const roles = [];
  const skillsLower = skills.map(s => s.toLowerCase()).join(' ');
  
  if (skillsLower.includes('react') || skillsLower.includes('angular') || skillsLower.includes('vue')) {
    roles.push('Frontend Developer');
  }
  if (skillsLower.includes('node') || skillsLower.includes('express') || skillsLower.includes('django')) {
    roles.push('Backend Developer');
  }
  if (roles.length >= 2 || skillsLower.includes('fullstack') || skillsLower.includes('full stack')) {
    roles.push('Full Stack Developer');
  }
  if (skillsLower.includes('ml') || skillsLower.includes('machine learning') || skillsLower.includes('tensorflow')) {
    roles.push('ML Engineer');
  }
  if (skillsLower.includes('data') || skillsLower.includes('pandas') || skillsLower.includes('numpy')) {
    roles.push('Data Analyst');
  }
  if (skillsLower.includes('java') || skillsLower.includes('python') || skillsLower.includes('c++')) {
    if (roles.length === 0) roles.push('Software Developer');
  }
  
  return roles.length > 0 ? roles : ['Junior Software Developer', 'Software Engineer Trainee'];
}

export const generateLearningRoadmap = async (userSkills, missingSkills, jobDomains) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set - using fallback roadmap");
    return generateFallbackRoadmap(missingSkills);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const prompt = `
You are a career advisor and technical mentor. Generate a personalized learning roadmap for a student.

**Student's Current Skills:**
${userSkills.length > 0 ? userSkills.join(', ') : 'No specific skills listed yet'}

**Skills Missing for Target Jobs:**
${missingSkills.length > 0 ? missingSkills.join(', ') : 'General skill development needed'}

**Target Job Domains:**
${jobDomains.length > 0 ? jobDomains.join(', ') : 'Software Development'}

Generate a detailed, actionable learning roadmap in STRICT JSON format (no markdown, no code blocks):

{
  "intro": "A personalized 2-3 sentence introduction explaining their current position and the roadmap ahead",
  "skills": [
    {
      "name": "Specific skill name (e.g., 'React.js', 'Node.js', 'Python')",
      "priority": "High",
      "reason": "Detailed explanation of why this skill is critical for their target roles (2-3 sentences)",
      "resources": [
        "Specific free resource with name (e.g., 'MDN Web Docs - JavaScript Guide')",
        "Specific YouTube channel or course (e.g., 'freeCodeCamp - React Course')",
        "Specific tutorial or documentation (e.g., 'Official React Documentation')"
      ],
      "timeline": "Realistic time estimate (e.g., '3-4 weeks of consistent practice', '1-2 months')",
      "projects": [
        "Specific, actionable project idea (e.g., 'Build a Todo app with React and local storage')",
        "Another hands-on project (e.g., 'Create a weather dashboard using APIs')"
      ]
    }
  ],
  "careerAdvice": "2-3 sentences of strategic advice on breaking into these roles, including portfolio tips and job search strategies"
}

CRITICAL REQUIREMENTS:
1. Generate AT LEAST 5 skills in the skills array, even if missing skills list is short
2. Prioritize missing skills first, then add complementary skills that enhance their career
3. If current skills are limited, suggest foundational skills for the target domains
4. Be SPECIFIC with resource names - no generic placeholders
5. Suggest only FREE resources (YouTube, official docs, freeCodeCamp, MDN, W3Schools, etc.)
6. Order skills by priority: High priority first
7. Each skill must have 3 specific resources and 2 specific project ideas
8. Timeline should be realistic for a motivated learner
9. Make project ideas concrete and achievable

Return ONLY the JSON object, no markdown formatting, no \`\`\`json tags.
`;

    console.log("🤖 Generating roadmap with Gemini (trying multiple models)...");
    const result = await tryMultipleModels(genAI, prompt, "roadmap generation");
    const raw = result.response.text();

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid AI response - no JSON found");
    }

    const jsonString = raw.substring(jsonStart, jsonEnd + 1);
    const roadmap = JSON.parse(jsonString);

    console.log("✅ Roadmap generated successfully");
    return roadmap;

  } catch (error) {
    console.error("❌ Gemini Roadmap Error:", error.message);
    return generateFallbackRoadmap(missingSkills);
  }
};

const generateFallbackRoadmap = (missingSkills) => {
  // Filter out placeholder/invalid skills
  const validSkills = missingSkills.filter(skill => 
    skill && 
    skill.length > 2 && 
    !skill.includes('No specific') && 
    !skill.includes('analyze job')
  );

  // If no valid skills, provide general software development roadmap
  if (validSkills.length === 0) {
    return {
      intro: "⚠️ AI quota exceeded. Here's a general skill development roadmap for software engineering:",
      skills: [
        {
          name: "JavaScript",
          priority: "High",
          reason: "Most demanded language for web development. Used in frontend, backend (Node.js), and mobile apps.",
          resources: [
            "MDN Web Docs - JavaScript Guide",
            "freeCodeCamp JavaScript Algorithms and Data Structures",
            "JavaScript.info - The Modern JavaScript Tutorial"
          ],
          timeline: "6-8 weeks for fundamentals",
          projects: [
            "Build a task management app with vanilla JavaScript",
            "Create an interactive quiz application"
          ]
        },
        {
          name: "React.js",
          priority: "High",
          reason: "Industry-standard frontend framework used by Facebook, Netflix, Airbnb and thousands of companies.",
          resources: [
            "Official React Documentation and Tutorial",
            "freeCodeCamp - React Course for Beginners",
            "Scrimba - Learn React for Free"
          ],
          timeline: "4-6 weeks after JavaScript basics",
          projects: [
            "Build a weather dashboard using React and APIs",
            "Create a movie search app with React Hooks"
          ]
        },
        {
          name: "Node.js & Express",
          priority: "High",
          reason: "Backend JavaScript runtime. Build APIs and server-side applications.",
          resources: [
            "Node.js Official Documentation",
            "freeCodeCamp - Node.js and Express Tutorial",
            "The Odin Project - NodeJS Course"
          ],
          timeline: "4-5 weeks",
          projects: [
            "Build a REST API for a blog with authentication",
            "Create a real-time chat application with Socket.io"
          ]
        },
        {
          name: "MongoDB or PostgreSQL",
          priority: "Medium",
          reason: "Database skills are essential for full-stack development.",
          resources: [
            "MongoDB University - Free MongoDB Courses",
            "PostgreSQL Tutorial for Beginners",
            "W3Schools SQL Tutorial"
          ],
          timeline: "3-4 weeks",
          projects: [
            "Build a CRUD application with database integration",
            "Design a database schema for an e-commerce platform"
          ]
        },
        {
          name: "Git & GitHub",
          priority: "High",
          reason: "Version control is mandatory for all software development roles.",
          resources: [
            "Git Official Documentation",
            "GitHub Skills - Interactive Git Tutorial",
            "Atlassian Git Tutorial"
          ],
          timeline: "1-2 weeks",
          projects: [
            "Contribute to an open-source project on GitHub",
            "Create and maintain your own project portfolio on GitHub"
          ]
        }
      ],
      careerAdvice: "Start with JavaScript fundamentals, then learn React for frontend. Build 3-5 portfolio projects on GitHub. Apply for junior/trainee positions even before you feel 100% ready. Consider freelancing on Upwork to gain real-world experience."
    };
  }

  // Generate roadmap for valid missing skills
  const skillRoadmap = validSkills.slice(0, 5).map(skill => {
    const skillLower = skill.toLowerCase();
    const skillCapitalized = skill.charAt(0).toUpperCase() + skill.slice(1);
    
    // Skill-specific resources
    const resourceMap = {
      'javascript': ['MDN JavaScript Guide', 'freeCodeCamp JavaScript Course', 'JavaScript.info Tutorial'],
      'python': ['Python.org Official Tutorial', 'Automate the Boring Things with Python', 'freeCodeCamp Python Course'],
      'react': ['Official React Docs', 'React Tutorial by freeCodeCamp', 'Scrimba React Course'],
      'node': ['Node.js Official Docs', 'The Odin Project NodeJS', 'freeCodeCamp Node/Express Tutorial'],
      'sql': ['W3Schools SQL Tutorial', 'SQLBolt Interactive Lessons', 'Mode SQL Tutorial'],
      'git': ['Git Official Documentation', 'GitHub Skills Tutorial', 'Atlassian Git Tutorial'],
      'docker': ['Docker Official Getting Started', 'freeCodeCamp Docker Course', 'Docker Curriculum'],
      'aws': ['AWS Free Tier Account', 'freeCodeCamp AWS Course', 'AWS Skills Builder'],
      'mongodb': ['MongoDB University Free Courses', 'MongoDB Official Tutorial', 'The Net Ninja MongoDB Tutorial'],
      'typescript': ['TypeScript Official Handbook', 'TypeScript Deep Dive (Free Book)', 'Execute Program TypeScript Course']
    };

    const projectMap = {
      'javascript': ['Build a temperature converter', 'Create a ToDo list with local storage'],
      'python': ['Build a web scraper with BeautifulSoup', 'Create a data analysis project with Pandas'],
      'react': ['Build a dashboard with charts', 'Create a Netflix clone UI'],
      'node': ['Build a REST API with authentication', 'Create a blog backend with CRUD operations'],
      'sql': ['Design a relational database for a library', 'Build complex queries for data analysis'],
      'git': ['Contribute to open source', 'Manage a multi-branch project workflow'],
      'docker': ['Containerize a full-stack application', 'Create a multi-container setup with Docker Compose'],
      'aws': ['Deploy a web app on EC2', 'Set up S3 bucket for file storage'],
      'mongodb': ['Build a social media database schema', 'Create an e-commerce product catalog'],
      'typescript': ['Refactor a JavaScript project to TypeScript', 'Build a type-safe API with Express and TypeScript']
    };

    return {
      name: skillCapitalized,
      priority: "High",
      reason: `This skill is required by multiple job listings in your target domains.`,
      resources: resourceMap[skillLower] || [
        `${skillCapitalized} Official Documentation`,
        `freeCodeCamp ${skillCapitalized} Tutorial`,
        `YouTube: ${skillCapitalized} Crash Course by Traversy Media`
      ],
      timeline: "4-6 weeks",
      projects: projectMap[skillLower] || [
        `Build a practical project demonstrating ${skillCapitalized}`,
        `Contribute to open-source projects using ${skillCapitalized}`
      ]
    };
  });

  return {
    intro: `⚠️ AI quota exceeded - using curated roadmap. Focus on these ${validSkills.length} in-demand skills:`,
    skills: skillRoadmap,
    careerAdvice: "Build 2-3 projects for each skill. Create a strong GitHub portfolio. Practice on LeetCode/HackerRank. Apply to internships and junior positions actively."
  };
};
