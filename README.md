# E-Commerce Backend API

> REST API cho hệ thống thương mại điện tử, xây dựng với Node.js, Express, TypeScript, PostgreSQL và Drizzle ORM. Hỗ trợ authentication, quản lý sản phẩm, giỏ hàng, đơn hàng và thanh toán.

## Tech Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM 0.29

### Authentication & Security
- **JWT**: jsonwebtoken
- **Password**: bcryptjs (10 salt rounds)
- **Validation**: Zod 3.x
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit

### Development Tools
- **Hot Reload**: Nodemon + ts-node
- **Path Aliases**: tsconfig-paths
- **Linting**: ESLint
- **Formatting**: Prettier
- **API Docs**: Swagger UI Express + zod-to-openapi

### Utilities
- **Email**: Nodemailer
- **HTTP Client**: Axios
- **File Upload**: Multer
- **Environment**: dotenv

## 📦 Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (hoặc yarn/pnpm)
- **PostgreSQL**: >= 15.0
- **Git**: >= 2.0

### Khuyến Nghị
- **Memory**: >= 2GB RAM
- **Storage**: >= 1GB free space
- **OS**: macOS, Linux, hoặc Windows với WSL2

## Cài Đặt

### 1. Clone Repository

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Setup Database

#### Option A: PostgreSQL Local

```bash
# Khởi động PostgreSQL
# macOS (Homebrew)
brew services start postgresql@17

# Ubuntu/Debian
sudo systemctl start postgresql

# Tạo database
createdb ecommerce

# Import schema (nếu có file SQL)
psql -d ecommerce -f ../ScriptDb.sql
```

#### Option B: Neon DB (Cloud PostgreSQL) - Khuyến Nghị

1. Truy cập [neon.tech](https://neon.tech)
2. Tạo tài khoản miễn phí
3. Tạo database mới (region: us-east-1)
4. Copy connection string
5. Paste vào file `.env`

### 4. Cấu Hình Environment

```bash
# Copy file template
cp .env.example .env

# Mở và chỉnh sửa
nano .env  # hoặc code .env
```

## ⚙️ Cấu Hình

### Environment Variables (.env)

#### **BẮT BUỘC**

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
# Hoặc Neon DB:
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# JWT - PHẢI TẠO MỚI!
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_generated_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN_CUSTOMER=http://localhost:3000
CORS_ORIGIN_ADMIN=http://localhost:3001
```

#### **TÙY CHỌN**

```env
# Email (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # 16 chars from Google
EMAIL_FROM=noreply@ecommerce.com

# OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# OAuth Facebook
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

# Payment Gateways
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn

ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Tạo JWT Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...

# Generate JWT_REFRESH_SECRET (phải khác với JWT_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4...
```

### Gmail App Password Setup

1. Vào [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (bật nếu chưa)
3. Security → App passwords → Generate
4. Chọn "Mail" và "Other"
5. Copy mã 16 ký tự vào `SMTP_PASSWORD`

## Chạy Dự Án

### Development Mode

```bash
# Run development server với hot reload
npm run dev

# Server sẽ chạy tại:
# - API: http://localhost:5000
# - API Docs: http://localhost:5000/api-docs
```

**Hot Reload:**
- Tự động restart khi thay đổi file `.ts` hoặc `.json` trong `src/`
- Powered by Nodemon + ts-node
- Path aliases được resolve tự động

### Database Migrations

```bash
# Generate migration files (sau khi thay đổi schema)
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Seed database với test data (nếu có)
npm run db:seed
```

### Production Build

```bash
# Build TypeScript → JavaScript
npm run build

# Run production server
NODE_ENV=production npm start

# Server sẽ chạy tại http://localhost:5000
```
