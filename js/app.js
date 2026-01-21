/**
 * Main Application Logic V2
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// State
let currentState = {
    view: 'home', // home, login, signup, dashboard, courses, course-detail, profile
    user: null,
    courses: [],
    enrollments: []
};

// Initialization
function initApp() {
    checkUserSession();
    setupNavigation();
    // If on load we have a hash or default logic
    renderView();
}

// Check if user is already logged in
function checkUserSession() {
    const user = utils.getUserFromLocal();
    if (user) {
        currentState.user = user;
        if (!currentState.view || currentState.view === 'home') {
            currentState.view = 'dashboard';
        }
    } else {
        currentState.view = 'courses'; // Landing page for guests
    }
}

// Setup Navigation & Event Listeners
function setupNavigation() {
    document.body.addEventListener('click', (e) => {
        // Nav Links
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        }

        // Auth Links
        if (e.target.id === 'linkToSignup') {
            e.preventDefault();
            navigateTo('signup');
        }
        if (e.target.id === 'linkToLogin') {
            e.preventDefault();
            navigateTo('login');
        }

        // Logout
        if (e.target.id === 'logoutBtn') {
            e.preventDefault();
            logout();
        }

        // Course Click (View Details)
        if (e.target.closest('.view-course-btn')) {
            const btn = e.target.closest('.view-course-btn');
            const courseId = parseInt(btn.dataset.courseId);
            navigateTo('course-detail', { courseId });
        }

        // Back Button
        if (e.target.id === 'backButton') {
            navigateTo('courses');
        }
    });
}

// Navigation Handler
function navigateTo(view, params = {}) {
    currentState.view = view;
    currentState.params = params;
    renderView();
    window.scrollTo(0, 0);
}

// Render the current view
async function renderView() {
    updateNavbar();
    const contentDiv = document.getElementById('mainContent');
    contentDiv.innerHTML = ''; // Clear content

    switch (currentState.view) {
        case 'login':
            renderLogin(contentDiv);
            break;
        case 'signup':
            renderSignup(contentDiv);
            break;
        case 'dashboard':
            if (!currentState.user) {
                navigateTo('login');
                return;
            }
            await renderDashboard(contentDiv);
            break;
        case 'profile':
            if (!currentState.user) {
                navigateTo('login');
                return;
            }
            await renderProfile(contentDiv);
            break;
        case 'courses':
            await renderCatalog(contentDiv);
            break;
        case 'course-detail':
            await renderCourseDetail(contentDiv, currentState.params.courseId);
            break;
        default:
            await renderCatalog(contentDiv);
    }
}

// Update Navbar
function updateNavbar() {
    const navLinks = document.getElementById('navLinks');
    const authButtons = document.getElementById('authButtons');

    if (currentState.user) {
        // User Logged In
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link ${currentState.view === 'dashboard' ? 'active' : ''}" href="#" data-page="dashboard">Dashboard</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentState.view === 'courses' ? 'active' : ''}" href="#" data-page="courses">Courses</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentState.view === 'profile' ? 'active' : ''}" href="#" data-page="profile">Profile</a>
            </li>
        `;
        authButtons.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle d-flex align-items-center rounded-pill px-3" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-2"></i> ${currentState.user.name.split(' ')[0]}
                </button>
                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                    <li><a class="dropdown-item" href="#" data-page="profile">My Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Logout</a></li>
                </ul>
            </div>
        `;
    } else {
        // Guest
        navLinks.innerHTML = `
             <li class="nav-item">
                <a class="nav-link ${currentState.view === 'courses' ? 'active' : ''}" href="#" data-page="courses">Courses</a>
            </li>
        `;
        authButtons.innerHTML = `
            <button class="btn btn-outline-primary d-none d-lg-block me-2 px-4 rounded-pill" onclick="navigateTo('login')">Login</button>
            <button class="btn btn-primary px-4 rounded-pill" onclick="navigateTo('signup')">Sign Up</button>
        `;
    }
}

// --- Render Functions ---

function renderLogin(container) {
    const template = document.getElementById('loginViewTemplate');
    container.appendChild(template.content.cloneNode(true));

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const users = await api.getUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                utils.saveUserToLocal(user);
                currentState.user = user;
                navigateTo('dashboard');
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            alert('Login failed. Is json-server running?');
        }
    });
}

function renderSignup(container) {
    const template = document.getElementById('signupViewTemplate');
    container.appendChild(template.content.cloneNode(true));

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUser = {
            username: e.target.username.value,
            password: e.target.password.value,
            name: e.target.name.value,
            type: 'student',
            bio: 'New student',
            profileImage: `https://ui-avatars.com/api/?name=${e.target.name.value}&background=random`,
            id: Date.now()
        };

        try {
            const users = await api.getUsers();
            if (users.find(u => u.username === newUser.username)) {
                alert('Username already exists');
                return;
            }

            await api.registerUser(newUser);
            alert('Registration successful! Please login.');
            navigateTo('login');
        } catch (err) {
            console.error(err);
            alert('Registration failed');
        }
    });
}

async function renderDashboard(container) {
    const template = document.getElementById('dashboardViewTemplate');
    container.appendChild(template.content.cloneNode(true));

    document.getElementById('welcomeMessage').textContent = `Ready to continue your learning journey, ${currentState.user.name}?`;

    try {
        const enrollments = await api.getEnrollments(currentState.user.id);
        const listContainer = document.getElementById('myCoursesList');
        const noMsg = document.getElementById('noEnrollmentsMsg');

        if (enrollments.length === 0) {
            noMsg.classList.remove('d-none');
        } else {
            enrollments.forEach(enrollment => {
                const course = enrollment.course;
                const card = createCourseCard(course, true); // true = enrolled view
                listContainer.appendChild(card);
            });
        }
    } catch (err) {
        console.error(err);
        container.innerHTML += '<div class="alert alert-danger mx-3">Failed to load enrollments. Check if server is running.</div>';
    }
}

async function renderCatalog(container) {
    const template = document.getElementById('catalogViewTemplate');
    container.appendChild(template.content.cloneNode(true));

    try {
        const courses = await api.getCourses();
        const listContainer = document.getElementById('allCoursesList');

        courses.forEach(course => {
            const card = createCourseCard(course, false);
            listContainer.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML += '<div class="alert alert-danger container mt-3">Failed to load courses. Check if server is running on port 3001.</div>';
    }
}

async function renderCourseDetail(container, courseId) {
    const template = document.getElementById('courseDetailViewTemplate');
    container.appendChild(template.content.cloneNode(true));

    try {
        const course = await api.getCourseById(courseId);

        // Basic Info
        document.getElementById('detailTitle').textContent = course.title;
        document.getElementById('detailDesc').textContent = course.description;
        document.getElementById('detailThumbnail').src = course.thumbnail;

        // New Metadata fields (optional chaining safety)
        document.getElementById('detailInstructor').textContent = course.instructor || "Antigravity Expert";
        document.getElementById('detailDuration').textContent = course.duration || "Self-Paced";
        document.getElementById('detailLevel').textContent = course.level || "All Levels";

        // Lessons List
        const lessonList = document.getElementById('lessonList');
        const lessons = course.lessons || ["Module 1: Introduction", "Module 2: Core Concepts", "Module 3: Project"];
        lessons.forEach((lesson, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex align-items-center justify-content-between';
            li.innerHTML = `
                <div><i class="bi bi-play-circle me-3 text-primary"></i> ${lesson}</div>
                <span class="badge bg-light text-secondary rounded-pill">10m</span>
            `;
            lessonList.appendChild(li);
        });

        // Check Enrollment
        let isEnrolled = false;
        if (currentState.user) {
            isEnrolled = await api.checkEnrollment(currentState.user.id, courseId);
        }

        const videoSection = document.getElementById('videoSection');
        const enrollSection = document.getElementById('enrollSection');
        const enrolledBadge = document.getElementById('enrolledBadge');
        const enrollBtn = document.getElementById('enrollBtn');
        const videoPlayer = document.getElementById('courseVideo');

        if (isEnrolled) {
            videoSection.classList.remove('d-none');
            enrollSection.classList.add('d-none');
            enrolledBadge.classList.remove('d-none');
            videoPlayer.src = course.videoUrl;
        } else {
            videoSection.classList.add('d-none');
            enrollSection.classList.remove('d-none');
            enrolledBadge.classList.add('d-none');

            enrollBtn.onclick = async () => {
                if (!currentState.user) {
                    alert('Please login to enroll');
                    navigateTo('login');
                    return;
                }

                try {
                    await api.enroll(currentState.user.id, courseId);
                    alert('Enrolled successfully!');
                    renderCourseDetail(container, courseId);
                } catch (err) {
                    console.error(err);
                    alert('Enrollment failed');
                }
            };
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="alert alert-danger m-5">Error loading course.</div>';
    }
}

async function renderProfile(container) {
    const template = document.getElementById('profileViewTemplate');
    container.appendChild(template.content.cloneNode(true));

    const user = currentState.user;

    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileBio').textContent = user.bio || "No bio yet.";
    if (user.profileImage) {
        document.getElementById('profileImage').src = user.profileImage;
    }

    // Fetch stats
    try {
        const enrollments = await api.getEnrollments(user.id);
        document.getElementById('profileCourseCount').textContent = enrollments.length;
    } catch (e) {
        console.error(e);
    }
}

// Helper to create Course Card HTML element
function createCourseCard(course, isEnrolled) {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
        <div class="card h-100 course-card">
            <img src="${course.thumbnail}" class="card-img-top" alt="${course.title}">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-light text-primary border border-primary-subtle">${course.level || 'Course'}</span>
                    <small class="text-muted"><i class="bi bi-clock"></i> ${course.duration || 'Flexible'}</small>
                </div>
                <h5 class="card-title">${course.title}</h5>
                <p class="card-text text-secondary text-truncate">${course.description}</p>
                <div class="mt-auto pt-3">
                    <button class="btn ${isEnrolled ? 'btn-success' : 'btn-outline-primary'} w-100 view-course-btn" data-course-id="${course.id}">
                        ${isEnrolled ? '<i class="bi bi-play-fill"></i> Continue Learning' : 'View Details'}
                    </button>
                </div>
            </div>
        </div>
    `;

    return col;
}

function logout() {
    utils.clearUser();
    currentState.user = null;
    navigateTo('login');
}
