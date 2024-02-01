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

// GET API to fetch dua data by cat_name_en and cat_id
app.get("/duas/:cat_name_en", (req, res) => {
  const { cat_name_en } = req.params;
  const { cat } = req.query;

  if (!cat_name_en || !cat) {
    return res
      .status(400)
      .json({ error: "cat_name_en and cat parameters are required" });
  }

  const formattedCatName = cat_name_en
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  db.all(
    `
    SELECT dua.dua_name_bn, dua.dua_name_en, dua.top_en,
           dua.dua_arabic, dua.transliteration_en, dua.translation_en, dua.bottom_en, dua.refference_en
    FROM dua
    JOIN category ON dua.cat_id = category.cat_id
    WHERE category.cat_name_en = ? AND dua.cat_id = ?
  `,
    [formattedCatName, cat],
    (err, rows) => {
      if (err) {
        console.error("Error fetching data:", err.message);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json(rows);
      }
    }
  );
});

// GET API to fetch dua data by cat_name_en and subcat_id
app.get("/duas/:cat_name_en", (req, res) => {
  const { cat_name_en } = req.params;
  const { cat, subcat } = req.query;

  if (!cat_name_en || !cat || !subcat) {
    return res
      .status(400)
      .json({ error: "cat_name_en, cat, and subcat parameters are required" });
  }

  const formattedCatName = cat_name_en
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  db.all(
    `
    SELECT  dua.dua_name_en, dua.top_en, dua.dua_arabic, dua.transliteration_en, 
            dua.translation_en, dua.bottom_en, dua.refference_en
    FROM dua
    JOIN category ON dua.cat_id = category.cat_id
    JOIN sub_category ON dua.subcat_id = sub_category.subcat_id
    WHERE category.cat_name_en = ? AND dua.cat_id = ? AND dua.subcat_id = ?
  `,
    [formattedCatName, cat, subcat],
    (err, rows) => {
      if (err) {
        console.error("Error fetching data:", err.message);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json(rows);
      }
    }
  );
});

// GET API to fetch dua data by cat_name_en, subcat_id, and dua_id
app.get("/duas/:cat_name_en", (req, res) => {
  const { cat_name_en } = req.params;
  const { cat, subcat, dua } = req.query;

  if (!cat_name_en || !cat || !subcat || !dua) {
    return res.status(400).json({
      error: "cat_name_en, cat, subcat, and dua parameters are required",
    });
  }

  const formattedCatName = cat_name_en
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  db.get(
    `
    SELECT dua.dua_name_en, dua.top_en, dua.dua_arabic, dua.transliteration_en,
           dua.translation_en, dua.bottom_en, dua.refference_en
    FROM dua
    JOIN category ON dua.cat_id = category.cat_id
    JOIN sub_category ON dua.subcat_id = sub_category.subcat_id
    WHERE category.cat_name_en = ? AND dua.cat_id = ? AND dua.subcat_id = ? AND dua.id = ?
  `,
    [formattedCatName, cat, subcat, dua],
    (err, row) => {
      if (err) {
        console.error("Error fetching data:", err.message);
        res.status(500).json({ error: "Internal server error" });
      } else if (!row) {
        res.status(404).json({ error: "Dua not found" });
      } else {
        res.json(row);
      }
    }
  );
});

app.get("/", (req, res) => {
  res.send("Dua Ruqyah server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
