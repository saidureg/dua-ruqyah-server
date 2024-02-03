const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./db/dua_main.sqlite", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});

// GET API to fetch category data
app.get("/categories", (req, res) => {
  db.all("SELECT * FROM category", (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(rows);
    }
  });
});

// GET API to fetch Sub category data
app.get("/sub_categories", (req, res) => {
  db.all("SELECT * FROM sub_category", (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(rows);
    }
  });
});

// GET API to fetch dua data by cat_name_en, subcat_id, and dua_id using procedure
app.get("/duas/:cat_name_en", (req, res) => {
  const { cat_name_en } = req.params;
  const queryParams = req.query;

  if (!cat_name_en) {
    return res.status(400).json({ error: "cat_name_en parameter is required" });
  }

  const formattedCatName = cat_name_en
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  let whereClause = `category.cat_name_en = ?`;
  const params = [formattedCatName];

  Object.entries(queryParams).forEach(([key, value]) => {
    if (key !== "cat" && key !== "subcat" && key !== "dua") {
      return;
    }
    whereClause += ` AND dua.${key}_id = ?`;
    params.push(value);
  });

  const query = `
    SELECT dua.id, dua.dua_name_bn, dua.dua_name_en, dua.top_bn, dua.top_en, 
           dua.dua_arabic, dua.dua_indopak, dua.clean_arabic, 
           dua.transliteration_bn, dua.transliteration_en, 
           dua.translation_bn, dua.translation_en, 
           dua.bottom_bn, dua.bottom_en, 
           dua.refference_bn, dua.refference_en, dua.audio
    FROM dua
    JOIN category ON dua.cat_id = category.cat_id
    WHERE ${whereClause}
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).json({ error: "Internal server error" });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "No matching dua found" });
    } else {
      res.json(rows);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Dua Ruqyah server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
