/* =================================================================
   Academic Risk Radar – Main JavaScript
   Student Academic Performance Monitoring System
   ================================================================= */

// -----------------------------------------------------------------
// CONFIGURATION – Easy to modify scoring weights & thresholds
// -----------------------------------------------------------------
const CONFIG = {
  // Scoring weights (must add up to 1.0)
  weights: {
    attendance: 0.35,
    internals: 0.35,
    assignments: 0.20,
    quiz: 0.10
  },
  // Risk thresholds
  risk: {
    low: 75,       // score >= 75 → Low Risk
    medium: 50     // score >= 50 → Medium Risk, below → High Risk
  },
  // Recommendation thresholds
  recommend: {
    attendance: 75,
    internals: 50,
    assignments: 70,
    quiz: 60
  },
  // Attendance status thresholds
  attendanceStatus: {
    satisfactory: 75,
    warning: 65     // below this → Critical
  },
  // Max marks
  maxInternal: 30,
  maxQuiz: 10,
  // LocalStorage key
  storageKey: 'academicRiskRadar_students'
};

// -----------------------------------------------------------------
// SAMPLE DATA – 8 realistic student records
// -----------------------------------------------------------------
const SAMPLE_STUDENTS = [
  { name: "Aarav Sharma", regNo: "11901001", department: "CSE", semester: "3", attendance: 92, internalMarks: 26, assignmentPct: 95, quizMarks: 9 },
  { name: "Priya Patel", regNo: "11901002", department: "CSE", semester: "3", attendance: 78, internalMarks: 22, assignmentPct: 80, quizMarks: 7 },
  { name: "Rohit Gupta", regNo: "11902003", department: "ECE", semester: "3", attendance: 55, internalMarks: 12, assignmentPct: 40, quizMarks: 3 },
  { name: "Sneha Reddy", regNo: "11902004", department: "ECE", semester: "5", attendance: 88, internalMarks: 24, assignmentPct: 90, quizMarks: 8 },
  { name: "Vikram Singh", regNo: "11903005", department: "ME", semester: "5", attendance: 65, internalMarks: 18, assignmentPct: 60, quizMarks: 5 },
  { name: "Ananya Mishra", regNo: "11903006", department: "ME", semester: "3", attendance: 42, internalMarks: 10, assignmentPct: 35, quizMarks: 2 },
  { name: "Karan Joshi", regNo: "11904007", department: "CE", semester: "5", attendance: 81, internalMarks: 20, assignmentPct: 75, quizMarks: 6 },
  { name: "Meera Nair", regNo: "11905008", department: "EE", semester: "3", attendance: 70, internalMarks: 15, assignmentPct: 55, quizMarks: 4 }
];

// -----------------------------------------------------------------
// DATA – Get / Save students from LocalStorage
// -----------------------------------------------------------------
function getStudents() {
  let data = localStorage.getItem(CONFIG.storageKey);
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

function saveStudents(students) {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(students));
}

/* Load sample data if LocalStorage is empty (first visit) */
function initSampleData() {
  if (!localStorage.getItem(CONFIG.storageKey)) {
    saveStudents(SAMPLE_STUDENTS);
  }
}

// -----------------------------------------------------------------
// CALCULATIONS
// -----------------------------------------------------------------

/* Calculate overall academic score for a student object */
function calculateScore(student) {
  let internalPct = (student.internalMarks / CONFIG.maxInternal) * 100;
  let quizPct = (student.quizMarks / CONFIG.maxQuiz) * 100;

  let score = (student.attendance * CONFIG.weights.attendance) +
    (internalPct * CONFIG.weights.internals) +
    (student.assignmentPct * CONFIG.weights.assignments) +
    (quizPct * CONFIG.weights.quiz);

  return Math.round(score * 100) / 100; // round to 2 decimal places
}

/* Determine risk category from score */
function calculateRisk(score) {
  if (score >= CONFIG.risk.low) return "Low";
  if (score >= CONFIG.risk.medium) return "Medium";
  return "High";
}

