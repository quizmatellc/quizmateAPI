require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const debug = require("debug")("homework-helping-api");
const fileUpload = require("express-fileupload");
const handleResponse = require("./utils/response");
const routes = require("./routes/analyze");

const app = express();

app.disable("x-powered-by"); // disable X-Powered-By header
app.use(function (req, res, next) {
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("X-Frame-Options", "deny");
  res.header("X-Content-Type-Options", "nosniff");
  next();
});

const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://app.solvix.gg",
      "https://app.quizmate.gg",
      "https://quizmate-a56z.onrender.com",
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

// Initialize routes
app.use("/api/v1/analyze", routes);

app.get("/", (req, res, next) => {
  try {
    return handleResponse(res, 200, "Welcome to homework helping API");
  } catch (error) {
    return next(error);
  }
});

// Add catch all route
app.all("*", (req, res, next) => {
  try {
    return handleResponse(res, 400, "This route does not exist");
  } catch (error) {
    return next(error);
  }
});

// Add global error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _) => {
  console.log(error);
  return handleResponse(res, 500, error.message, undefined, error);
});

/** This events prevent the application from crashing */
process.on("unhandledRejection", (e) => {
  // TODO: log error to file
  debug(e);
});

process.on("uncaughtException", (e) => {
  // TODO: log error to file
  debug(e);
});

app.listen(PORT, async function () {
  console.log(`Server listening on port ${PORT}`);
});

// ("C:UsersUSERDocumentsProjectshomework-helping-apisrccompressed-imagesFireShot Capture 678 - screenshot_2020_01_17_at_1202_660_170120032125.jpg (948Ã533)_ - akm-img-a-in.tosshub.com.png.png");

// ("C:UsersUSERDocumentsProjectshomework-helping-apisrccompressed-imagesFireShot Capture 678 - screenshot_2020_01_17_at_1202_660_170120032125.jpg (948Ã533)_ - akm-img-a-in.tosshub.com.png.png");

// FireShot Capture 678 - screenshot_2020_01_17_at_1202_660_170120032125.jpg (948×533)_ - akm-img-a-in.tosshub.com
