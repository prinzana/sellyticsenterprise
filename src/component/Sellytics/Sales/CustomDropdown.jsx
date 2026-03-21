/**
 * SwiftCheckout - Custom Dropdown Component
 * Accessible, keyboard-navigable dropdown menu
 * @version 1.0.0
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical } from 'lucide-react';

export function DropdownItem({
  children,
  icon: Icon,
  onClick,
  variant = 'default',
  disabled = false
}) {
  const variantClasses = {
    default: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm text-left
        transition-colors focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />;
}

export default function CustomDropdown({
  children,
  trigger,
  align = 'right',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(event.target);
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);

      if (isOutsideTrigger && isOutsideMenu) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleKeyDown = (event) => {
      // Get all focusable buttons inside the menu
      const items = menuRef.current.querySelectorAll('button:not([disabled])');

      if (items.length === 0) return;

      // Convert NodeList to Array for easier indexing
      const itemsArray = Array.from(items);
      const currentIndex = itemsArray.indexOf(document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < itemsArray.length - 1) {
            itemsArray[currentIndex + 1].focus();
          } else {
            itemsArray[0].focus(); // Wrap to first item
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            itemsArray[currentIndex - 1].focus();
          } else {
            itemsArray[itemsArray.length - 1].focus(); // Wrap to last item
          }
          break;

        case 'Home':
          event.preventDefault();
          itemsArray[0].focus();
          break;

        case 'End':
          event.preventDefault();
          itemsArray[itemsArray.length - 1].focus();
          break;

        case 'Escape':
          event.preventDefault();
          // Optional: close menu or blur active element
          // onClose?.();
          break;

        default:
          // Required by ESLint rules (e.g., default-case)
          break;
      }
    };

    const menuElement = menuRef.current;
    menuElement.addEventListener('keydown', handleKeyDown);

    return () => {
      menuElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]); // Only re-attach when menu opens/closes



  // Focus first item when opening
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstItem = menuRef.current.querySelector('button:not([disabled])');
      firstItem?.focus();
    }
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);




  // Calculate position on open
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 180; // Approximate width

      let top = rect.bottom + window.scrollY + 4;
      let left = rect.right + window.scrollX - menuWidth;

      // Adjust for viewport edges
      if (left < 4) left = 4;

      if (menuRef.current) {
        // React ref might be null on first render pass of effect
      }

      setMenuPosition({ top, left });
    }
  }, [isOpen]);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onClick={toggle}
        onKeyDown={(e) => e.key === 'Enter' && toggle()}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger ? trigger : (
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      {/* Portal-like Menu using fixed position */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="fixed z-[9999] py-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: '180px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {typeof children === 'function'
            ? children({ close, isOpen })
            : children
          }
        </div>
      )}
    </>
  );
}
