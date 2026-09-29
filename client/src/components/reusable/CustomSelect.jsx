// import { useEffect, useRef, useState } from 'react';
import { useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CustomSelect = ({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  multiple = false, // add checkbox for csv records
  selectedValues = [],
  onMultiChange,
}) => {
  // bulk export pdf - checkbox
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // bulk export pdf - checkbox
  // MULTI SELECT VERSION
  if (multiple) {
    const recordOptions = options.filter((option) => option !== 'Placeholders');

    const allSelected =
      recordOptions.length > 0 &&
      recordOptions.every((option) => selectedValues.includes(option));

    // Select All checkbox
    const handleSelectAll = () => {
      if (allSelected) {
        onMultiChange([]);
      } else {
        onMultiChange(recordOptions);
      }
    };

    // Checkbox near individual record = select/deselect only
    const handleRecordCheckboxChange = (option) => {
      const updatedValues = selectedValues.includes(option)
        ? selectedValues.filter((item) => item !== option)
        : [...selectedValues, option];

      onMultiChange(updatedValues);
    };

    // Clicking record text = original preview functionality
    const handleRecordPreview = (option) => {
      onChange(option);
      setIsOpen(true);
    };

    const handlePlaceholderPreview = () => {
      onChange('Placeholders');
      setIsOpen(true);
    };
    // bulk export pdf
    return (
      <div ref={dropdownRef} className='relative w-full'>
        {/* Dropdown button */}
        <button
          type='button'
          data-cy='record-selector'
          onClick={() => setIsOpen((prev) => !prev)}
          className='w-full !h-auto px-3 py-1 text-white font-normal border-0 rounded bg-neutral-600 text-left text-sm flex items-center justify-between'
        >
          <span>{value || placeholder}</span>

          <span className='ml-2'>
            <ChevronDown className='w-4 h-4' />
          </span>
        </button>

        {/* Dropdown content */}
        {isOpen && (
          <div className='dropdown-scroll  z-50 mt-1 w-full max-h-60 overflow-y-auto rounded bg-neutral-700 border border-neutral-600 shadow-lg'>
            {/* Placeholders / Select All */}
            <div className='flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-neutral-600'>
              <input
                type='checkbox'
                checked={allSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSelectAll}
              />

              <span
                className='flex-1 cursor-pointer'
                onClick={handlePlaceholderPreview}
              >
                Select All
              </span>
            </div>

            <div className='border-t border-neutral-600' />

            {/* Records */}
            {recordOptions.map((option) => (
              <div
                key={option}
                className='flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-neutral-600'
              >
                {/* Checkbox = selection ONLY */}
                {/* bulk export pdf */}
                <input
                  type='checkbox'
                  checked={selectedValues.includes(option)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleRecordCheckboxChange(option)}
                />

                {/* Record text = preview ONLY */}
                <span
                  className={`flex-1 cursor-pointer ${
                    value === option ? 'text-blue-400' : ''
                  }`}
                  onClick={() => handleRecordPreview(option)}
                >
                  {option}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // EXISTING SINGLE SELECT VERSION
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='w-full !h-auto px-3 py-1 text-white font-normal border-0 rounded bg-neutral-600'>
        <SelectValue placeholder={placeholder} className='text-sm' />
      </SelectTrigger>

      <SelectContent className='max-h-60 overflow-y-auto'>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className='text-sm px-2 py-1'>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
