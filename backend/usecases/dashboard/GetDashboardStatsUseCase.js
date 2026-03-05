class GetDashboardStatsUseCase {
    constructor(cameraRepository, eventRepository) {
        this.cameraRepository = cameraRepository;
        this.eventRepository = eventRepository;
    }

    async execute(userId, isAdmin) {
        const cameras = isAdmin
            ? await this.cameraRepository.findAll()
            : await this.cameraRepository.findAllByUser(userId);

        const totalCameras = cameras.length;
        const activeCameras = cameras.filter(c => c.status === 'Active').length;

        const allEvents = await this.eventRepository.findAll();
        const totalEvents = allEvents.length;

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentEvents = allEvents.filter(e => new Date(e.createdAt) > oneDayAgo).length;

        return { totalCameras, activeCameras, totalEvents, recentEvents };
    }
}

module.exports = GetDashboardStatsUseCase;