/* Generate improvement recommendations */
function getRecommendations(student) {
  let recommendations = [];
  let internalPct = (student.internalMarks / CONFIG.maxInternal) * 100;
  let quizPct = (student.quizMarks / CONFIG.maxQuiz) * 100;

  if (student.attendance < CONFIG.recommend.attendance) {
    recommendations.push("Improve attendance – current attendance is below " + CONFIG.recommend.attendance + "%.");
  }
  if (internalPct < CONFIG.recommend.internals) {
    recommendations.push("Focus on subject preparation – internal assessment performance needs improvement.");
  }
  if (student.assignmentPct < CONFIG.recommend.assignments) {
    recommendations.push("Complete pending assignments – assignment completion is below " + CONFIG.recommend.assignments + "%.");
  }
  if (quizPct < CONFIG.recommend.quiz) {
    recommendations.push("Practise regularly – quiz performance is below " + CONFIG.recommend.quiz + "%.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Good performance! Keep up the consistent effort.");
  }
  return recommendations;
}

/* Get attendance status label */
function getAttendanceStatus(attendance) {
  if (attendance >= CONFIG.attendanceStatus.satisfactory) return "Satisfactory";
  if (attendance >= CONFIG.attendanceStatus.warning) return "Warning";
  return "Critical";
}

// -----------------------------------------------------------------
// NAVIGATION
// -----------------------------------------------------------------
function navigateTo(sectionId) {
  // Update sidebar active link
  let links = document.querySelectorAll('.nav-link');
  for (let i = 0; i < links.length; i++) {
    links[i].classList.remove('active');
    if (links[i].getAttribute('data-section') === sectionId) {
      links[i].classList.add('active');
    }
  }

  // Show selected page, hide others
  let pages = document.querySelectorAll('.page');
  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.remove('active');
  }
  document.getElementById(sectionId).classList.add('active');

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  // Refresh page-specific data
  refreshPageData(sectionId);
}

/* Refresh data for the active page */
function refreshPageData(sectionId) {
  if (sectionId === 'dashboard') updateDashboard();
  if (sectionId === 'students') displayStudents();
  if (sectionId === 'risk-analysis') showRiskAnalysis();
  if (sectionId === 'analytics') showAnalytics();
  if (sectionId === 'attendance') showAttendance();
}

// -----------------------------------------------------------------
// MODULE 1: DASHBOARD
// -----------------------------------------------------------------
function updateDashboard() {
  let students = getStudents();
  let total = students.length;

  let lowCount = 0, medCount = 0, highCount = 0;
  let totalAtt = 0, totalScore = 0;
  let totalInternalPct = 0, totalAssignment = 0, totalQuizPct = 0;

  for (let i = 0; i < students.length; i++) {
    let score = calculateScore(students[i]);
    let risk = calculateRisk(score);

    if (risk === "Low") lowCount++;
    else if (risk === "Medium") medCount++;
    else highCount++;

    totalAtt += students[i].attendance;
    totalScore += score;
    totalInternalPct += (students[i].internalMarks / CONFIG.maxInternal) * 100;
    totalAssignment += students[i].assignmentPct;
    totalQuizPct += (students[i].quizMarks / CONFIG.maxQuiz) * 100;
  }

  let avgAtt = total > 0 ? Math.round(totalAtt / total) : 0;
  let avgScore = total > 0 ? Math.round(totalScore / total) : 0;
  let avgInternalPct = total > 0 ? Math.round(totalInternalPct / total) : 0;
  let avgAssignment = total > 0 ? Math.round(totalAssignment / total) : 0;
  let avgQuizPct = total > 0 ? Math.round(totalQuizPct / total) : 0;

  // Summary cards
  document.getElementById('totalStudents').textContent = total;
  document.getElementById('lowRiskCount').textContent = lowCount;
  document.getElementById('mediumRiskCount').textContent = medCount;
  document.getElementById('highRiskCount').textContent = highCount;
  document.getElementById('avgAttendance').textContent = avgAtt + '%';
  document.getElementById('avgPerformance').textContent = avgScore + '%';

  // Top bar alert badge (high-risk count)
  document.getElementById('topbarAlertCount').textContent = highCount;

  // Risk distribution bars
  let lowPct = total > 0 ? Math.round((lowCount / total) * 100) : 0;
  let medPct = total > 0 ? Math.round((medCount / total) * 100) : 0;
  let highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;

  document.getElementById('riskBarLow').style.width = lowPct + '%';
  document.getElementById('riskBarMedium').style.width = medPct + '%';
  document.getElementById('riskBarHigh').style.width = highPct + '%';
  document.getElementById('riskPctLow').textContent = lowPct + '%';
  document.getElementById('riskPctMedium').textContent = medPct + '%';
  document.getElementById('riskPctHigh').textContent = highPct + '%';

  // Performance overview bars
  document.getElementById('perfBarAttendance').style.width = avgAtt + '%';
  document.getElementById('perfValAttendance').textContent = avgAtt + '%';
  document.getElementById('perfBarInternals').style.width = avgInternalPct + '%';
  document.getElementById('perfValInternals').textContent = avgInternalPct + '%';
  document.getElementById('perfBarAssignments').style.width = avgAssignment + '%';
  document.getElementById('perfValAssignments').textContent = avgAssignment + '%';
  document.getElementById('perfBarQuizzes').style.width = avgQuizPct + '%';
  document.getElementById('perfValQuizzes').textContent = avgQuizPct + '%';

  // Recent activity
  updateActivityList();
}

