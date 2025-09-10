import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({ className, children, multiple, options, onChange, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 transition-all duration-200",
          multiple && "h-auto min-h-[80px] py-2",
          className
        )}
        ref={ref}
        multiple={multiple}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...props}
      >
        {children || (options && options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )))}
      </select>
      {!multiple && (
        <ApperIcon 
          name="ChevronDown" 
          size={16} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" 
        />
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;