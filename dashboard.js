// Dashboard functionality

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set user name
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('avatarInitial').textContent = currentUser.name.charAt(0).toUpperCase();
    
    // Initialize sections
    initializeNavigation();
    initializeDashboard();
    initializeCourses();
    initializeAssignments();
    initializeGrades();
    initializeProfile();
    
    // Load data
    loadDashboardData();
});

// Navigation functionality
function initializeNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Remove active class from all items
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(s => {
                s.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(section + '-section').classList.add('active');
        });
    });
}

// Dashboard initialization
function initializeDashboard() {
    // Dashboard is already loaded by default
}

// Courses functionality
function initializeCourses() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    const courseModal = document.getElementById('courseModal');
    const courseForm = document.getElementById('courseForm');
    const closeModal = courseModal.querySelector('.close');
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', function() {
            courseModal.classList.add('show');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            courseModal.classList.remove('show');
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === courseModal) {
            courseModal.classList.remove('show');
        }
    });
    
    if (courseForm) {
        courseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const course = {
                id: Date.now().toString(),
                name: document.getElementById('courseName').value,
                code: document.getElementById('courseCode').value,
                instructor: document.getElementById('courseInstructor').value,
                description: document.getElementById('courseDescription').value,
                userId: getCurrentUser().id,
                createdAt: new Date().toISOString()
            };
            
            // Save course
            const courses = JSON.parse(localStorage.getItem('courses') || '[]');
            courses.push(course);
            localStorage.setItem('courses', JSON.stringify(courses));
            
            // Reset form and close modal
            courseForm.reset();
            courseModal.classList.remove('show');
            
            // Reload courses
            loadCourses();
            loadDashboardData();
        });
    }
}

// Assignments functionality
function initializeAssignments() {
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    const assignmentModal = document.getElementById('assignmentModal');
    const assignmentForm = document.getElementById('assignmentForm');
    const closeModal = assignmentModal.querySelector('.close');
    
    if (addAssignmentBtn) {
        addAssignmentBtn.addEventListener('click', function() {
            // Populate course dropdown
            populateCourseDropdown();
            assignmentModal.classList.add('show');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            assignmentModal.classList.remove('show');
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === assignmentModal) {
            assignmentModal.classList.remove('show');
        }
    });
    
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const assignment = {
                id: Date.now().toString(),
                title: document.getElementById('assignmentTitle').value,
                courseId: document.getElementById('assignmentCourse').value,
                courseName: document.getElementById('assignmentCourse').selectedOptions[0].text,
                dueDate: document.getElementById('assignmentDueDate').value,
                description: document.getElementById('assignmentDescription').value,
                userId: getCurrentUser().id,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            // Save assignment
            const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
            assignments.push(assignment);
            localStorage.setItem('assignments', JSON.stringify(assignments));
            
            // Reset form and close modal
            assignmentForm.reset();
            assignmentModal.classList.remove('show');
            
            // Reload assignments
            loadAssignments();
            loadDashboardData();
        });
    }
}

// Grades functionality
function initializeGrades() {
    // Grades are loaded when section is viewed
}

// Profile functionality
function initializeProfile() {
    // Profile is loaded when section is viewed
}

// Load dashboard data
function loadDashboardData() {
    const currentUser = getCurrentUser();
    const courses = getCourses();
    const assignments = getAssignments();
    const grades = getGrades();
    
    // Update stats
    document.getElementById('totalCourses').textContent = courses.length;
    
    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    document.getElementById('totalAssignments').textContent = pendingAssignments.length;
    
    // Calculate average grade
    if (grades.length > 0) {
        const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
        const avgScore = (totalScore / grades.length).toFixed(1);
        document.getElementById('averageGrade').textContent = avgScore + '%';
    } else {
        document.getElementById('averageGrade').textContent = '-';
    }
    
    // Calculate completion rate
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const completionRate = assignments.length > 0 
        ? Math.round((completedAssignments / assignments.length) * 100) 
        : 0;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    // Load recent activity
    loadRecentActivity();
}

