const { pool } = require("../config/database");

exports.getSectionContent = async (req, res) => {
  try {
    const sectionType = req.query.sectionType;

    if (!sectionType)
      return res.status(400).json({ success: false, error: "sectionType is required" });

    const result = await pool.query(
      "SELECT * FROM section_content WHERE section_type = $1",
      [sectionType]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    // Parse content if it's a string (JSONB is returned as string sometimes)
    const data = result.rows[0];
    if (data.content && typeof data.content === 'string') {
      try {
        data.content = JSON.parse(data.content);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("getSectionContent error:", error);
    res.status(500).json({ success: false, error: "Failed to load section" });
  }
};

exports.createOrUpdateSectionContent = async (req, res) => {
  try {
    const { sectionType, title, content } = req.body;

    if (!sectionType)
      return res.status(400).json({ success: false, error: "sectionType is required" });

    // Ensure content is stringified if it's an object/array
    const safeContent = typeof content === "string" ? content : JSON.stringify(content);

    const existing = await pool.query(
      "SELECT * FROM section_content WHERE section_type = $1",
      [sectionType]
    );

    if (existing.rows.length === 0) {
      const insert = await pool.query(
        "INSERT INTO section_content (section_type, title, content) VALUES ($1,$2,$3::jsonb) RETURNING *",
        [sectionType, title || null, safeContent || null]
      );
      const data = insert.rows[0];
      // Parse content back to object for response
      if (data.content && typeof data.content === 'string') {
        try {
          data.content = JSON.parse(data.content);
        } catch (e) {
          // If parsing fails, keep as is
        }
      }
      return res.json({ success: true, data });
    }

    const update = await pool.query(
      "UPDATE section_content SET title=$1, content=$2::jsonb WHERE section_type=$3 RETURNING *",
      [title || null, safeContent || null, sectionType]
    );

    const data = update.rows[0];
    // Parse content back to object for response
    if (data.content && typeof data.content === 'string') {
      try {
        data.content = JSON.parse(data.content);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("createOrUpdateSectionContent error:", error);
    res.status(500).json({ success: false, error: "Failed to update section" });
  }
};

exports.updateSectionContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionType, title, content } = req.body;

    if (!id)
      return res.status(400).json({ success: false, error: "id is required" });

    // Ensure content is stringified if it's an object/array
    const safeContent = typeof content === "string" ? content : JSON.stringify(content);

    const result = await pool.query(
      `
      UPDATE section_content 
      SET 
        section_type = COALESCE($1, section_type),
        title = COALESCE($2, title),
        content = COALESCE($3::jsonb, content)
      WHERE id = $4
      RETURNING *
      `,
      [sectionType || null, title || null, safeContent || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Section not found" });
    }

    const data = result.rows[0];
    // Parse content back to object for response
    if (data.content && typeof data.content === 'string') {
      try {
        data.content = JSON.parse(data.content);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("updateSectionContentById error:", error);
    res.status(500).json({ success: false, error: "Failed to update section" });
  }
};

exports.deleteSectionContent = async (req, res) => {
  try {
    const sectionType = req.query.sectionType || req.body.sectionType;

    if (!sectionType)
      return res.status(400).json({ success: false, error: "sectionType is required" });

    const result = await pool.query(
      "DELETE FROM section_content WHERE section_type = $1 RETURNING *",
      [sectionType]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Section not found" });
    }

    res.json({ success: true, message: "Section deleted successfully" });
  } catch (error) {
    console.error("deleteSectionContent error:", error);
    res.status(500).json({ success: false, error: "Failed to delete section" });
  }
};
