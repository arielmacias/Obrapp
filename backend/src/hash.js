const bcrypt = require("bcryptjs");
bcrypt.hash("Admin123!", 10).then(console.log);
