import React, { useState, useRef, useEffect } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
      // Auto-scroll to the end to show the newly added tag
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 0);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div
      ref={containerRef}
      className={`form-control tag-input-container ${size === 'sm' ? 'form-control-sm' : ''} d-flex align-items-center`}
      style={{ minHeight: size === 'sm' ? '31px' : '38px', cursor: 'text' }}
      onClick={() => {
        const input = document.querySelector('.tag-input-field') as HTMLInputElement;
        input?.focus();
      }}
    >
      {/* scrollable badge row */}
      <div 
        ref={scrollContainerRef}
        className="tag-list-scroll d-flex gap-1 align-items-center me-2"
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
      </div>

      {/* input stays fixed at the right edge */}
      <input
        type="text"
        className="tag-input-field border-0"
        style={{ 
          outline: 'none', 
          minWidth: '60px',
          width: inputValue ? `${Math.max(60, inputValue.length * 8 + 20)}px` : '60px',
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
