const UploadRecordingUseCase = require('../../usecases/recording/UploadRecordingUseCase');
const GetRecordingsUseCase = require('../../usecases/recording/GetRecordingsUseCase');
const DeleteRecordingUseCase = require('../../usecases/recording/DeleteRecordingUseCase');
const RecordingRepository = require('../../infrastructure/repositories/RecordingRepository');
const CameraRepository = require('../../infrastructure/repositories/CameraRepository');

const recordingRepository = new RecordingRepository();
const cameraRepository = new CameraRepository();
const uploadRecording = new UploadRecordingUseCase(recordingRepository, cameraRepository);
const getRecordings = new GetRecordingsUseCase(recordingRepository, cameraRepository);
const deleteRecording = new DeleteRecordingUseCase(recordingRepository);

exports.uploadRecording = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        const recording = await uploadRecording.execute(req.file, req.params.cameraId, req.user._id, isAdmin);
        res.status(201).json({ message: 'Recording uploaded successfully', recording });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.getRecordings = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        const recordings = await getRecordings.execute(req.params.cameraId, req.user._id, isAdmin);
        res.status(200).json(recordings);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.deleteRecording = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        await deleteRecording.execute(req.params.id, isAdmin);
        res.status(200).json({ message: 'Recording deleted successfully' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};
