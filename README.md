# Academic Risk Radar 🎓

**A Student Academic Performance Monitoring and Risk Analysis System**

## 📌 About the Project

Academic Risk Radar is a frontend-based web application designed to monitor student academic performance and identify students who may be at academic risk.

The system evaluates students using different academic parameters, including attendance, internal marks, assignment performance, and quiz marks. It calculates an overall performance score, classifies students into risk categories, and provides recommendations for improvement.

## ✨ Features

- **Dashboard:** Displays total students, academic performance statistics, and risk distribution.
- **Student Management:** Add, edit, delete, search, filter, and sort student records.
- **Academic Risk Analysis:** Calculates academic scores and identifies Low, Medium, and High Risk students.
- **Performance Analytics:** Displays class averages and department-wise performance comparisons.
- **Attendance Monitoring:** Tracks attendance percentages and identifies attendance defaulters.
- **Reports & Exports:** Generate reports, print reports, and export student data as CSV.
- **Data Storage:** Saves student records using browser LocalStorage.

## 🛠️ Technologies Used

- HTML5 – Structure of the application.
- CSS3 – Styling and responsive layout.
- Vanilla JavaScript – Application logic and functionality.
- Browser LocalStorage – Local data storage.
- CSS Grid and Flexbox – Page layout and responsiveness.

## 📊 Academic Risk Calculation

The system calculates an overall academic score using four parameters:

| Parameter | Weight |
|---|---:|
| Attendance | 35% |
| Internal Marks | 35% |
| Assignments | 20% |
| Quiz Marks | 10% |

### Risk Classification

- **Low Risk:** Score greater than or equal to 75.
- **Medium Risk:** Score between 50 and 74.99.
- **High Risk:** Score below 50.

The system also generates recommendations based on students' academic performance.

## 🚀 How to Run the Project

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` using the Live Server extension.
4. The application will open in your default web browser.
5. Start exploring the dashboard and other features.

## 📁 Project Structure

```text
Academic-Risk-Radar/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 💾 Data Storage and Limitations

- This is a frontend-only project.
- No backend server or external database is used.
- Student records are stored in the browser using LocalStorage.
- Data is available in the same browser where it was saved.
- Data does not automatically synchronize across different devices or browsers.
- Clearing browser storage may delete saved student records.
- Risk classification is based on a rule-based scoring system, not artificial intelligence or machine learning.

## 🔮 Future Scope

- Integration with a backend server and database.
- User authentication and role-based access.
- Email notifications for students identified as at risk.
- Advanced academic performance tracking across multiple semesters.
- Improved analytics and reporting features.

## 👩‍💻 Author

**Chahat Kumari**

B.Tech – Computer Science and Engineering  
Specialization: Cloud Computing

---

*Academic Risk Radar – Supporting better academic monitoring through data-driven analysis.*
