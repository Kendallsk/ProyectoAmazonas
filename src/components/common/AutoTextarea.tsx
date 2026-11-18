import { ChangeEvent, useEffect, useRef } from 'react';
import './AutoTextarea.css';

export interface AutoTextareaProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  ariaLabel?: string;
}

/**
 * `field-sizing: content` hace que el navegador calcule la altura solo
 * (y lo recalcula al imprimir, cuando cambia el ancho de columna).
 * Si el navegador no lo soporta, se controla la altura por JavaScript.
 */
const supportsFieldSizing =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('field-sizing', 'content');

const grow = (el: HTMLTextAreaElement | null, minHeight: number) => {
  if (!el || supportsFieldSizing) return;
  el.style.height = 'auto';
  const styles = window.getComputedStyle(el);
  const borders =
    (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
  el.style.height = `${Math.max(minHeight, el.scrollHeight + borders + 1)}px`;
};

const AutoTextarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  className = '',
  minHeight = 38,
  inputMode,
  ariaLabel,
}: AutoTextareaProps) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    grow(ref.current, minHeight);
  }, [value, minHeight]);

  useEffect(() => {
    const el = ref.current;
    if (!el || supportsFieldSizing || typeof ResizeObserver === 'undefined') return;

    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth !== lastWidth) {
        lastWidth = el.clientWidth;
        grow(el, minHeight);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [minHeight]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    grow(e.currentTarget, minHeight);
    onChange(e);
  };

  return (
    <textarea
      ref={ref}
      id={id}
      name={name}
      rows={1}
      value={value ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      inputMode={inputMode}
      aria-label={ariaLabel}
      style={{ minHeight: `${minHeight}px` }}
      className={`auto-textarea ${className}`.trim()}
    />
  );
};

export default AutoTextarea;
