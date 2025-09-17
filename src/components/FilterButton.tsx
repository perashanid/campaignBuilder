interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FilterButton({ isActive, onClick, children, className = '' }: FilterButtonProps) {
  return (
    <button
      className={`${className} ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}