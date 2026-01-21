/**
 * API Wrapper for interacting with json-server
 */

const API_BASE_URL = 'http://localhost:3001';

const api = {
    // Fetch all users (for simulated login/signup checks)
    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/users`);
        return response.json();
    },

    // Register a new user
    registerUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    // Fetch all courses
    getCourses: async () => {
        const response = await fetch(`${API_BASE_URL}/courses`);
        return response.json();
    },

    // Fetch a single course by ID
    getCourseById: async (courseId) => {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        return response.json();
    },

    // Fetch enrollments
    getEnrollments: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/enrollments?userId=${userId}`);
        const enrollments = await response.json();

        // Manually "join" to get course details for each enrollment
        // Json-server supports _expand but explicit fetching is safer for this simulation
        const coursePromises = enrollments.map(async (enrollment) => {
            const course = await api.getCourseById(enrollment.courseId);
            return {
                ...enrollment,
                course
            };
        });

        return Promise.all(coursePromises);
    },

    // Check if user is enrolled in a course
    checkEnrollment: async (userId, courseId) => {
        const response = await fetch(`${API_BASE_URL}/enrollments?userId=${userId}&courseId=${courseId}`);
        const data = await response.json();
        return data.length > 0;
    },

    // Enroll in a course
    enroll: async (userId, courseId) => {
        const response = await fetch(`${API_BASE_URL}/enrollments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                courseId,
                date: new Date().toISOString()
            })
        });
        return response.json();
    }
};

// Export to global scope
window.api = api;
