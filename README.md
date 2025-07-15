# AnonBridge - Secure Anonymous Communication Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

<div align="center">
  <h3>🔒 Secure • Anonymous • Futuristic</h3>
  <p>A cyberpunk-themed anonymous communication platform connecting students and faculty at Manipal University</p>
</div>

---

## 🌟 Features

### 🎭 **Anonymous Communication**
- Complete anonymity with generated IDs (Student#123, Faculty#456)
- End-to-end encrypted conversations
- Zero data retention policy
- Privacy-first architecture

### 💬 **Real-time Chat System**
- Instant messaging between students and faculty
- Message status indicators (sent, delivered, read)
- Typing indicators and presence status
- File sharing and emoji support

### 🎨 **Cyberpunk Theme System**
- 6 unique cyberpunk color themes
- 7 animated background styles
- Customizable user experience
- Responsive design for all devices

### 👥 **Role-Based Access**
- **Students**: Connect with faculty anonymously
- **Faculty**: Manage student conversations
- **Admin**: Monitor platform and user management

### 🛡️ **Security Features**
- Manipal University email validation
- Anonymous ID generation
- Secure authentication system
- Issue reporting and moderation tools

### 📱 **Responsive Design**
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for all screen sizes
- Progressive Web App capabilities

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/anonbridge.git
   cd anonbridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Update `src/lib/supabaseClient.js` with your project details:
     ```javascript
     const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
     const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
     ```

4. **Run database migrations**
   - Apply the SQL migrations from `supabase/migrations/` to your Supabase project
   - Or use the Supabase CLI: `supabase db push`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

---

## 🏗️ Project Structure

```
anonbridge/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── ChatBox.tsx
│   │   ├── GlitchButton.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeSelector.tsx
│   ├── contexts/           # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── UserContext.tsx
│   ├── lib/               # Utilities and database
│   │   ├── database/      # Database helper functions
│   │   └── supabaseClient.js
│   ├── pages/             # Main application pages
│   │   ├── AdminPanel.tsx
│   │   ├── ContactSupport.tsx
│   │   ├── FacultyDashboard.tsx
│   │   ├── Homepage.tsx
│   │   ├── Login.tsx
│   │   └── StudentDashboard.tsx
│   ├── App.tsx            # Main application component
│   ├── App.css            # Global styles and themes
│   └── main.tsx           # Application entry point
├── supabase/
│   └── migrations/        # Database schema migrations
├── public/                # Static assets
└── package.json           # Project dependencies
```

---

## 🎯 Usage

### For Students
1. **Login** with your Manipal University email (@manipal.edu or @learner.manipal.edu)
2. **Start a new chat** with available faculty members
3. **Communicate anonymously** using your generated Student ID
4. **Manage conversations** with pinning, archiving, and search features

### For Faculty
1. **Login** with your Manipal University email
2. **View student conversations** in your dashboard
3. **Respond to queries** and manage chat priorities
4. **Monitor conversations** and report issues if needed

### For Administrators
1. **Access admin panel** with special credentials
2. **Monitor user activity** and chat statistics
3. **Review reported issues** and moderate content
4. **Export data** for analysis and reporting

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Vite 5.4.2** - Fast build tool and dev server
- **React Router 6.26.0** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Database-level security

### UI & Styling
- **Lucide React** - Modern icon library
- **Custom CSS animations** - Cyberpunk effects and transitions
- **Responsive design** - Mobile-first approach

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 🎨 Themes & Customization

### Available Themes
1. **Blue/Purple Neon** - Classic cyberpunk aesthetic
2. **Red/Orange Neon** - High-intensity alert theme
3. **Green Matrix** - Matrix-inspired terminal look
4. **Teal/Cyan Cyberpunk** - Futuristic energy theme
5. **Purple Haze** - Mysterious purple ambiance
6. **Amber Glow** - Warm golden highlights

### Background Styles
1. **Cyberpunk Cityscape** - Animated city with buildings and vehicles
2. **Static Dark** - Clean gradient background
3. **Cyberpunk Grid** - Animated grid overlay
4. **Neon Waves** - Flowing wave patterns
5. **Matrix Rain** - Falling character effect
6. **Holographic City** - Futuristic hologram style
7. **Pulsing Energy** - Rhythmic energy waves

---

## 🔒 Security & Privacy

### Data Protection
- **Anonymous IDs** - No real names in conversations
- **Email Validation** - Restricted to Manipal University domains
- **Encrypted Storage** - Secure data handling
- **Zero Logging** - No conversation content stored in logs

### Authentication
- **University Email Only** - @manipal.edu and @learner.manipal.edu
- **Role-based Access** - Students and faculty have different permissions
- **Session Management** - Secure login/logout handling

### Moderation
- **Issue Reporting** - Built-in reporting system
- **Admin Oversight** - Administrative monitoring tools
- **Content Filtering** - Automated and manual moderation

---

## 📊 Database Schema

### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- role (text: 'student' or 'faculty')
- department (text)
- year (text, nullable for faculty)
- anonymous_id (text, unique)
- theme (text)
- created_at (timestamptz)
```

### Chats Table
```sql
- id (uuid, primary key)
- student_id (uuid, foreign key)
- faculty_id (uuid, foreign key)
- messages (jsonb array)
- created_at (timestamptz)
```

### Reports Table
```sql
- id (uuid, primary key)
- message_id (text)
- reason (text)
- reported_by (uuid)
- timestamp (timestamptz)
```

---

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting service
3. Configure environment variables
4. Set up custom domain (optional)

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🤝 Contributing

We welcome contributions to AnonBridge! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Maintain responsive design principles

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Getting Help
- **Documentation**: Check `CODE_EXPLANATION.md` for detailed code explanations
- **Issues**: Report bugs on GitHub Issues
- **Contact**: Use the in-app contact support feature
- **Email**: support@anonbridge.manipal.edu

### Emergency Contact
For urgent security issues or critical platform failures:
- **Email**: emergency@anonbridge.manipal.edu
- **Phone**: +91 820-2925-001 (24/7)

---

## 🙏 Acknowledgments

- **Manipal University** - For providing the educational context
- **Supabase Team** - For the excellent backend platform
- **React Community** - For the amazing ecosystem
- **Cyberpunk Aesthetic** - Inspired by futuristic design principles

---

## 📈 Roadmap

### Upcoming Features
- [ ] Voice message support
- [ ] File sharing improvements
- [ ] Advanced admin analytics
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] AI-powered content moderation

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced mobile responsiveness
- **v1.2.0** - Advanced theme system
- **v2.0.0** - Complete UI overhaul (current)

---

<div align="center">
  <p>Made with ❤️ for the Manipal University community</p>
  <p>🔒 <strong>Secure • Anonymous • Futuristic</strong> 🔒</p>
</div>