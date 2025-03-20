# Scatch-Shopper-Stop

**Scatch Shopper Stop** is a modern e-commerce platform built with Node.js, Express, and EJS, designed to provide a seamless shopping experience for users and robust management tools for administrators. Featuring user authentication, product management, cart functionality, payment integration with Razorpay, and a responsive chatbot, this project aims to deliver value, quality, and convenience.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- **User Features:**
  - Register and login with secure authentication (JWT & bcrypt)
  - Browse products with sorting (price, discount, newest) and search functionality
  - Add/remove products to/from cart with quantity management
  - Checkout with Razorpay payment integration (Card, UPI, Net Banking, Wallet)
  - View order history and download invoices
  - Update profile with image upload

- **Admin Features:**
  - Hardcoded admin login (`admin@gmail.com` / `admin`)
  - Create, view, and delete products
  - Manage all user orders with invoice generation
  - Admin dashboard and profile

- **Additional Features:**
  - Responsive chatbot for user queries (bottom-right popup)
  - Invoice generation with detailed itemized breakdown (PDF)
  - Contact form with MongoDB storage
  - Flash messages for user feedback

---

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen) ![EJS](https://img.shields.io/badge/EJS-3.x-orange)

- **Backend:** Node.js, Express
- **Frontend:** EJS, Tailwind CSS, Custom CSS
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer
- **Payment Gateway:** Razorpay
- **PDF Generation:** pdfkit
- **Session Management:** express-session, cookie-parser
- **Environment:** dotenv

---

## Project Structure

```
Scratch-Shopper-Stop/
├── config/                # Configuration files
│   ├── keys.js            # JWT key configuration
│   ├── mongoose-connection.js  # MongoDB connection
│   └── multer.js          # Multer configuration
├── controllers/           # Controller logic
│   └── authController.js  # Authentication logic
├── invoices/              # Generated invoice PDFs
├── middleware/            # Custom middleware
│   ├── isAdmin.js         # Admin authentication
│   ├── isLoggedin.js      # User authentication
│   └── isUser.js          # User role check
├── models/                # Mongoose schemas
│   ├── admin-model.js     # Admin schema
│   ├── contact-model.js   # Contact form schema
│   ├── product-model.js   # Product schema
│   └── user-model.js      # User schema
├── public/                # Static assets
│   ├── image/             # Images
│   └── javascripts/       # Client-side scripts
│       └── chatbot.js     # Chatbot logic
│   └── StyleSheet/        # CSS files
│       └── style.css      # Custom styles
├── routes/                # Route handlers
│   ├── adminrouter.js     # Admin routes
│   ├── contactrouter.js   # Contact form routes
│   ├── index.js           # Home routes
│   └── userrouter.js      # User routes
├── utils/                 # Utility functions
│   └── generatetoken.js   # JWT token generation
├── views/                 # EJS templates
│   ├── partials/          # Reusable components
│   │   ├── admin-footer.ejs
│   │   ├── admin-header.ejs
│   │   ├── footer.ejs
│   │   └── header.ejs
│   └── *.ejs              # Page templates
├── .env                   # Environment variables
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

---

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/Scratch-Shopper-Stop.git
   cd Scratch-Shopper-Stop
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```plaintext
   JWT_KEY=your_jwt_secret
   SESSION_SECRET=your_session_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   MONGO_URI=mongodb://localhost:27017/shops
   PORT=3023
   ```

4. **Ensure MongoDB is Running:**
   Start MongoDB locally or use a cloud service like MongoDB Atlas.

5. **Run the Application:**
   ```bash
   npm start
   ```
   Open your browser at `http://localhost:3023`.

---

## Usage

- **Home Page:** Access at `/` to register, login, or visit admin login.
- **User Routes:** `/users/register`, `/users/login`, `/users/shop`, `/users/cart`, `/users/profile`
- **Admin Routes:** `/admin` (login), `/admin/dashboard`, `/admin/orders`, `/admin/create`
- **Chatbot:** Click the "+" button at the bottom-right to interact.
- **Invoice:** Download from `/users/invoice/:orderId` (user) or `/admin/orders/invoice/:orderId` (admin).

---

## Environment Variables

| Variable             | Description                           | Example Value                       |
|----------------------|---------------------------------------|-------------------------------------|
| `JWT_KEY`            | Secret key for JWT tokens            | `sjhfbvebfvhjbvjhdbhebaljsdbvbv` |
| `SESSION_SECRET`     | Secret for session management        | `your_secret_key_here`             |
| `RAZORPAY_KEY_ID`    | Razorpay API key ID                  | `rzp_test_OoOJWeY0wp1r0U`          |
| `RAZORPAY_KEY_SECRET`| Razorpay API key secret              | `JlbYwxEub4P5P9CtsluaWGSq`        |
| `MONGO_URI`          | MongoDB connection string            | `mongodb://localhost:27017/shops`  |
| `PORT`               | Server port                          | `3023`                             |

---

## Screenshots

### Home Page
![Home Page](screenshots/home.png) <!-- Replace with actual screenshot path -->

### Shop Page
![Shop Page](screenshots/shop.png)

### Cart
![Cart](screenshots/cart.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

*(Add screenshots to a `screenshots/` folder and update paths accordingly)*

---

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the existing style and includes appropriate tests.

---

## Contact

- **Email:** hitikpatel13@gmail.com

---

**Happy Shopping with Scratch Shopper Stop!** 🛒

