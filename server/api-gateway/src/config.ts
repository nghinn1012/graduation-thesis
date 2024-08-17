require("dotenv").config();

export const PORT = +(process.env.PORT || 8000) as number;