/* Build the recent activity list (last 5 students added) */
function updateActivityList() {
  let students = getStudents();
  let list = document.getElementById('activityList');
  list.innerHTML = '';

  if (students.length === 0) {
    list.innerHTML = '<li class="activity-empty">No activity yet. Add students to get started.</li>';
    return;
  }

  // Show last 5 students (most recently added)
  let recent = students.slice(-5).reverse();
  for (let i = 0; i < recent.length; i++) {
    let score = calculateScore(recent[i]);
    let risk = calculateRisk(score);
    let li = document.createElement('li');
    li.innerHTML = '<strong>' + recent[i].name + '</strong> (' + recent[i].regNo + ') – ' +
      '<span class="badge badge-' + risk.toLowerCase() + '">' + risk + ' Risk</span> – Score: ' + score + '%';
    list.appendChild(li);
  }
}

// -----------------------------------------------------------------
// MODULE 2: STUDENT MANAGEMENT
// -----------------------------------------------------------------

/* Save a student (add or update) */
function saveStudent() {
  // Get form values
  let name = document.getElementById('studentName').value.trim();
  let regNo = document.getElementById('regNumber').value.trim();
  let department = document.getElementById('department').value;
  let semester = document.getElementById('semester').value;
  let attendance = document.getElementById('attendance').value;
  let internalMarks = document.getElementById('internalMarks').value;
  let assignmentPct = document.getElementById('assignmentPct').value;
  let quizMarks = document.getElementById('quizMarks').value;
  let editIndex = parseInt(document.getElementById('editIndex').value);

  // Validation
  let error = validateStudentForm(name, regNo, department, semester, attendance, internalMarks, assignmentPct, quizMarks, editIndex);
  if (error) {
    document.getElementById('formError').textContent = error;
    return;
  }

  // Build student object
  let student = {
    name: name,
    regNo: regNo,
    department: department,
    semester: semester,
    attendance: parseFloat(attendance),
    internalMarks: parseFloat(internalMarks),
    assignmentPct: parseFloat(assignmentPct),
    quizMarks: parseFloat(quizMarks)
  };

  let students = getStudents();

  if (editIndex >= 0) {
    // Update existing student
    students[editIndex] = student;
  } else {
    // Add new student
    students.push(student);
  }

  saveStudents(students);
  resetForm();
  displayStudents();
  document.getElementById('formError').textContent = '';
}

/* Validate student form inputs */
function validateStudentForm(name, regNo, dept, sem, att, internal, assign, quiz, editIndex) {
  if (!name) return "Student name is required.";
  if (!regNo) return "Registration number is required.";
  if (!dept) return "Please select a department.";
  if (!sem) return "Please select a semester.";
  if (att === '' || att < 0 || att > 100) return "Attendance must be between 0 and 100.";
  if (internal === '' || internal < 0 || internal > CONFIG.maxInternal) return "Internal marks must be between 0 and " + CONFIG.maxInternal + ".";
  if (assign === '' || assign < 0 || assign > 100) return "Assignment completion must be between 0 and 100.";
  if (quiz === '' || quiz < 0 || quiz > CONFIG.maxQuiz) return "Quiz marks must be between 0 and " + CONFIG.maxQuiz + ".";

  // Check duplicate registration number
  let students = getStudents();
  for (let i = 0; i < students.length; i++) {
    if (students[i].regNo === regNo && i !== editIndex) {
      return "A student with registration number " + regNo + " already exists.";
    }
  }

  return null; // No error
}

