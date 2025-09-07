"use client";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Input } from "./ui/input";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelectedUser } from "@/store/useSelectedUser";
import { Message, User } from "@/db/dummy";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { usePresence } from "@/hooks/usePresence";

const Navbar = () => {
    const { user: currentUser } = useKindeBrowserClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { setSelectedUser } = useSelectedUser();
    const onlineUsers = usePresence(currentUser?.id);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch("/api/messages/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: searchQuery }),
            });

            const data = await response.json();
            if (response.ok) {
                setSearchResults(data.messages);
                setShowResults(true);
            }
        } catch (error) {
            console.error("Error searching messages:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = async (message: Message) => {
        if (!message.conversationId) return;

        // Extract the other participant's ID from the conversation ID
        const participants = message.conversationId.split(":").pop()?.split("_") || [];
        const otherParticipantId = participants.find(id => id !== currentUser?.id);
        
        if (otherParticipantId) {
            try {
                // Fetch user details
                const response = await fetch(`/api/user/lookup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: otherParticipantId }),
                });

                const data = await response.json();
                if (response.ok && data.users && data.users.length > 0) {
                    const user = data.users[0] as User;
                    setSelectedUser(user);
                    setShowResults(false);
                    setSearchQuery("");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        }
    };

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 mx-auto">
                <div className="flex items-center space-x-4 flex-1">
                    <h2 className="text-lg font-semibold px-10">Chat App</h2>
                    <div className="relative w-200">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Avatar>
                            <AvatarImage src={currentUser?.picture || ""} />
                            <AvatarFallback>
                                {currentUser?.given_name?.[0] || "Unknown"}
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white ${
                                onlineUsers.some(onlineUser => onlineUser.id === currentUser?.id) ? "bg-green-500" : "bg-gray-400"
                            }`}
                            title={onlineUsers.some(onlineUser => onlineUser.id === currentUser?.id) ? "Online" : "Offline"}
                        />
                    </div>
                    <span className="text-sm font-medium">
                        {currentUser?.given_name || "Unknown"}
                    </span>
                    <LogoutLink>
                        <Button variant="ghost">
                            Logout
                        </Button>
                    </LogoutLink>
                </div>
            </div>

            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Search Results</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {searchResults.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                No messages found
                            </p>
                        ) : (
                            searchResults.map((message, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg hover:bg-accent cursor-pointer"
                                    onClick={() => handleResultClick(message)}
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {message.timestamp ? new Date(message.timestamp).toLocaleString() : "Unknown time"}
                                    </p>
                                    <p className="mt-1">{message.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Navbar;