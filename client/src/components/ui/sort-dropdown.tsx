import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Calendar, ArrowUp, ArrowDown, Check } from "lucide-react";

type SortOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

interface SortDropdownProps {
  onSortChange: (value: string) => void;
  currentSort: string;
}

export function SortDropdown({ onSortChange, currentSort }: SortDropdownProps) {
  const [open, setOpen] = useState(false);

  const sortOptions: SortOption[] = [
    { label: "Created: New → Old", value: "created-desc", icon: <Calendar className="h-4 w-4" /> },
    { label: "Created: Old → New", value: "created-asc", icon: <Calendar className="h-4 w-4" /> },
    { label: "Name: A → Z", value: "name-asc", icon: <ArrowUp className="h-4 w-4" /> },
    { label: "Name: Z → A", value: "name-desc", icon: <ArrowDown className="h-4 w-4" /> },
  ];

  const getCurrentLabel = () => {
    return sortOptions.find(opt => opt.value === currentSort)?.label || "Sort by";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 rounded-full border-neutral-200 dark:border-neutral-700 h-11 px-5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowUpDown className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{getCurrentLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-xl p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg"
      >
        <DropdownMenuLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400 px-2 py-1.5">
          Sort galleries by
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700" />
        <DropdownMenuGroup>
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setOpen(false);
              }}
              className={`flex items-center justify-between rounded-md cursor-pointer py-2 px-2 ${
                currentSort === option.value 
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground' 
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={currentSort === option.value ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'}>
                  {option.icon}
                </span>
                <span>{option.label}</span>
              </div>
              {currentSort === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}