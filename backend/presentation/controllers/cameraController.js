const CreateCameraUseCase = require('../../usecases/camera/CreateCameraUseCase');
const GetCamerasUseCase = require('../../usecases/camera/GetCamerasUseCase');
const GetCameraByIdUseCase = require('../../usecases/camera/GetCameraByIdUseCase');
const UpdateCameraUseCase = require('../../usecases/camera/UpdateCameraUseCase');
const DeleteCameraUseCase = require('../../usecases/camera/DeleteCameraUseCase');
const CameraRepository = require('../../infrastructure/repositories/CameraRepository');

const cameraRepository = new CameraRepository();
const createCamera = new CreateCameraUseCase(cameraRepository);
const getCameras = new GetCamerasUseCase(cameraRepository);
const getCameraById = new GetCameraByIdUseCase(cameraRepository);
const updateCamera = new UpdateCameraUseCase(cameraRepository);
const deleteCamera = new DeleteCameraUseCase(cameraRepository);

exports.createCamera = async (req, res) => {
    try {
        const camera = await createCamera.execute(req.body, req.user._id);
        res.status(201).json({ message: 'Camera created successfully', camera });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.getAllCameras = async (req, res) => {
    try {
        const cameras = await getCameras.execute(req.user._id);
        res.status(200).json(cameras);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.getCameraById = async (req, res) => {
    try {
        const camera = await getCameraById.execute(req.params.id, req.user._id);
        res.status(200).json(camera);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.updateCamera = async (req, res) => {
    try {
        const camera = await updateCamera.execute(req.params.id, req.user._id, req.body);
        res.status(200).json({ message: 'Camera updated successfully', camera });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.deleteCamera = async (req, res) => {
    try {
        await deleteCamera.execute(req.params.id, req.user._id);
        res.status(200).json({ message: 'Camera deleted successfully' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};
