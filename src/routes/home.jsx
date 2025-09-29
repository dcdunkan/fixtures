import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";

export default function Home() {
    const { data, api } = useAuth();

    return (
        <div className="space-y-4">
            {/* <h2 className="font-black text-4xl">What's Happening?</h2> */}

            <h2 className="font-semibold text-lg">Ongoing Matches</h2>

            <h2 className="font-semibold text-lg">Ongoing Tournaments</h2>

            <div>You are not part of any clubs. Create one to get started!</div>
        </div>
    );
}
