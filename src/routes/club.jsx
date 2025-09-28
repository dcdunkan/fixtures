import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";

export default function Home() {
    const { data, api } = useAuth();

    return (
        <div>
            {/* <h1 className="text-4xl font-bold">Hello, {data.name}</h1> */}
            <div>
            </div>
        </div>
    );
}
