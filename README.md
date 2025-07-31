# Yelp-Camp

Yelp-Camp is a full-stack web application for sharing and reviewing campgrounds. It demonstrates modern web development practices, including authentication, authorization, image uploads, map integration, and robust security measures.

## 🚀 Live Demo

The project is deployed and live on Render.  
**Play around with it here:** [Yelp-Camp on Render](https://yelp-camp-lhb8.onrender.com)

---

## 🛠 Tech Stack

**Frontend:**

- HTML, CSS (Bootstrap), JavaScript
- EJS (template engine)

**Backend:**

- Node.js, Express.js
- MongoDB (Mongoose ODM)
- Passport.js (authentication)
- Cloudinary (image hosting)
- Mapbox (interactive maps)

**Other Packages:**

- Joi (schema validation)
- express-session & connect-mongo (session management)
- multer & multer-storage-cloudinary (file uploads)
- express-mongo-sanitize, helmet (security)
- connect-flash (flash messages)

---

## ✨ Features

- **User Authentication & Authorization**

  - Register, login, logout (Passport.js, passport-local-mongoose)
  - Route protection and user-specific CRUD operations

- **Campground Management**

  - Add, edit, delete campgrounds
  - Multi-image upload support (Cloudinary, multer)
  - Bootstrap carousel for images

- **Reviews**

  - Add and delete reviews for campgrounds
  - One-to-many relationship (campground ↔ reviews)
  - Mongoose $pull operator for review deletion

- **Interactive Maps**

  - Mapbox integration for displaying campground locations
  - GeoJSON support for location data
  - Cluster map visualization

- **Security**

  - Input validation (Joi, custom extensions for HTML sanitization)
  - Protection against MongoDB injection (express-mongo-sanitize)
  - Cross-site scripting (XSS) mitigation (helmet, custom Joi sanitizer)
  - Secure session and cookie management

- **Responsive UI**

  - Bootstrap-based layouts
  - Custom CSS for enhanced user experience

- **Deployment**
  - Environment variables managed via `.env` (dotenv)
  - Production-ready setup (MongoDB Atlas, Render deployment)
  - Session store moved to MongoDB for scalability

---

## 📂 Project Structure

- **MVC Architecture:**
  - Models: MongoDB schemas
  - Views: EJS templates and static assets
  - Controllers: Route logic and business rules


---

## 📦 Deployment

- The app is deployed on [Render](https://render.com/).
- Uses MongoDB Atlas for cloud database.
- All secrets and API keys are managed via environment variables.

---

## 📚 Documentation & Notes

- See [Project-Notes.txt](Project-Notes.txt) for in-depth explanations of features, design decisions, and implementation details.

---

## 🙏 Credits

- [Bootstrap](https://getbootstrap.com/)
- [Mapbox](https://www.mapbox.com/)
- [Cloudinary](https://cloudinary.com/)
- [Passport.js](http://www.passportjs.org/)
- [Render](https://render.com/)

---

## 📧 Contact

For questions or feedback, open an issue or reach out via [sourav-GitHub](https://github.com/viteesourav).

---

**Enjoy exploring Yelp-Camp!**
