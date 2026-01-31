const Camera = require('../models/Camera');

// Create a new camera
exports.createCamera = async (req, res) => {
    try {
        const { name, streamURL, location, status } = req.body;

        // Validation
        if (!name || !streamURL || !location) {
            return res.status(400).json({ message: 'Name, Stream URL, and Location are required' });
        }

        const newCamera = new Camera({
            name,
            streamURL,
            location,
            status: status || 'Active',
            createdBy: req.user._id // Assign current user
        });

        const savedCamera = await newCamera.save();

        res.status(201).json({
            message: 'Camera created successfully',
            camera: savedCamera
        });
    } catch (error) {
        console.error('Create Camera Error:', error);
        res.status(500).json({ message: 'Server error while creating camera' });
    }
};

// Get all cameras (Scoped to User)
exports.getAllCameras = async (req, res) => {
    try {
        // Only fetch cameras created by the logged-in user
        const cameras = await Camera.find({ createdBy: req.user._id });
        res.status(200).json(cameras);
    } catch (error) {
        console.error('Get Cameras Error:', error);
        res.status(500).json({ message: 'Server error while fetching cameras' });
    }
};

// Get a single camera by ID
exports.getCameraById = async (req, res) => {
    try {
        const camera = await Camera.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!camera) {
            return res.status(404).json({ message: 'Camera not found or access denied' });
        }

        res.status(200).json(camera);
    } catch (error) {
        console.error('Get Camera Error:', error);
        res.status(500).json({ message: 'Server error while fetching camera' });
    }
};

// Update a camera
exports.updateCamera = async (req, res) => {
    try {
        const { name, streamURL, location, status } = req.body;

        const camera = await Camera.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!camera) {
            return res.status(404).json({ message: 'Camera not found or access denied' });
        }

        // Update fields if provided
        if (name) camera.name = name;
        if (streamURL) camera.streamURL = streamURL;
        if (location) camera.location = location;
        if (status) camera.status = status;

        const updatedCamera = await camera.save();

        res.status(200).json({
            message: 'Camera updated successfully',
            camera: updatedCamera
        });
    } catch (error) {
        console.error('Update Camera Error:', error);
        res.status(500).json({ message: 'Server error while updating camera' });
    }
};

// Delete a camera
exports.deleteCamera = async (req, res) => {
    try {
        const camera = await Camera.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!camera) {
            return res.status(404).json({ message: 'Camera not found or access denied' });
        }

        await camera.deleteOne();

        res.status(200).json({ message: 'Camera deleted successfully' });
    } catch (error) {
        console.error('Delete Camera Error:', error);
        res.status(500).json({ message: 'Server error while deleting camera' });
    }
};
