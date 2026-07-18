const EventModel = require('../models/EventModel');
const IEventRepository = require('../../domain/repositories/IEventRepository');

class EventRepository extends IEventRepository {
    async findAll() {
        return await EventModel.find().sort({ createdAt: -1 });
    }

    async findRecent(limit) {
        return await EventModel.find().sort({ createdAt: -1 }).limit(limit);
    }

    async create(eventData) {
        const event = new EventModel(eventData);
        return await event.save();
    }

    async acknowledge(id) {
        return await EventModel.findByIdAndUpdate(id, { acknowledged: true }, { new: true });
    }

    async setFeedback(id, feedback) {
        return await EventModel.findByIdAndUpdate(id, { feedback }, { new: true });
    }
}

module.exports = EventRepository;
