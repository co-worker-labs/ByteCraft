import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  forwardRef,
  ReactNode,
  useId,
} from "react";

export const StyledInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }
>(({ label, className = "", id: externalId, ...props }, ref) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
});
StyledInput.displayName = "StyledInput";

export const StyledTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode }
>(({ label, className = "", id: externalId, ...props }, ref) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 resize-y ${className}`}
        {...props}
      />
    </div>
  );
});
StyledTextarea.displayName = "StyledTextarea";

export const StyledSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode }
>(({ label, className = "", children, id: externalId, ...props }, ref) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
StyledSelect.displayName = "StyledSelect";

interface StyledCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function StyledCheckbox({ label, className = "", ...props }: StyledCheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded accent-[#06D6A0] bg-bg-input border-border-default cursor-pointer"
        {...props}
      />
      <span className="text-fg-secondary text-sm">{label}</span>
    </label>
  );
}
