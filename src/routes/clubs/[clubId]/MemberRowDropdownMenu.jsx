import { buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleMinusIcon } from "lucide-react";
import { ArrowUpIcon } from "lucide-react";
import { ArrowDownIcon } from "lucide-react";
import { MoreVerticalIcon } from "lucide-react";

/**
 * @param {{ member: Tourney.ClubMember }} param0
 * @returns {import("react").JSX.Element}
 */
export default function MemberRowDropdownMenu({ member }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
                <MoreVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left">
                <DropdownMenuLabel className="text-center">
                    Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={() => {
                        alert("todo");
                    }}
                >
                    {member.role === "admin"
                        ? (
                            <>
                                <ArrowDownIcon /> Demote
                            </>
                        )
                        : (
                            <>
                                <ArrowUpIcon /> Promote
                            </>
                        )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => {
                        alert("todo");
                    }}
                >
                    <CircleMinusIcon /> Kick from club
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
