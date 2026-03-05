class GetRecentEventsUseCase {
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }

    async execute() {
        return await this.eventRepository.findRecent(10);
    }
}

module.exports = GetRecentEventsUseCase;
