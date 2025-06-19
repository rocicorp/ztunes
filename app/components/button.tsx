import {MouseEvent, PointerEvent, ReactNode, useRef} from 'react';

export function Button({
  children,
  onPress,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const isHandlingPointerDown = useRef(false);

  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isHandlingPointerDown.current = true;
    onPress?.();
  };

  const onClick = (e: MouseEvent) => {
    if (isHandlingPointerDown.current) {
      isHandlingPointerDown.current = false;
    } else {
      onPress?.();
    }
  };

  return (
    <button onPointerDown={onPointerDown} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
