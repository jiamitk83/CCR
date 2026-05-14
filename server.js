const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');
const { connectDB } = require('./config/db');

const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const statusRoutes = require('./routes/statusRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const teacherAllotmentRoutes = require('./routes/teacherAllotmentRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');

// New ERP modules
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');



const app = express();
const port = 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Session configuration
// Use environment variable or generate random secret for development
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/courseCompletionDB',
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false // set to true in production with HTTPS
    }
}));

// Serve static files
app.use(express.static('public'));
app.use(express.static('.')); // Serve root HTML files

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); // Registration is public

// Protected routes (authentication and authorization handled in route files)
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-allotments', teacherAllotmentRoutes);
app.use('/api/stats', statsRoutes);

// New ERP module routes
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/homework', homeworkRoutes);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;