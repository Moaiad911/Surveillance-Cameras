# Camera API Documentation

## Base URL
All API requests start with:
`http://localhost:5000/api`

## Authentication
**Important**: You must include the **JWT Token** in the headers for all request.
Get the token from the Login response (`response.data.token`).

**Header Format:**
```json
{
  "Authorization": "Bearer <YOUR_TOKEN_HERE>"
}
```

## Endpoints

### 1. Get All Cameras
- **Description**: Returns a list of cameras created by the currently logged-in user.
- **Method**: `GET`
- **URL**: `/cameras`
- **Response**: Array of camera objects.

### 2. Create Camera
- **Description**: Creates a new camera entry.
- **Method**: `POST`
- **URL**: `/cameras`
- **Body**:
  ```json
  {
    "name": "Front Door",
    "streamURL": "rtsp://...",
    "location": "Main Entrance",
    "status": "Active" // Optional, default is 'Active'
  }
  ```

### 3. Update Camera
- **Description**: Updates an existing camera.
- **Method**: `PUT`
- **URL**: `/cameras/:id` (e.g., `/cameras/65b12...`)
- **Body**: (Send only fields you want to update)
  ```json
  {
    "name": "New Name",
    "status": "Inactive"
  }
  ```

### 4. Delete Camera
- **Description**: Deletes a camera.
- **Method**: `DELETE`
- **URL**: `/cameras/:id`

## Javascript Example (Axios)

```javascript
import axios from 'axios';

// 1. Setup Axios with Token
// Ensure you have stored the token (e.g., in localStorage) after login
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}` 
  }
});

// 2. Fetch Cameras
const fetchCameras = async () => {
  try {
    const response = await api.get('/cameras');
    console.log('My Cameras:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```
