# ChatApp - Modern Real-time Chat Application

A beautiful, feature-rich chat application built with React, Firebase, and modern web technologies. Features real-time messaging, user profiles, admin controls, and a stunning UI design.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication** - Email/password sign up and sign in
- **User Profiles** - Customizable profiles with photos, usernames, and bios
- **Profile Photo Upload** - Upload and manage profile pictures with Firebase Storage
- **User Roles** - Admin and regular user roles with different permissions

### 💬 Real-time Messaging
- **Instant Messaging** - Real-time chat with other users
- **Message History** - Persistent message storage
- **Online Status** - See who's online in real-time
- **Message Timestamps** - Organized by date and time
- **Modern Chat UI** - Beautiful message bubbles and interface

### 👥 Social Features
- **Follow System** - Follow and unfollow other users
- **User Search** - Find users by name, username, or email
- **User Discovery** - Browse all registered users
- **Admin Controls** - Monitor and manage users and messages

### 🎨 Modern UI/UX
- **Beautiful Design** - Modern gradient design with glass effects
- **Responsive Layout** - Works perfectly on desktop and mobile
- **Smooth Animations** - Delightful micro-interactions
- **Dark/Light Theme** - Elegant color schemes
- **Mobile Optimized** - Collapsible sidebar for mobile devices

### 🛡️ Admin Features
- **Message Monitoring** - Admins can view all messages
- **User Management** - Delete users and manage accounts
- **Admin Panel** - Dedicated interface for administrative tasks
- **Role-based Access** - Secure admin-only features

## 🚀 Tech Stack

- **Frontend**: React 18, Vite
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

### 4. Firebase Configuration

Update `src/firebase/config.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. Firestore Security Rules

Deploy the security rules from `firestore.rules` to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

Or copy the rules from the `firestore.rules` file in the project root.

### 6. Storage Security Rules

Set up Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Getting Started
1. **Sign Up** - Create a new account (first user becomes admin)
2. **Sign In** - Use your credentials to log in
3. **Customize Profile** - Upload photo, set username, and bio
4. **Find Users** - Search and browse other users
5. **Start Chatting** - Click on any user to start a conversation

### Admin Features
- **Admin Panel** - Access via the shield icon in the header
- **User Management** - View and delete users
- **Message Monitoring** - View all messages in the system
- **Admin Badge** - Admins are marked with a crown icon

### Social Features
- **Follow Users** - Click the follow button on user cards
- **Profile Management** - Edit your profile information
- **Photo Upload** - Change your profile picture

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.jsx          # Beautiful login/signup form
│   ├── Dashboard.jsx     # Main application layout
│   ├── UserList.jsx      # User list with follow functionality
│   ├── Chat.jsx          # Modern chat interface
│   ├── Profile.jsx       # User profile management
│   └── AdminPanel.jsx    # Admin controls and monitoring
├── contexts/
│   ├── AuthContext.jsx   # Authentication and user management
│   └── ChatContext.jsx   # Real-time messaging functionality
├── firebase/
│   └── config.js         # Firebase configuration
├── App.jsx               # Main app component with routing
├── main.jsx              # Application entry point
└── index.css             # Global styles and design system
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Customization
- **Colors**: Modify the CSS custom properties in `index.css`
- **Icons**: Replace Lucide React icons with your preferred icon library
- **Styling**: Update the design system classes in `index.css`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Lucide React for beautiful icons
- React Hot Toast for notifications
- The open-source community for inspiration

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using React, Firebase, and modern web technologies.**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
