-- Script to delete families_pieces section content from database
-- Run this SQL script to remove all families_pieces data from section_content table

DELETE FROM section_content WHERE section_type = 'families_pieces';

-- Verify deletion
SELECT * FROM section_content WHERE section_type = 'families_pieces';

