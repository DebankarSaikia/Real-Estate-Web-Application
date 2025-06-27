
# 🏠 Real Estate Web Application

A full-featured real estate platform enabling users to register, list properties, manage their listings,  and maintain personal profiles.

## 🚀 Features

### 1. 🔐 User Authentication

* **Registration & Login**: Secure user sign-up and login functionalities.
* **Password Encryption**: Utilizes `bcrypt` for hashing user passwords.

### 2. 🏘️ Property Listings

* **Comprehensive Details**: Display properties with images, price, location, and descriptions.
* **Search & Filter**: Users can search and filter properties based on:

  * Location
  * Price range
 **Detailed View**: Access in-depth information for individual properties.

### 3. 🛠️ Property Management

* **Add Listings**: Users can add new properties with complete details.
* **Edit Listings**: Modify existing property details.
* **Delete Listings**: Remove properties from the platform.
* **Ownership Restrictions**: Only property owners can edit or delete their listings.

### 5. 👤 User Profile Management

* **Edit Profile**: Update personal information including name, email, and contact details.
* **Activity Overview**:
  * Listed properties
    
 ### 💬 6. Real-Time Messaging System Add commentMore actions
- **Instant Messaging**: Authenticated users can send and receive messages in real time.
- **Socket.IO Integration**: Enables responsive and real-time communication.
- **Contextual Chat**: Messaging tied to property listings for focused discussions.
  
### ⏱️ 7. Auto Property Delete 
- **Automatic Expiry**: Properties are automatically deleted after a set duration.
- **Clean Platform**: Keeps the listing page free from outdated properties.
- **Hands-Free Maintenance**: Reduces the need for manual deletion by owners.

## 🛠️ Tech Stack

* **Frontend**: React.js
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **Authentication**: JWT, bcrypt

## 📦 Installation & Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/zephyr-winter-internship-2025/zephyr-winter-2025-05.git
   cd real-estate-app
   ```

2. **Install Dependencies**:

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Variables**:

   * Create a `.env` file in the `backend` directory with the following:

     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the Application**:

   ```bash
   # Backend
   cd api
   npm start

   # Frontend
   cd client
   npm run dev
   ```