/* Display students in the table with search, filter and sort */
function displayStudents() {
  let students = getStudents();
  let searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  let filterDept = document.getElementById('filterDept').value;
  let filterRisk = document.getElementById('filterRisk').value;
  let sortOrder = document.getElementById('sortOrder').value;

  // Filter students
  let filtered = [];
  for (let i = 0; i < students.length; i++) {
    let score = calculateScore(students[i]);
    let risk = calculateRisk(score);

    // Search filter
    let matchSearch = !searchTerm ||
      students[i].name.toLowerCase().includes(searchTerm) ||
      students[i].regNo.toLowerCase().includes(searchTerm);

    // Department filter
    let matchDept = !filterDept || students[i].department === filterDept;

    // Risk filter
    let matchRisk = !filterRisk || risk === filterRisk;

    if (matchSearch && matchDept && matchRisk) {
      filtered.push({ student: students[i], index: i, score: score, risk: risk });
    }
  }

  // Sort
  if (sortOrder === 'score-desc') {
    filtered.sort(function (a, b) { return b.score - a.score; });
  } else if (sortOrder === 'score-asc') {
    filtered.sort(function (a, b) { return a.score - b.score; });
  }

  // Render table
  let tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    document.getElementById('emptyMessage').style.display = 'block';
  } else {
    document.getElementById('emptyMessage').style.display = 'none';
  }

  for (let i = 0; i < filtered.length; i++) {
    let s = filtered[i].student;
    let score = filtered[i].score;
    let risk = filtered[i].risk;
    let idx = filtered[i].index;

    let tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + (i + 1) + '</td>' +
      '<td>' + s.name + '</td>' +
      '<td>' + s.regNo + '</td>' +
      '<td>' + s.department + '</td>' +
      '<td>' + s.semester + '</td>' +
      '<td>' + s.attendance + '%</td>' +
      '<td>' + s.internalMarks + ' / ' + CONFIG.maxInternal + '</td>' +
      '<td>' + s.assignmentPct + '%</td>' +
      '<td>' + s.quizMarks + ' / ' + CONFIG.maxQuiz + '</td>' +
      '<td><strong>' + score + '%</strong></td>' +
      '<td><span class="badge badge-' + risk.toLowerCase() + '">' + risk + '</span></td>' +
      '<td class="actions">' +
      '<button class="btn btn-secondary btn-sm" onclick="editStudent(' + idx + ')">&#9998;</button>' +
      '<button class="btn btn-danger btn-sm" onclick="openDeleteModal(' + idx + ')">&#10006;</button>' +
      '</td>';
    tbody.appendChild(tr);
  }

  document.getElementById('recordCount').textContent = '(' + filtered.length + ')';
}

/* Populate form with student data for editing */
function editStudent(index) {
  let students = getStudents();
  let s = students[index];

  document.getElementById('studentName').value = s.name;
  document.getElementById('regNumber').value = s.regNo;
  document.getElementById('department').value = s.department;
  document.getElementById('semester').value = s.semester;
  document.getElementById('attendance').value = s.attendance;
  document.getElementById('internalMarks').value = s.internalMarks;
  document.getElementById('assignmentPct').value = s.assignmentPct;
  document.getElementById('quizMarks').value = s.quizMarks;
  document.getElementById('editIndex').value = index;
  document.getElementById('formTitle').textContent = 'Edit Student';
  document.getElementById('formError').textContent = '';

  // Scroll to form
  document.getElementById('studentForm').scrollIntoView({ behavior: 'smooth' });
}

/* Delete student by index */
function deleteStudent(index) {
  let students = getStudents();
  students.splice(index, 1);
  saveStudents(students);
  displayStudents();
  updateDashboard();
}

/* Reset the student form */
function resetForm() {
  document.getElementById('studentForm').reset();
  document.getElementById('editIndex').value = -1;
  document.getElementById('formTitle').textContent = 'Add New Student';
  document.getElementById('formError').textContent = '';
}

