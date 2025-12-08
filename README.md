<div align="center">

# 🍽️ QResto

### *Digital Menus, QR Codes, Analytics & More*

**Transform your restaurant experience with intelligent digital solutions**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Features](#-key-features) • [Getting Started](#-quick-start) • [Documentation](#-documentation) • [Team](#-team)

---

</div>

## 🌟 Overview

QResto is a comprehensive SaaS platform designed specifically for modern restaurants. Create stunning digital menus, generate QR codes, track analytics, manage payments, handle support tickets, and collaborate with your team—all in one powerful application.

<br>

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 **Secure Authentication**
- Custom JWT implementation with access & refresh tokens
- Role-based access control (User, Owner, Admin)
- Token blacklist for enhanced security
- Secure password reset flows

</td>
<td width="50%">

### 📧 **Email System**
- SMTP-based email delivery
- Welcome emails for new users
- Password reset with secure tokens
- Professional email templates

</td>
</tr>
<tr>
<td width="50%">

### 📱 **Digital Menus**
- Intuitive menu builder interface
- QR code generation
- Real-time menu updates
- Customer feedback collection

</td>
<td width="50%">

### 💳 **Payment Integration**
- Chargily integration (CIB/Edahabia)
- Subscription management
- Secure checkout process
- Multiple payment plans

</td>
</tr>
<tr>
<td width="50%">

### 🎫 **Support System**
- Integrated ticketing system
- Contact form submissions
- Email-based support tracking
- Multi-profile management

</td>
<td width="50%">

### 📊 **Analytics & Insights**
- Menu performance tracking
- Customer behavior analytics
- Real-time notifications
- Team collaboration tools

</td>
</tr>
</table>

<br>

## 🏗️ Technology Stack

```mermaid
graph LR
    A[Frontend] -->|Next.js 15| B[React 19]
    B -->|TypeScript| C[Tailwind CSS]
    D[Backend] -->|API Routes| E[Prisma ORM]
    E -->|Connection| F[(MongoDB)]
    G[Authentication] -->|JWT| H[Token Management]
    I[Payments] -->|Chargily| J[CIB/Edahabia]
    K[Email] -->|SMTP| L[Nodemailer]
```

<br>

## 📁 Project Structure

```
qresto/
├── 📂 app/
│   ├── 🏠 (public)/          # Landing pages & marketing
│   ├── 🔐 auth/              # Authentication flows
│   ├── 📊 dashboard/         # Main application dashboard
│   └── 🔌 api/               # Server-side API routes
├── 🧩 components/            # Reusable UI components
├── 📚 lib/                   # Core utilities & helpers
├── 🗄️ prisma/                # Database schema & seeds
└── 📦 public/                # Static assets
```

<br>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- SMTP email credentials
- Chargily account (for payments)

### Installation

1️⃣ **Clone and Install**
```bash
git clone https://github.com/yourusername/qresto.git
cd qresto
npm install
```

2️⃣ **Configure Environment**

Create a `.env` file in the root directory:

```env
# 🗄️ Database
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/qresto

# 🔑 JWT Configuration
JWT_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 🌐 Application URL
NEXTAUTH_URL=http://localhost:3000

# 📧 SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=true
EMAIL_FROM="QResto Support <support@qresto.com>"

# 🎫 Support Email
SUPPORT_EMAIL=support@qresto.com

# 💳 Chargily Payment Gateway
CHARGILY_SECRET_KEY=your-secret-key
CHARGILY_PUBLIC_KEY=your-public-key
```

3️⃣ **Setup Database**
```bash
npx prisma generate
npx prisma db push
npm run db:seed  # Optional: seed sample data
```

4️⃣ **Launch Application**
```bash
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000) in your browser**

<br>

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Login Request
    Frontend->>API: POST /api/auth?action=login
    API->>Database: Verify Credentials
    Database-->>API: User Data
    API-->>Frontend: Access + Refresh Tokens
    Frontend-->>User: Authenticated
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth?action=login` | POST | User login |
| `/api/auth?action=register` | POST | New user registration |
| `/api/auth?action=refresh` | POST | Refresh access token |
| `/api/auth?action=logout` | POST | User logout |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/forgot-password` | PUT | Reset password with token |

<br>

## 🎫 Support Ticket System

The integrated support system allows customers to submit inquiries that are automatically converted into manageable tickets:

1. Customer submits contact form
2. System validates user (JWT or email matching)
3. Ticket created in MongoDB via Prisma
4. Support team notified
5. Ticket tracked until resolution

**API Endpoint:** `POST /api/contact`

<br>

## 💳 Payment Integration

QResto integrates with **Chargily** for seamless payment processing supporting:

- 💳 CIB (Credit cards)
- 💵 Edahabia (Algeria's e-payment system)

**Payment Flow:**
1. Fetch available plans: `GET /api/admin/plans`
2. Initiate checkout: `POST /api/payment/checkout`
3. Process payment via Chargily
4. Activate subscription

<br>

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |

<br>

## 👥 Team

<div align="center">

| Role | Name | GitHub |
|:----:|------|:------:|
| 👨‍💼 **Team Lead** | MAHDI YAHYA ABDERRAHMANE | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/yahyaMMD) |
| 👩‍💻 **Developer** | BOUTAYA HALA | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/hallaboutaya) |
| 👨‍💻 **Developer** | CHERDOUH YASSIR | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/yassircherdouh) |
| 👨‍💻 **Developer** | BENNACER ACHREF BAHA EDDINE | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/ax666raf) |
| 👩‍💻 **Developer** | HAICHOUR AMANI | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/amanihaichour) |

</div>

<br>

## 🔧 Troubleshooting

<details>
<summary><b>📧 Emails Not Sending</b></summary>

- Verify all `SMTP_*` environment variables are correct
- Ensure `EMAIL_FROM` is properly formatted
- For port 465, `SMTP_SECURE` must be `true`
- Check your email provider's app password settings
- Test SMTP credentials with a mail client first

</details>

<details>
<summary><b>🔐 Authentication Issues</b></summary>

- Clear browser local storage and cookies
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Check token expiration times are valid
- Ensure database connection is active
- Re-login to generate fresh tokens

</details>

<details>
<summary><b>🗄️ Prisma/Database Errors</b></summary>

- Run `npx prisma generate` after schema changes
- Verify `DATABASE_URL` connection string is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions
- Try `npx prisma db push --force-reset` (⚠️ deletes data)

</details>

<details>
<summary><b>💳 Payment Integration Issues</b></summary>

- Verify Chargily API keys are correct
- Check webhook URLs are properly configured
- Ensure your Chargily account is active
- Test with Chargily's sandbox environment first
- Review Chargily API logs for errors

</details>

<br>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by the QResto Team**

[Report Bug](https://github.com/yourusername/qresto/issues) • [Request Feature](https://github.com/yourusername/qresto/issues) • [Documentation](#)

⭐ Star us on GitHub if you find this project helpful!

</div>