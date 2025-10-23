import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { DeleteIcon } from "lucide-react";
import React, { useRef } from "react";
import { Input } from "./ui/input";

/**
 * @param {{
 *  showDeleteIcon?: boolean;
 *  placeholder?: string;
 *  query: string;
 *  setQuery: React.Dispatch<React.SetStateAction<string>>
 * }} param0
 * @returns
 */
export function SearchInput({ showDeleteIcon = true, placeholder, query, setQuery }) {
    const inputRef = useRef(null);

    return (
        <div className="relative flex w-full items-center">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform opacity-70" />
            <Input
                ref={inputRef}
                type="text"
                className="px-10 py-4 text-sm"
                placeholder={placeholder}
                value={query}
                onChange={(event) => {
                    setQuery(event.currentTarget.value);
                }}
            />
            {showDeleteIcon
                && (
                    <button
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 transform p-0 transition-all duration-75",
                            query.length > 0 ? "opacity-70" : "opacity-0",
                        )}
                        onClick={() => {
                            setQuery("");
                            inputRef.current?.focus();
                        }}
                    >
                        <DeleteIcon className="size-4" />
                    </button>
                )}
        </div>
    );
}