// Load courses
function loadCourses() {
    const courses = getCourses();
    const coursesList = document.getElementById('coursesList');
    
    if (courses.length === 0) {
        coursesList.innerHTML = '<p class="empty-state">No courses enrolled. Add your first course!</p>';
        return;
    }
    
    coursesList.innerHTML = courses.map(course => `
        <div class="course-card">
            <h3>${escapeHtml(course.name)}</h3>
            <div class="course-code">${escapeHtml(course.code)}</div>
            <div class="course-instructor">Instructor: ${escapeHtml(course.instructor)}</div>
            <div class="course-description">${escapeHtml(course.description || 'No description')}</div>
            <div class="course-actions">
                <button class="btn btn-danger btn-small" onclick="deleteCourse('${course.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load assignments
function loadAssignments() {
    const assignments = getAssignments();
    const assignmentsList = document.getElementById('assignmentsList');
    
    if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p class="empty-state">No assignments yet. Create your first assignment!</p>';
        return;
    }
    
    assignmentsList.innerHTML = assignments.map(assignment => {
        const dueDate = new Date(assignment.dueDate).toLocaleDateString();
        const statusClass = assignment.status === 'completed' ? 'status-completed' : 'status-pending';
        const statusText = assignment.status === 'completed' ? 'Completed' : 'Pending';
        
        return `
            <div class="assignment-card">
                <div class="assignment-info">
                    <h3>${escapeHtml(assignment.title)}</h3>
                    <div class="assignment-meta">
                        <span>📚 ${escapeHtml(assignment.courseName)}</span>
                        <span>📅 Due: ${dueDate}</span>
                        <span class="assignment-status ${statusClass}">${statusText}</span>
                    </div>
                    ${assignment.description ? `<p style="margin-top: 8px; color: var(--text-secondary); font-size: 14px;">${escapeHtml(assignment.description)}</p>` : ''}
                </div>
                <div class="course-actions">
                    ${assignment.status === 'pending' 
                        ? `<button class="btn btn-primary btn-small" onclick="completeAssignment('${assignment.id}')">Mark Complete</button>`
                        : ''}
                    <button class="btn btn-danger btn-small" onclick="deleteAssignment('${assignment.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load grades
function loadGrades() {
    const grades = getGrades();
    const gradesTableBody = document.getElementById('gradesTableBody');
    
    if (grades.length === 0) {
        gradesTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No grades recorded yet</td></tr>';
        return;
    }
    
    gradesTableBody.innerHTML = grades.map(grade => {
        const gradeLetter = getGradeLetter(grade.score);
        const gradeClass = `grade-${gradeLetter}`;
        const date = new Date(grade.date).toLocaleDateString();
        
        return `
            <tr>
                <td>${escapeHtml(grade.courseName)}</td>
                <td>${escapeHtml(grade.assignmentTitle)}</td>
                <td>${grade.score}%</td>
                <td><span class="grade-badge ${gradeClass}">${gradeLetter}</span></td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
}

// Load recent activity
function loadRecentActivity() {
    const activities = [];
    const courses = getCourses();
    const assignments = getAssignments();
    
    // Add recent courses
    courses.slice(-3).forEach(course => {
        activities.push({
            text: `Enrolled in ${course.name} (${course.code})`,
            date: new Date(course.createdAt)
        });
    });
    
    // Add recent assignments
    assignments.slice(-3).forEach(assignment => {
        activities.push({
            text: `${assignment.status === 'completed' ? 'Completed' : 'Created'} assignment: ${assignment.title}`,
            date: new Date(assignment.createdAt)
        });
    });
    
    // Sort by date
    activities.sort((a, b) => b.date - a.date);
    
    const activityList = document.getElementById('recentActivityList');
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <p>${escapeHtml(activity.text)}</p>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                ${activity.date.toLocaleDateString()} ${activity.date.toLocaleTimeString()}
            </p>
        </div>
    `).join('');
}

// Load profile data
function loadProfile() {
    const courses = getCourses();
    const assignments = getAssignments();
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    
    document.getElementById('profileCourses').textContent = courses.length;
    document.getElementById('profileAssignments').textContent = completedAssignments;
}

// Helper functions
function getCourses() {
    const currentUser = getCurrentUser();
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    return courses.filter(c => c.userId === currentUser.id);
}

function getAssignments() {
    const currentUser = getCurrentUser();
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    return assignments.filter(a => a.userId === currentUser.id);
}

function getGrades() {
    const currentUser = getCurrentUser();
    const grades = JSON.parse(localStorage.getItem('grades') || '[]');
    return grades.filter(g => g.userId === currentUser.id);
}

function populateCourseDropdown() {
    const courses = getCourses();
    const dropdown = document.getElementById('assignmentCourse');
    
    dropdown.innerHTML = '<option value="">Select a course</option>';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.code} - ${course.name}`;
        dropdown.appendChild(option);
    });
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const filtered = courses.filter(c => c.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(filtered));
        loadCourses();
        loadDashboardData();
    }
}

function deleteAssignment(assignmentId) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const filtered = assignments.filter(a => a.id !== assignmentId);
        localStorage.setItem('assignments', JSON.stringify(filtered));
        loadAssignments();
        loadDashboardData();
    }
}

function completeAssignment(assignmentId) {
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (assignment) {
        assignment.status = 'completed';
        localStorage.setItem('assignments', JSON.stringify(assignments));
        
        // Add grade (random score for demo, in real app this would come from instructor)
        const grade = {
            id: Date.now().toString(),
            userId: getCurrentUser().id,
            courseId: assignment.courseId,
            courseName: assignment.courseName,
            assignmentId: assignmentId,
            assignmentTitle: assignment.title,
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            date: new Date().toISOString()
        };
        
        const grades = JSON.parse(localStorage.getItem('grades') || '[]');
        grades.push(grade);
        localStorage.setItem('grades', JSON.stringify(grades));
        
        loadAssignments();
        loadDashboardData();
    }
}

function getGradeLetter(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update sections when menu items are clicked
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            if (section === 'courses') {
                loadCourses();
            } else if (section === 'assignments') {
                loadAssignments();
            } else if (section === 'grades') {
                loadGrades();
            } else if (section === 'profile') {
                loadProfile();
            }
        });
    });
});