// -----------------------------------------------------------------
// DELETE CONFIRMATION MODAL
// -----------------------------------------------------------------
let pendingDeleteIndex = -1;

function openDeleteModal(index) {
  pendingDeleteIndex = index;
  document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
  pendingDeleteIndex = -1;
  document.getElementById('deleteModal').classList.remove('show');
}

document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
  if (pendingDeleteIndex >= 0) {
    deleteStudent(pendingDeleteIndex);
    closeDeleteModal();
  }
});

// -----------------------------------------------------------------
// MODULE 3: RISK ANALYSIS
// -----------------------------------------------------------------
function showRiskAnalysis() {
  let students = getStudents();
  let container = document.getElementById('riskCards');
  container.innerHTML = '';

  if (students.length === 0) {
    container.innerHTML = '<p class="empty-message">No students to analyse. Add student records first.</p>';
    return;
  }

  for (let i = 0; i < students.length; i++) {
    let s = students[i];
    let score = calculateScore(s);
    let risk = calculateRisk(score);
    let recommendations = getRecommendations(s);
    let internalPct = Math.round((s.internalMarks / CONFIG.maxInternal) * 100);
    let quizPct = Math.round((s.quizMarks / CONFIG.maxQuiz) * 100);

    // Pick colour class
    let headerClass = risk === 'Low' ? 'low-bg' : (risk === 'Medium' ? 'medium-bg' : 'high-bg');
    let barColor = risk === 'Low' ? 'var(--green)' : (risk === 'Medium' ? 'var(--orange)' : 'var(--red)');

    // Build card
    let card = document.createElement('div');
    card.className = 'risk-card';
    card.innerHTML =
      '<div class="risk-card-header ' + headerClass + '">' +
      '<span>' + s.name + ' (' + s.regNo + ')</span>' +
      '<span class="risk-score">' + score + '%</span>' +
      '</div>' +
      '<div class="risk-card-body">' +
      '<div class="risk-card-row"><span>Risk Category</span><span class="badge badge-' + risk.toLowerCase() + '">' + risk + ' Risk</span></div>' +
      '<div class="risk-card-progress"><div class="risk-card-progress-fill" style="width:' + score + '%; background:' + barColor + '"></div></div>' +
      '<div class="risk-card-row"><span>Attendance</span><span>' + s.attendance + '%</span></div>' +
      '<div class="risk-card-row"><span>Internal Assessment</span><span>' + s.internalMarks + '/' + CONFIG.maxInternal + ' (' + internalPct + '%)</span></div>' +
      '<div class="risk-card-row"><span>Assignment Completion</span><span>' + s.assignmentPct + '%</span></div>' +
      '<div class="risk-card-row"><span>Quiz Performance</span><span>' + s.quizMarks + '/' + CONFIG.maxQuiz + ' (' + quizPct + '%)</span></div>' +
      '<div class="risk-card-recommendations"><h4>&#128161; Recommendations</h4><ul>' +
      recommendations.map(function (r) { return '<li>' + r + '</li>'; }).join('') +
      '</ul></div>' +
      '</div>';

    container.appendChild(card);
  }
}

