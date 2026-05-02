const GetDashboardStatsUseCase = require('../../usecases/dashboard/GetDashboardStatsUseCase');
const GetRecentEventsUseCase = require('../../usecases/dashboard/GetRecentEventsUseCase');
const CameraRepository = require('../../infrastructure/repositories/CameraRepository');
const EventRepository = require('../../infrastructure/repositories/EventRepository');

const cameraRepository = new CameraRepository();
const eventRepository = new EventRepository();
const getDashboardStats = new GetDashboardStatsUseCase(cameraRepository, eventRepository);
const getRecentEvents = new GetRecentEventsUseCase(eventRepository);

exports.getStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        const stats = await getDashboardStats.execute(req.user._id, isAdmin);
        res.status(200).json(stats);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.getRecentEvents = async (req, res) => {
    try {
        const events = await getRecentEvents.execute();
        res.status(200).json(events);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};
