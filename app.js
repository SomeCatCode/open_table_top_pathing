// app.js
const express = require("express");
const app = express();
const path = require("path");
const apiRoutes = require("./routes/apiRoutes");
const protectedRoute = require("./routes/protectedRoute");
const publicRoutes = require("./routes/publicRoutes");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/api", apiRoutes);
app.use("/protected", protectedRoute);
app.use("/", publicRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
