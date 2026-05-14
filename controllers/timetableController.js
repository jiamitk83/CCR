const { Timetable, Period } = require('../models/Timetable');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const { ObjectId } = require('mongodb');

const timetableController = {
    // Get all timetables
    async getAll(req, res) {
        try {
            const timetables = await Timetable.getAll();
            const enriched = await enrichTimetables(timetables);
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get timetable by class
    async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const timetables = await Timetable.getByClass(classId);
            const enriched = await enrichTimetables(timetables);
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get timetable by class and day
    async getByClassAndDay(req, res) {
        try {
            const { classId, day } = req.params;
            const timetables = await Timetable.getByClassAndDay(classId, day);
            const enriched = await enrichTimetables(timetables);
            res.json(enriched);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Add timetable entry
    async addEntry(req, res) {
        try {
            const { classId, day, period, subjectId, teacherId, startTime, endTime, room } = req.body;
            
            if (!classId || !day || !period) {
                return res.status(400).json({ message: 'Class, day, and period are required' });
            }

            await Timetable.upsert(classId, day, period, subjectId, teacherId, startTime, endTime, room);
            res.json({ message: 'Timetable entry added successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Bulk add timetable entries
    async bulkAddEntries(req, res) {
        try {
            const { entries } = req.body;
            
            if (!entries || !Array.isArray(entries)) {
                return res.status(400).json({ message: 'Entries array is required' });
            }

            for (const entry of entries) {
                await Timetable.upsert(
                    entry.classId, entry.day, entry.period,
                    entry.subjectId, entry.teacherId,
                    entry.startTime, entry.endTime, entry.room
                );
            }

            res.json({ message: 'Timetable entries added successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete timetable entry
    async deleteEntry(req, res) {
        try {
            const result = await Timetable.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Timetable entry not found' });
            }
            res.json({ message: 'Timetable entry deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete timetable by class
    async deleteByClass(req, res) {
        try {
            const { classId } = req.params;
            await Timetable.deleteByClass(classId);
            res.json({ message: 'Class timetable deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Period management
    async getPeriods(req, res) {
        try {
            const periods = await Period.getAll();
            res.json(periods);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async addPeriod(req, res) {
        try {
            const { name, startTime, endTime, duration } = req.body;
            
            if (!name || !startTime || !endTime) {
                return res.status(400).json({ message: 'Name, start time, and end time are required' });
            }

            const result = await Period.create({ name, startTime, endTime, duration });
            res.status(201).json({ message: 'Period created successfully', periodId: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deletePeriod(req, res) {
        try {
            const result = await Period.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Period not found' });
            }
            res.json({ message: 'Period deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

// Helper function to enrich timetables with subject and teacher info
async function enrichTimetables(timetables) {
    const subjects = await Subject.getAll();
    const teachers = await Teacher.getAll();
    const classes = await Class.getAll();
    
    const subjectMap = {};
    subjects.forEach(s => subjectMap[s._id.toString()] = s.name);
    const teacherMap = {};
    teachers.forEach(t => teacherMap[t._id.toString()] = t.name);
    const classMap = {};
    classes.forEach(c => classMap[c._id.toString()] = c.name);

    return timetables.map(t => ({
        ...t,
        subjectName: t.subjectId ? subjectMap[t.subjectId.toString()] : 'Break',
        teacherName: t.teacherId ? teacherMap[t.teacherId.toString()] : 'N/A',
        className: t.classId ? classMap[t.classId.toString()] : 'N/A'
    }));
}

module.exports = timetableController;
