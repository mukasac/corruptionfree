"use client";
import React, { useEffect, useState } from 'react';
import { Nominee, NomineeResponse, Rating, Comment } from '@/types/interfaces';
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NomineeList: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [newComments, setNewComments] = useState<Record<number, string>>({});
    const [meta, setMeta] = useState<{
        count: number;
        pages: number;
        currentPage: number;
    }>({ count: 0, pages: 0, currentPage: 0 });

    useEffect(() => {
        fetchNominees().then((data) => {
            setNominees(data.data);
            setMeta({ count: data.count, pages: data.pages, currentPage: data.currentPage });
        }).finally(() => setIsLoading(false));

        // Fetch comments for each nominee
        fetchComments();
    }, []);

    const fetchNominees = async (): Promise<NomineeResponse> => {
        const response = await fetch(`/api/nominees/`);
        return response.json();
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/comments/`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (nomineeId: number) => {
        if (!newComments[nomineeId]?.trim()) return;

        try {
            const response = await fetch('/api/comments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomineeId,
                    content: newComments[nomineeId],
                    userId: 1 // Replace with actual user ID
                }),
            });

            if (response.ok) {
                const newComment = await response.json();
                setComments(prev => ({
                    ...prev,
                    [nomineeId]: [...(prev[nomineeId] || []), newComment]
                }));
                setNewComments(prev => ({ ...prev, [nomineeId]: '' }));
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const renderNomineeRating = (ratings: Rating[]) => {
        if (!ratings?.length) return <p>No ratings available</p>;
        
        return ratings.slice(0, 2).map((rating) => (
            <div key={rating.id} className="border-t pt-2 mt-2">
                <div className="font-medium">{rating.ratingCategory.name}</div>
                <div className="text-sm text-gray-600">
                    <p>Weight: {rating.ratingCategory.weight}%</p>
                    <p>Score: {rating.score}/5</p>
                </div>
                <p className="text-sm mt-1">{rating.ratingCategory.description}</p>
                <p className="text-sm mt-1">Evidence: {rating.evidence || 'None provided'}</p>
            </div>
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <h1 className="text-3xl text-gray-600 font-bold mb-6">
                        Nominees ({meta.count})
                    </h1>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {nominees.map((nominee) => (
                            <Card key={nominee.id} className="p-6 relative">
                                <div className="flex flex-col items-center">
                                    <Avatar 
                                        className="w-24 h-24 mb-4"
                                        src={`/api/placeholder/${nominee.id}`} 
                                        fallback={nominee.name.charAt(0)}
                                    />
                                    <h2 className="text-xl text-cyan-700 font-semibold mb-2">
                                        <a href={`/nominees/${nominee.id}`} className="hover:underline">
                                            {nominee.name}
                                        </a>
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {nominee.position.name} at {nominee.institution.name}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Recent Ratings</h3>
                                        {renderNomineeRating(nominee.rating)}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Total Votes: {nominee.rating.length}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-medium">Comments</h3>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                            {comments[nominee.id]?.map((comment, idx) => (
                                                <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                                                    {comment.content}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newComments[nominee.id] || ''}
                                                onChange={(e) => setNewComments(prev => ({
                                                    ...prev,
                                                    [nominee.id]: e.target.value
                                                }))}
                                                placeholder="Add a comment..."
                                                className="flex-grow"
                                            />
                                            <Button 
                                                onClick={() => handleAddComment(nominee.id)}
                                                variant="secondary"
                                            >
                                                Post
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={`/nominees/${nominee.id}/rate`}
                                    className="absolute top-4 right-4 bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition"
                                >
                                    Rate
                                </a>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default NomineeList;