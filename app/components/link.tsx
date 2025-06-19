import {forwardRef, type AnchorHTMLAttributes} from 'react';
import {createLink} from '@tanstack/react-router';

interface MouseDownLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

const MouseDownLinkComponent = forwardRef<
  HTMLAnchorElement,
  MouseDownLinkProps
>(({onMouseDown, onClick, ...rest}, ref) => {
  const handleMouseDown = e => {
    if (onMouseDown) {
      onMouseDown(e);
    }
    if (!e.defaultPrevented) {
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <a ref={ref} {...rest} onMouseDown={handleMouseDown} onClick={onClick} />
  );
});
MouseDownLinkComponent.displayName = 'MouseDownLinkComponent';

export const Link = createLink(MouseDownLinkComponent);
