import React, { useState } from "react";
import { Form, Button, Row, Col, Badge, InputGroup } from "react-bootstrap";
import { PostSortingMethod, type PostFilter } from "~/types/api";

interface SearchFilterProps {
  onFilterChange: (filter: PostFilter) => void;
  loading: boolean;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onFilterChange, loading }) => {
  const [authorName, setAuthorName] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<PostSortingMethod>(PostSortingMethod.DATE);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      setKeywordInput("");
      applyFilter(undefined, newKeywords, tags, sortBy, authorName);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    applyFilter(undefined, newKeywords, tags, sortBy, authorName);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput("");
      applyFilter(undefined, keywords, newTags, sortBy, authorName);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    applyFilter(undefined, keywords, newTags, sortBy, authorName);
  };

  const handleSortChange = (newSortBy: PostSortingMethod) => {
    setSortBy(newSortBy);
    applyFilter(undefined, keywords, tags, newSortBy, authorName);
  };

  const handleAuthorNameChange = (name: string) => {
    setAuthorName(name);
    applyFilter(undefined, keywords, tags, sortBy, name);
  };

  const applyFilter = (
    authorId?: number,
    keywordList?: string[],
    tagList?: string[],
    sorting?: PostSortingMethod,
    author?: string
  ) => {
    const filter: PostFilter = {
      author_name: author || undefined,
      keywords: keywordList || keywords,
      tags: tagList || tags,
      sort_by: sorting || sortBy,
    };
    
    if (authorId) {
      filter.author_id = authorId;
    }

    onFilterChange(filter);
  };

  const clearAllFilters = () => {
    setAuthorName("");
    setKeywords([]);
    setTags([]);
    setSortBy(PostSortingMethod.DATE);
    setKeywordInput("");
    setTagInput("");
    
    onFilterChange({
      keywords: [],
      tags: [],
      sort_by: PostSortingMethod.DATE,
    });
  };

  const hasActiveFilters = authorName || keywords.length > 0 || tags.length > 0 || sortBy !== PostSortingMethod.DATE;

  return (
    <div className="mb-4 p-3 bg-light rounded">
      <h5 className="mb-3">Search & Filter Posts</h5>
      
      <Row className="g-3">
        {/* Author Name Filter */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Author Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by author..."
              value={authorName}
              onChange={(e) => handleAuthorNameChange(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Col>

        {/* Sort By */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Sort By</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as PostSortingMethod)}
              disabled={loading}
            >
              <option value={PostSortingMethod.DATE}>Newest First</option>
              <option value={PostSortingMethod.LIKES}>Most Popular</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Keywords */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Keywords (search in title & content)</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Add keyword..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                disabled={loading}
              />
              <Button 
                variant="outline-secondary" 
                onClick={handleAddKeyword}
                disabled={loading || !keywordInput.trim()}
              >
                Add
              </Button>
            </InputGroup>
            <div className="mt-2">
              {keywords.map((keyword) => (
                <Badge 
                  key={keyword} 
                  bg="primary" 
                  className="me-2 mb-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </Form.Group>
        </Col>

        {/* Tags */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Tags (hashtags - all must match)</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                disabled={loading}
              />
              <Button 
                variant="outline-secondary" 
                onClick={handleAddTag}
                disabled={loading || !tagInput.trim()}
              >
                Add
              </Button>
            </InputGroup>
            <div className="mt-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  bg="success" 
                  className="me-2 mb-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveTag(tag)}
                >
                  #{tag} ×
                </Badge>
              ))}
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-3">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={clearAllFilters}
            disabled={loading}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};