// -----------------------------------------------------------------
// MODULE 4: PERFORMANCE ANALYTICS
// -----------------------------------------------------------------
function showAnalytics() {
  let students = getStudents();

  if (students.length === 0) {
    document.getElementById('anaAvgAttendance').textContent = '0%';
    document.getElementById('anaAvgInternals').textContent = '0 / 30';
    document.getElementById('anaAvgQuiz').textContent = '0 / 10';
    document.getElementById('anaAvgAssignment').textContent = '0%';
    document.getElementById('anaBarAttendance').style.width = '0%';
    document.getElementById('anaBarInternals').style.width = '0%';
    document.getElementById('anaBarQuiz').style.width = '0%';
    document.getElementById('anaBarAssignment').style.width = '0%';
    document.getElementById('deptChart').innerHTML = '<p class="empty-message">No data available.</p>';
    document.getElementById('studentChart').innerHTML = '<p class="empty-message">No data available.</p>';
    return;
  }

  // Calculate averages
  let totalAtt = 0, totalInternal = 0, totalQuiz = 0, totalAssign = 0;
  for (let i = 0; i < students.length; i++) {
    totalAtt += students[i].attendance;
    totalInternal += students[i].internalMarks;
    totalQuiz += students[i].quizMarks;
    totalAssign += students[i].assignmentPct;
  }

  let avgAtt = Math.round(totalAtt / students.length);
  let avgInternal = (totalInternal / students.length).toFixed(1);
  let avgQuiz = (totalQuiz / students.length).toFixed(1);
  let avgAssign = Math.round(totalAssign / students.length);

  document.getElementById('anaAvgAttendance').textContent = avgAtt + '%';
  document.getElementById('anaAvgInternals').textContent = avgInternal + ' / ' + CONFIG.maxInternal;
  document.getElementById('anaAvgQuiz').textContent = avgQuiz + ' / ' + CONFIG.maxQuiz;
  document.getElementById('anaAvgAssignment').textContent = avgAssign + '%';

  document.getElementById('anaBarAttendance').style.width = avgAtt + '%';
  document.getElementById('anaBarInternals').style.width = Math.round((avgInternal / CONFIG.maxInternal) * 100) + '%';
  document.getElementById('anaBarQuiz').style.width = Math.round((avgQuiz / CONFIG.maxQuiz) * 100) + '%';
  document.getElementById('anaBarAssignment').style.width = avgAssign + '%';

  // Department-wise chart
  buildDeptChart(students);

  // Student comparison chart
  buildStudentChart(students);
}

/* Build department-wise vertical bar chart using CSS */
function buildDeptChart(students) {
  let container = document.getElementById('deptChart');

  // Group scores by department
  let deptScores = {};
  for (let i = 0; i < students.length; i++) {
    let dept = students[i].department;
    if (!deptScores[dept]) deptScores[dept] = [];
    deptScores[dept].push(calculateScore(students[i]));
  }

  let departments = Object.keys(deptScores);
  if (departments.length === 0) {
    container.innerHTML = '<p class="empty-message">No data available.</p>';
    return;
  }

  // Calculate average score per department
  let bars = '';
  for (let d = 0; d < departments.length; d++) {
    let dept = departments[d];
    let scores = deptScores[dept];
    let avg = 0;
    for (let j = 0; j < scores.length; j++) avg += scores[j];
    avg = Math.round(avg / scores.length);

    let height = Math.max(avg * 1.8, 4); // scale height for visibility
    bars += '<div class="bar-group">' +
      '<span class="bar-value">' + avg + '%</span>' +
      '<div class="bar-visual" style="height:' + height + 'px"></div>' +
      '<span class="bar-label">' + dept + '</span>' +
      '</div>';
  }

  container.innerHTML = '<div class="bar-chart">' + bars + '</div>';
}

