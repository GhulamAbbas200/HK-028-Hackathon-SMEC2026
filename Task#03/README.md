# SmartSpend AI – Receipt & Expense Intelligence System

## 📌 Project Overview

SmartSpend AI is an intelligent expense management system that scans receipt images and converts them into meaningful financial insights.
The system helps users track, analyze, and manage their expenses efficiently through automated receipt scanning, analytics, alerts, and visual reports.

This project is developed to fulfill **Task-03 requirements**.

---

## 🎯 Objectives

* Scan receipt images using AI
* Extract important financial information
* Generate monthly expense summaries
* Provide spending analytics and alerts
* Display insights through visual reports

---

## 📂 Dataset Used

**SROIE Dataset (Kaggle)**
🔗 [https://www.kaggle.com/datasets/urbikn/sroie-datasetv2/data](https://www.kaggle.com/datasets/urbikn/sroie-datasetv2/data)

### Dataset Details:

* 973 scanned receipt images
* Annotated fields:

  * Merchant name
  * Date
  * Address
  * Total amount

### Usage:

* Used for training and evaluating receipt OCR and information extraction models
* Helps improve accuracy of real-world receipt scanning

---

## 🧠 AI & Machine Learning

* OCR for text extraction from receipt images
* Receipt understanding model trained using SROIE dataset
* Extracted fields:

  * Merchant
  * Date
  * Total amount
  * Expense category (Food, Shopping, Travel, etc.)

---

## ⭐ Core Features

### 1️⃣ Scan Receipt Images

* Upload receipt images
* Automatic OCR processing
* Extract key receipt information
* Save extracted data to database

### 2️⃣ Monthly Expense Summaries

* Total monthly spending
* Average receipt value
* Category-wise expense summary

### 3️⃣ Spending Analytics

* Monthly spending trends (line chart)
* Category distribution (pie chart)
* Recent transactions list

### 4️⃣ Alerts System

* Alerts when monthly budget exceeds
* Notifications for unusual spending
* In-app alert messages

### 5️⃣ Visual Reports

* Interactive charts and graphs
* Easy-to-understand dashboard
* Downloadable expense reports (PDF/CSV)

---

## 🖥️ System Architecture

### Frontend

* React / Next.js
* Responsive dashboard UI
* Charts using Chart.js / Recharts

### Backend

* Node.js + Express
* REST APIs for receipts and analytics
* Authentication and data handling

### Database

* MongoDB / Firebase
* Stores users, receipts, expenses, and alerts

---

## 📊 Dashboard Overview

The dashboard displays:

* Total monthly spending
* Average receipt value
* Top spending category
* Spending trend graph
* Category distribution chart
* Recent transactions
* Alerts and notifications
* “Scan New Receipt” feature

---

## 🔐 Real-World Considerations

* Secure user data
* Error handling for low-quality images
* Fast and efficient processing
* Mobile-friendly UI
* Scalable architecture

---

## 🧪 Testing

* Tested with sample receipts from SROIE dataset
* Verified accuracy of extracted fields
* Validated monthly summaries and analytics

---

## 🚀 Installation & Setup (Basic)

```bash
npm install
npm start
```

> Dataset should be downloaded locally from Kaggle and placed in the `/dataset` directory.

---

## 📦 Deliverables

* Full source code (Frontend + Backend)
* Receipt OCR and extraction logic
* Analytics and alerts system
* Dashboard UI
* This README file

---

## 🏁 Conclusion

SmartSpend AI successfully converts receipt images into actionable financial insights.
By using AI, analytics, and visual reporting, the system helps users manage their expenses efficiently and intelligently.
