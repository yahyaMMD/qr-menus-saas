<div align="center">

# 🍽️ QrMenu

### *Transform Your Restaurant Experience with Digital Menus*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**[Documentation](#-documentation)** • **[Support](#-support)**

---

</div>

## 🌟 About MenuLix

MenuLix is a modern **SaaS platform** that revolutionizes how restaurants present their menus to customers. Built with cutting-edge technology, MenuLix empowers restaurant owners to create stunning digital menus accessible via QR codes, track customer engagement with powerful analytics, and collect valuable feedback—all through an intuitive dashboard.

### 🎯 Why MenuLix?

- 📱 **Contactless & Safe** - Perfect for the post-pandemic dining experience
- 💰 **Cost-Effective** - Eliminate expensive menu reprinting
- 📊 **Data-Driven** - Understand what your customers love
- 🚀 **Instant Updates** - Change prices, items, and descriptions in real-time
- 🌍 **Localized** - Built specifically for the Algerian market with wilaya/commune support

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🍽️ Menu Management
- 🎨 **Intuitive Menu Builder** with drag-and-drop
- 📂 **Category Organization** for better structure
- 🏷️ **Tags & Filters** for easy navigation
- 🖼️ **Image Support** for appetizing visuals
- 💱 **Dynamic Pricing** with real-time updates

</td>
<td width="50%">

### 📱 Customer Experience
- 📲 **QR Code Access** - instant menu viewing
- 🌐 **Mobile-Optimized** design
- ⭐ **Customer Reviews** and ratings
- 🔍 **Search Functionality** within menus
- 🌙 **Dark Mode** support

</td>
</tr>
<tr>
<td width="50%">

### 📊 Analytics & Insights
- 📈 **Real-time Scan Tracking**
- 🔥 **Popular Items Dashboard**
- 👥 **Customer Engagement Metrics**
- 📅 **Historical Data Analysis**
- 📊 **Visual Reports** and charts

</td>
<td width="50%">

### 🛠️ Business Tools
- 🏢 **Multi-Location Management**
- 💳 **Subscription Plans** via Chargily
- 🔗 **Social Media Integration**
- 🗺️ **Location Services** (Wilaya/Commune)
- 👨‍💼 **Admin Dashboard** for platform management

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
menulix/
├── 📁 app/
│   ├── 🌐 (routes)/              # Public pages (Home, About, Pricing)
│   ├── 🔐 (auth)/                # Authentication flows
│   ├── 📊 dashboard/             # Authenticated user area
│   │   ├── profile/              # Restaurant profile management
│   │   ├── subscriptions/        # Payment & plan management
│   │   └── admin/                # Admin-only features
│   ├── 🍽️ menu/[restaurantId]/  # Public menu display (QR destination)
│   └── 🔌 api/                   # Backend API routes
├── 📁 components/                # Reusable React components
├── 📁 lib/                       # Utility functions & helpers
├── 📁 prisma/                    # Database schema & migrations
└── 📁 public/                    # Static assets
```

---

## 🛠️ Technology Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | MongoDB |
| **Authentication** | NextAuth.js |
| **Payments** | Chargily (Baridi Mob & CIB) |
| **Deployment** | Vercel |
| **Analytics** | Custom Tracking System |

</div>

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.0 or higher
- **MongoDB** 5.0 or higher
- **npm** or **yarn** package manager

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/yahyaMMD/menulix.git
cd menulix
```

2️⃣ **Install dependencies**
```bash
npm install
# or
yarn install
```

3️⃣ **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/menulix"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Payment Gateway (Chargily)
CHARGILY_SECRET_KEY="your-chargily-secret-key"
CHARGILY_PUBLIC_KEY="your-chargily-public-key"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
```

4️⃣ **Initialize the database**
```bash
npx prisma generate
npx prisma db push
# Optional: Seed with sample data
npx prisma db seed
```

5️⃣ **Start the development server**
```bash
npm run dev
# or
yarn dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 💎 Pricing Plans

