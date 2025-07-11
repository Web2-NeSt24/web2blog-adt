import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Form, Badge } from 'react-bootstrap';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  size?: 'sm' | 'lg';
}

export const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onTagsChange, 
  placeholder = "Type tags and press space or enter...",
  size 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div 
      className={`form-control ${size === 'sm' ? 'form-control-sm' : ''} d-flex flex-wrap gap-1 align-items-center`}
      style={{ 
        minHeight: size === 'sm' ? '31px' : '38px',
        cursor: 'text'
      }}
      onClick={() => {
        const input = document.querySelector('.tag-input-field') as HTMLInputElement;
        input?.focus();
      }}
    >
      {tags.map((tag, index) => (
        <Badge 
          key={index} 
          bg="primary" 
          className="d-flex align-items-center gap-1"
          style={{ fontSize: '0.75rem' }}
        >
          {tag}
          <button
            type="button"
            className="btn-close btn-close-white"
            style={{ fontSize: '0.5rem' }}
            aria-label={`Remove ${tag} tag`}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
          />
        </Badge>
      ))}
      <input
        type="text"
        className="tag-input-field border-0 flex-grow-1"
        style={{ 
          outline: 'none', 
          minWidth: '120px',
          backgroundColor: 'transparent',
          fontSize: size === 'sm' ? '0.875rem' : '1rem'
        }}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
};
