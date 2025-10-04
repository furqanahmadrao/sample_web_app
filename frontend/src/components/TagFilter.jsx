import React from 'react';

function TagFilter({ allTags, selectedTag, setSelectedTag, fetchNotes }) {
  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
    // Fetch notes immediately when tag changes
    fetchNotes();
  };

  return (
    <div className="filter-group">
      <label htmlFor="tag-select">Filter by Tag:</label>
      <select id="tag-select" value={selectedTag} onChange={handleTagChange}>
        <option value="">All Tags</option>
        {allTags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  );
}

export default TagFilter;
