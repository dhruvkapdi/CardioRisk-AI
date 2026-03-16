# CardioRisk AI

CardioRisk AI is a full-stack healthcare platform that predicts cardiovascular disease risk using machine learning and provides explainable health insights through a modern web application.

## Overview

The platform is designed to help users assess cardiovascular risk using clinical and lifestyle data such as blood pressure, BMI, cholesterol, glucose, smoking habits, alcohol intake, and physical activity.

It includes:
- AI-powered cardiovascular risk prediction
- Explainable AI insights
- Multi-profile family health management
- Prediction history tracking
- Interactive analytics dashboards
- Automated health recommendations
- Nearby hospital discovery for high-risk cases
- AI health assistant chatbot
- Role-based admin panel
- Admin analytics dashboard
- Health report generation

## Model Details

- **Dataset size:** 70,000+ cardiovascular health records
- **Model accuracy:** 73.6%
- **Algorithms evaluated:** Logistic Regression, Random Forest, SVM, XGBoost

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- Lucide React

### Backend
- FastAPI
- Pydantic
- Uvicorn

### Machine Learning
- Python
- scikit-learn
- XGBoost
- SHAP
- pandas
- numpy
- joblib

### Database / Auth
- Supabase
- PostgreSQL

## Core Features

### AI Cardiovascular Risk Prediction
Predicts cardiovascular disease risk using machine learning models trained on large-scale medical data.

### Explainable AI Insights
Shows the main risk factors influencing each prediction for better transparency and understanding.

### Multi-Profile Family Health Management
Allows users to create and manage multiple health profiles for family members with separate prediction histories.

### Prediction History Tracking
Stores previous assessments so users can monitor cardiovascular risk over time.

### Interactive Analytics Dashboard
Provides charts and visual insights for risk trends, distributions, and health metrics.

### Automated Health Recommendations
Generates preventive health suggestions based on predicted risk factors.

### Nearby Hospital Discovery
Suggests nearby hospitals when high-risk predictions are detected.

### AI Health Assistant
Includes an interactive assistant for answering cardiovascular health questions and explaining results.

### Secure Authentication
Implements login, signup, protected routes, and secure session handling using Supabase.

### Role-Based Admin Panel
Includes a separate admin portal for monitoring users, predictions, profiles, and platform activity.

### Admin Analytics Dashboard
Displays platform-wide metrics such as total users, total predictions, and high-risk case distribution.

### Health Report Generation
Supports downloadable cardiovascular risk reports in a medical-style format.

## Project Structure

```bash
cardio-health-ai-main/
├── public/
│   └── backend/
│       ├── app/
│       ├── ml/
│       ├── README.py
│       ├── README_BACKEND.md
│       └── requirements.txt
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── integrations/
│   └── ...
├── public/
├── index.html
├── package.json
└── README.md