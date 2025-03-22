# 🗨️ Yapster – Real-Time Chat App with AI-Powered Replies

Yapster is a **real-time chat application** built with **MERN, TypeScript, and Socket.IO**, featuring:
✅ AI-generated reply suggestions 🤖  
✅ Infinite scrolling & real-time messaging 💬  
✅ Customizable themes (32 options!) 🎨  
✅ Profile picture upload with Cloudinary 📸  
✅ Online/offline user tracking 🟢🔴

🔗 **Live Demo:** [https://chat-app-vue8.onrender.com/]

---

## 🚀 Features

- **Real-time messaging** (text & image support)
- **AI-powered reply suggestions** (hover over messages to use AI)
- **User authentication (JWT)** – Login & registration
- **Infinite scrolling** for message history
- **Real-time online/offline status**
- **Custom themes** (Daisy UI, Tailwind CSS)
- **Profile management** (update profile picture)
- **Mobile-friendly & responsive UI**
- **Loading states & skeletons** for smooth UX
- **Emoji** Express yourself with emojis

---

## 🛠️ Tech Stack

### Frontend

- React (Vite) ⚡
- TypeScript
- Tailwind CSS & Daisy UI 🎨
- Zustand (state management)
- React Router
- Axios
- React Hot Toast

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (real-time messaging)
- JWT for authentication
- bcrypt (password encryption)
- Cloudinary (image upload)
- Nodemon (dev mode)

---

## 🔐 Security & Performance Features

### 🔒 Login & Account Protection

- Brute Force Defense - Automatic 2-hour account lock after 5 failed attempts
- Progressive Security - Clear attempt counter on success, real-time lock status
- Credential Safety - Military-grade bcrypt password encryption
- Session Security - JWT token authentication with HTTP-only cookies

### 🔄 Intelligent Caching System

- Smart Message Caching - Instant message history access for frequent chats
- Auto-Clean Memory - Removes oldest unused data (LRU) after 50 entries
- Freshness Guarantee - All cached data expires after 5 minutes
- Efficiency Boost - 40%+ fewer API calls for common actions

---

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/7ed9ff63-9461-409f-9b15-8ad06b81ba95)
![image](https://github.com/user-attachments/assets/ba8d154d-cef5-44b5-980d-2c31d9323269)
![image](https://github.com/user-attachments/assets/4b3e1b4d-47fb-414d-b1bf-10a3a2937d02)
![image](https://github.com/user-attachments/assets/23d96339-0502-407e-9e4e-29520800d107)
![image](https://github.com/user-attachments/assets/bdff4d38-6426-40f2-8a16-55f7664e4ead)
![image](https://github.com/user-attachments/assets/5b4a298a-12fb-40ea-a177-923fb6839911)
![image](https://github.com/user-attachments/assets/110af312-7e21-41cd-a8fb-84e4a2962df1)

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/nnerb/chat-app.git
cd chat-app
```

### 2️⃣ Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

### 3️⃣ Set Up Environment Variables

Create a **.env** file in the backend folder and add:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_api_key
```

### 4️⃣ Run the Application

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm run dev
```

---

## 🔥 Future Improvements

- ✅ Group chat feature
- ✅ Message reactions
- ✅ Read receipts
- ✅ Push notifications

---

## 📺 Inspiration

This project was inspired by [this YouTube tutorial](https://www.youtube.com/watch?v=ntKkVrQqBYY) with modifications and enhanced features.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## 📜 License

This project is licensed under the **MIT License**.
