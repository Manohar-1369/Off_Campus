# 🎓 OffCampus - Automated Job Opportunity Notification System

A MERN stack application that automatically crawls, matches, and notifies students about off-campus job opportunities based on their domain interests.

## 🌟 Features

- **Automated Job Crawling**: Python crawler scrapes job opportunities from multiple sources
- **Smart Matching**: Matches jobs to students based on their domain/interests
- **Email Notifications**: Automated email alerts for new matching opportunities
- **Toggle Notifications**: Students can enable/disable notifications with one click
- **Clean UI**: Minimal, professional interface for easy navigation
- **Real-time Updates**: Immediate notification status tracking

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Fetch API for HTTP requests

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Nodemailer (email notifications)
- CORS enabled

### Crawler
- Python
- BeautifulSoup / Selenium
- Job scraping automation

## 📁 Project Structure

```
OffCampus/
├── backend/
│   ├── controllers/
│   │   └── StudentController.js
│   ├── models/
│   │   ├── Job.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── jobRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── StudentRoutes.js
│   ├── utils/
│   │   └── mailer.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Jobs.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── crawler/
│   └── crawler.py
├── .gitignore
├── DEPLOYMENT.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Gmail account with App Password
- Python 3.x (for crawler)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd OffCampus
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   node server.js
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Setup Crawler (Optional)**
   ```bash
   cd crawler
   pip install -r requirements.txt
   python crawler.py
   ```

### Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/offcampus
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## 💡 How It Works

1. **Student Registration**: Students register with their name, email, and domain of interest
2. **Job Crawling**: Python crawler automatically scrapes job listings from various sources
3. **Smart Matching**: Backend matches jobs to students based on domain
4. **Notification System**: 
   - Students can enable/disable email notifications
   - When enabled, they receive a test email immediately
   - System automatically sends emails for new matching opportunities
5. **Job Viewing**: Students see all matched opportunities on their dashboard

## 🎯 API Endpoints

### Students
- `POST /students/register` - Register new student
- `GET /students/:id/jobs` - Get matched jobs for student

### Jobs
- `GET /jobs` - Get all jobs

### Notifications
- `POST /notifications/enable` - Enable notifications + send test email
- `POST /notifications/disable` - Disable notifications
- `GET /notifications/status/:studentId` - Get notification status

## 📸 Features Demo

### Student Registration
Simple form to register with name, email, and domain

### Notification Toggle
- One-click enable/disable at the top of jobs page
- Immediate test email on enable
- Status indicator shows current state

### Job Matching
- Clean cards displaying matched opportunities
- One-click apply links
- Domain-based filtering

## 🔒 Security

- Environment variables for sensitive data
- `.env` files excluded from Git
- Gmail App Passwords (not regular passwords)
- CORS protection
- MongoDB connection encryption

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Render / Railway / Heroku (Backend)
- Vercel / Netlify (Frontend)
- MongoDB Atlas (Database)

## 🤝 Contributing

This project was built for a hackathon. Contributions, issues, and feature requests are welcome!

## 📝 License

This project is open source and available under the MIT License.

## 👥 Team

Built by Team [Your Team Name] for [Hackathon Name]

## 📧 Contact

For questions or demo requests, contact: [your-email@example.com]

---

**Made with ❤️ for connecting students with opportunities**