/* Build student comparison horizontal bar chart */
function buildStudentChart(students) {
  let container = document.getElementById('studentChart');
  let html = '<div class="h-bar-chart">';

  // Sort by score descending for better visual
  let sorted = [];
  for (let i = 0; i < students.length; i++) {
    sorted.push({ name: students[i].name, score: calculateScore(students[i]) });
  }
  sorted.sort(function (a, b) { return b.score - a.score; });

  let colors = ['var(--green)', 'var(--orange)', 'var(--red)'];
  for (let i = 0; i < sorted.length; i++) {
    let color;
    if (sorted[i].score >= CONFIG.risk.low) color = colors[0];
    else if (sorted[i].score >= CONFIG.risk.medium) color = colors[1];
    else color = colors[2];

    html += '<div class="h-bar-row">' +
      '<span class="h-bar-name">' + sorted[i].name + '</span>' +
      '<div class="h-bar-track"><div class="h-bar-fill" style="width:' + sorted[i].score + '%; background:' + color + '"></div></div>' +
      '<span class="h-bar-val">' + sorted[i].score + '%</span>' +
      '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// -----------------------------------------------------------------
// MODULE 5: ATTENDANCE MONITORING
// -----------------------------------------------------------------
function showAttendance() {
  let students = getStudents();
  let tbody = document.getElementById('attendanceTableBody');
  tbody.innerHTML = '';

  let defaulters = 0, satisfactory = 0;

  if (students.length === 0) {
    document.getElementById('attEmptyMessage').style.display = 'block';
  } else {
    document.getElementById('attEmptyMessage').style.display = 'none';
  }

  for (let i = 0; i < students.length; i++) {
    let s = students[i];
    let status = getAttendanceStatus(s.attendance);

    if (s.attendance < CONFIG.attendanceStatus.satisfactory) defaulters++;
    else satisfactory++;

    let badgeClass = status === 'Satisfactory' ? 'badge-satisfactory' :
      (status === 'Warning' ? 'badge-warning' : 'badge-critical');

    let barColor = status === 'Satisfactory' ? 'var(--green)' :
      (status === 'Warning' ? 'var(--orange)' : 'var(--red)');

    let highlight = s.attendance < CONFIG.attendanceStatus.satisfactory ? ' style="background:#fef2f2;"' : '';

    let tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + (i + 1) + '</td>' +
      '<td>' + s.name + '</td>' +
      '<td>' + s.regNo + '</td>' +
      '<td>' + s.department + '</td>' +
      '<td>' + s.attendance + '%</td>' +
      '<td><div class="att-progress-track"><div class="att-progress-fill" style="width:' + s.attendance + '%; background:' + barColor + '"></div></div></td>' +
      '<td><span class="badge ' + badgeClass + '">' + status + '</span></td>';

    if (s.attendance < CONFIG.attendanceStatus.satisfactory) {
      tr.style.background = '#fef2f2';
    }
    tbody.appendChild(tr);
  }

  document.getElementById('attTotal').textContent = students.length;
  document.getElementById('attDefaulters').textContent = defaulters;
  document.getElementById('attSatisfactory').textContent = satisfactory;
}

// -----------------------------------------------------------------
// MODULE 6: REPORTS & EXPORTS
// -----------------------------------------------------------------

/* Show a report preview */
function showReport(type) {
  let students = getStudents();
  let content = document.getElementById('reportContent');
  let title = document.getElementById('reportPreviewTitle');

  if (students.length === 0) {
    content.innerHTML = '<p class="empty-message">No student data available for reporting.</p>';
    return;
  }

  if (type === 'summary') {
    title.textContent = 'Overall Academic Performance Summary';
    content.innerHTML = buildSummaryReport(students);
  } else if (type === 'performance') {
    title.textContent = 'Student Performance Report';
    content.innerHTML = buildPerformanceReport(students);
  } else if (type === 'defaulters') {
    title.textContent = 'Attendance Defaulter Report';
    content.innerHTML = buildDefaulterReport(students);
  }
}

/* Build summary report HTML */
function buildSummaryReport(students) {
  let total = students.length;
  let lowCount = 0, medCount = 0, highCount = 0;
  let totalScore = 0, totalAtt = 0;

  for (let i = 0; i < students.length; i++) {
    let score = calculateScore(students[i]);
    let risk = calculateRisk(score);
    if (risk === "Low") lowCount++;
    else if (risk === "Medium") medCount++;
    else highCount++;
    totalScore += score;
    totalAtt += students[i].attendance;
  }

  let html = '<div class="report-summary-grid">' +
    '<div class="report-stat"><span class="report-stat-label">Total Students</span><span class="report-stat-value">' + total + '</span></div>' +
    '<div class="report-stat"><span class="report-stat-label">Average Score</span><span class="report-stat-value">' + Math.round(totalScore / total) + '%</span></div>' +
    '<div class="report-stat"><span class="report-stat-label">Average Attendance</span><span class="report-stat-value">' + Math.round(totalAtt / total) + '%</span></div>' +
    '<div class="report-stat"><span class="report-stat-label">Low Risk</span><span class="report-stat-value" style="color:var(--green)">' + lowCount + '</span></div>' +
    '<div class="report-stat"><span class="report-stat-label">Medium Risk</span><span class="report-stat-value" style="color:var(--orange)">' + medCount + '</span></div>' +
    '<div class="report-stat"><span class="report-stat-label">High Risk</span><span class="report-stat-value" style="color:var(--red)">' + highCount + '</span></div>' +
    '</div>';

  return html;
}

/* Build student performance report table */
function buildPerformanceReport(students) {
  let html = '<table class="report-table"><thead><tr>' +
    '<th>Name</th><th>Reg No.</th><th>Dept</th><th>Attendance</th><th>Internals</th><th>Assignments</th><th>Quiz</th><th>Score</th><th>Risk</th>' +
    '</tr></thead><tbody>';

  for (let i = 0; i < students.length; i++) {
    let s = students[i];
    let score = calculateScore(s);
    let risk = calculateRisk(score);
    html += '<tr>' +
      '<td>' + s.name + '</td>' +
      '<td>' + s.regNo + '</td>' +
      '<td>' + s.department + '</td>' +
      '<td>' + s.attendance + '%</td>' +
      '<td>' + s.internalMarks + '/' + CONFIG.maxInternal + '</td>' +
      '<td>' + s.assignmentPct + '%</td>' +
      '<td>' + s.quizMarks + '/' + CONFIG.maxQuiz + '</td>' +
      '<td><strong>' + score + '%</strong></td>' +
      '<td><span class="badge badge-' + risk.toLowerCase() + '">' + risk + '</span></td>' +
      '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

/* Build attendance defaulter report */
function buildDefaulterReport(students) {
  let defaulters = students.filter(function (s) {
    return s.attendance < CONFIG.attendanceStatus.satisfactory;
  });

  if (defaulters.length === 0) {
    return '<p class="empty-message">No attendance defaulters found. All students have satisfactory attendance.</p>';
  }

  let html = '<p style="margin-bottom:12px; font-size:14px;"><strong>' + defaulters.length + '</strong> student(s) below ' + CONFIG.attendanceStatus.satisfactory + '% attendance.</p>';
  html += '<table class="report-table"><thead><tr>' +
    '<th>Name</th><th>Reg No.</th><th>Dept</th><th>Attendance</th><th>Status</th>' +
    '</tr></thead><tbody>';

  for (let i = 0; i < defaulters.length; i++) {
    let s = defaulters[i];
    let status = getAttendanceStatus(s.attendance);
    let badgeClass = status === 'Warning' ? 'badge-warning' : 'badge-critical';
    html += '<tr>' +
      '<td>' + s.name + '</td>' +
      '<td>' + s.regNo + '</td>' +
      '<td>' + s.department + '</td>' +
      '<td>' + s.attendance + '%</td>' +
      '<td><span class="badge ' + badgeClass + '">' + status + '</span></td>' +
      '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

/* Print the currently visible report */
function printReport() {
  window.print();
}

/* Export student records as CSV */
function exportCSV() {
  let students = getStudents();
  if (students.length === 0) {
    alert('No student data to export.');
    return;
  }

  let headers = ['Name', 'Reg No.', 'Department', 'Semester', 'Attendance %', 'Internal Marks', 'Assignment %', 'Quiz Marks', 'Overall Score', 'Risk Category'];
  let rows = [headers.join(',')];

  for (let i = 0; i < students.length; i++) {
    let s = students[i];
    let score = calculateScore(s);
    let risk = calculateRisk(score);
    let row = [
      '"' + s.name + '"',
      s.regNo,
      s.department,
      s.semester,
      s.attendance,
      s.internalMarks,
      s.assignmentPct,
      s.quizMarks,
      score,
      risk
    ];
    rows.push(row.join(','));
  }

  let csvContent = rows.join('\n');
  let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  let url = URL.createObjectURL(blob);

  let link = document.createElement('a');
  link.href = url;
  link.download = 'academic_risk_radar_report.csv';
  link.click();

  URL.revokeObjectURL(url);
}

// -----------------------------------------------------------------
// EVENT LISTENERS & INITIALISATION
// -----------------------------------------------------------------

/* Sidebar navigation clicks */
document.querySelectorAll('.nav-link').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    let section = this.getAttribute('data-section');
    navigateTo(section);
  });
});

/* Mobile menu toggle */
document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});

/* Close sidebar when clicking outside on mobile */
document.addEventListener('click', function (e) {
  let sidebar = document.getElementById('sidebar');
  let toggle = document.getElementById('menuToggle');
  if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

/* Initialise the application */
function init() {
  initSampleData();
  updateDashboard();
}

// Run on page load
init();
