import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log("🔑 API Key:", apiKey ? apiKey.substring(0, 15) + "..." : "NOT FOUND");

const genAI = new GoogleGenerativeAI(apiKey);

// Test different model names
const modelsToTest = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-1.0-pro"
];

async function testModels() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🧪 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Say hello in JSON format");
      const text = result.response.text();
      
      console.log(`✅ ${modelName} WORKS!`);
      console.log(`Response: ${text.substring(0, 100)}...`);
      
      // If successful, we found a working model
      console.log(`\n🎉 SUCCESS! Use this model: ${modelName}`);
      break;
      
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

testModels().catch(err => {
  console.error("\n💥 All models failed:", err.message);
  console.log("\n📌 Your API key might be:");
  console.log("   - Invalid or expired");
  console.log("   - Not activated for Gemini API");
  console.log("   - Missing required permissions");
  console.log("\n🔗 Get a new key: https://aistudio.google.com/app/apikey");
});
