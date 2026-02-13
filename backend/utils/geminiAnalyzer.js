import { GoogleGenerativeAI } from "@google/generative-ai";

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
    // Use gemini-2.5-flash (latest fast model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    console.log("🤖 Calling Gemini API...");
    const result = await model.generateContent(prompt);
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
