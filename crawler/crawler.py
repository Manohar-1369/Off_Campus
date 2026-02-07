import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient

# MongoDB Atlas connection
client = MongoClient(
    "mongodb+srv://manoharsuddula1369:manohar%409704@cluster0.yxxdizl.mongodb.net/offcampus"
)
db = client["offcampus"]
collection = db["jobs"]

URL = "https://www.python.org/jobs/"
response = requests.get(URL)

soup = BeautifulSoup(response.text, "html.parser")
jobs = soup.select("ol.list-recent-jobs li")

print("Jobs found:", len(jobs))

for job in jobs[:10]:
    # Title
    title_tag = job.find("h2")
    title = title_tag.get_text(strip=True) if title_tag else "N/A"

    # Company
    company_tag = job.find("h3")
    company = company_tag.get_text(strip=True) if company_tag else "Not mentioned"

    # Apply link
    link_tag = job.find("a")
    apply_link = (
        "https://www.python.org" + link_tag["href"] if link_tag else "N/A"
    )

    # 🔹 SIMPLE DOMAIN LOGIC (IMPORTANT)
    title_lower = title.lower()
    if "python" in title_lower or "ml" in title_lower or "ai" in title_lower:
        domain = "AI/ML"
    else:
        domain = "Software"

    job_data = {
        "title": title,
        "company": company,
        "applyLink": apply_link,
        "domain": domain,
        "source": "python.org"
    }

    # Avoid duplicates
    if not collection.find_one({"title": title, "company": company}):
        collection.insert_one(job_data)
        print("Saved:", title, "| Domain:", domain)
    else:
        print("Duplicate skipped:", title)
