# 📄 NLP Resume Parser & Career Insights

A sophisticated full-stack application that leverages **NLP** to transform messy PDF resumes into structured, actionable data. It doesn't just parse; it visualizes your professional identity in seconds.

## ✨ Core Features

*   **AI-Powered Extraction**: Uses Spacy's Named Entity Recognition (NER) to pull out Names, Contact Info, and Skills with high precision.
*   **Visual Skill DNA**: Generates a dynamic Radar Chart using **Recharts** to visualize your technical breadth and depth.
*   **Modern Premium UI**: A sleek, dark-mode dashboard built with **Next.js 15** and **Tailwind CSS**, featuring smooth micro-animations by **Framer Motion**.
*   **Real-time Processing**: Immediate feedback loop from file upload to data visualization.

## 📸 Dashboard Preview

![Project Dashboard](screenshots/dashboard.png)

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4)
- **Animations**: Framer Motion
- **Visualization**: Recharts (Radar/Spider Charts)
- **State Management**: React Hooks

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework (DRF)
- **NLP Engine**: Spacy (`en_core_web_sm`)
- **PDF Processing**: PDFPlumber
- **Database**: SQLite3 (Development)

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/NLPResumeParser.git
   cd NLPResumeParser
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📝 License
Distributed under the MIT License.

---
Built with 🚀 for a smarter hiring experience.