<table>
<tr>
<td width="33%" align="center">

### 🆓 Free
**Perfect for trying out**

**0 DZD/month**

---

✅ 1 Restaurant Profile  
✅ 1 Digital Menu  
✅ 10 Items per Menu  
✅ 5 Scans per Day  
✅ Basic Analytics  

<br>

*[Get Started →](#)*

</td>
<td width="33%" align="center">

### ⭐ Standard
**Most Popular**

**2,999 DZD/month**

---

✅ 3 Restaurant Profiles  
✅ 3 Menus per Profile  
✅ 50 Items per Menu  
✅ 100 Scans per Day  
✅ Advanced Analytics  
✅ Priority Support  

*[Start Trial →](#)*

</td>
<td width="33%" align="center">

### 🚀 Custom
**For growing businesses**

**Contact Us**

---

✅ Unlimited Profiles  
✅ Unlimited Menus  
✅ Unlimited Items  
✅ Unlimited Scans  
✅ Dedicated Support  
✅ Custom Features  

*[Contact Sales →](#)*

</td>
</tr>
</table>

---

## 👥 Team

<div align="center">

Meet the talented team behind MenuLix from the **National School of Artificial Intelligence** 🎓

</div>

| Role | Name | GitHub |
|------|------|--------|
| 👨‍💼 **Team Leader** | MAHDI YAHYA ABDERRAHMANE | [@yahyaMMD](https://github.com/yahyaMMD) |
| 👩‍💻 **Developer** | BOUTAYA HALA | [@BoutayaHala](#) |
| 👨‍💻 **Developer** | GUENDOUZ AHMED FATEH | [@GuendouzFateh](#) |
| 👨‍💻 **Developer** | CHERDOUH YASSIR | [@CherdouhYassir](#) |
| 👨‍💻 **Developer** | BENNACER ACHREF BAHA EDDINE | [@BennacerAchref](#) |
| 👩‍💻 **Developer** | HAICHOUR AMANI | [@HaichourAmani](#) |

---

## 🤝 Contributing

We love contributions! Here's how you can help make MenuLix even better:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. 💾 **Commit** your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. 📤 **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. 🎉 **Open** a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 📖 Documentation

- 📚 **[User Guide](docs/USER_GUIDE.md)** - Complete guide for restaurant owners
- 🔧 **[API Documentation](docs/API.md)** - API endpoints and usage
- 🎨 **[Design System](docs/DESIGN.md)** - UI components and styling guide
- 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy MenuLix

---

## 📊 Project Status

- ✅ Core Features: **Complete**
- 🚧 Admin Dashboard: **In Progress**
- 📱 Mobile App: **Planned**
- 🌐 Multi-language: **Planned**

---

## 📞 Support

Need help? We're here for you!

- 📧 **Email**: [support@menulix.dz](mailto:support@menulix.dz)
- 💬 **Discord**: [Join our community](https://discord.gg/menulix)
- 📖 **Documentation**: [docs.menulix.dz](https://docs.menulix.dz)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yahyaMMD/menulix/issues)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Special thanks to:

- 🎓 **National School of Artificial Intelligence (ENSIA)** for their support
- 👨‍🏫 Our mentors and professors for their guidance
- 🇩🇿 The Algerian developer community for their feedback
- 🍽️ Restaurant owners who helped shape MenuLix
- 💳 **Chargily** for payment integration support

---

<div align="center">

### 🌟 Star us on GitHub — it motivates us a lot!

**Built with ❤️ by Team MenuLix**

*Transforming restaurant experiences, one QR code at a time* 🍕 ☕ 🍽️

**[Website](https://menulix.dz)** • **[Twitter](https://twitter.com/menulix)** • **[LinkedIn](https://linkedin.com/company/menulix)**

---

© 2024 MenuLix. All rights reserved.

</div>#
