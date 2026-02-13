import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("🔑 Testing API Key:", apiKey ? apiKey.substring(0, 15) + "..." : "NOT FOUND");

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log("\n📋 Fetching available models...\n");
    
    // Try to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error("❌ API Error:", response.status, response.statusText);
      console.error("Details:", error);
      
      if (response.status === 400) {
        console.log("\n💡 Your API key appears to be INVALID or EXPIRED");
        console.log("🔗 Get a new key: https://aistudio.google.com/app/apikey");
      }
      return;
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log("✅ Available models:");
      data.models.forEach(model => {
        console.log(`   - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`     Methods: ${model.supportedGenerationMethods.join(", ")}`);
        }
      });
    } else {
      console.log("⚠️ No models found for this API key");
    }
    
  } catch (error) {
    console.error("💥 Error:", error.message);
    console.log("\n📌 Possible issues:");
    console.log("   1. API key is invalid or expired");
    console.log("   2. API key doesn't have Gemini API access");
    console.log("   3. Network/firewall blocking the request");
    console.log("\n🔗 Create new key: https://aistudio.google.com/app/apikey");
  }
}

listModels();
