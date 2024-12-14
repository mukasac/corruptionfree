"use client";
import React, { useEffect, useState } from 'react';
import { Nominee, NomineeResponse, Rating, Comment, PaginatedResponse } from '@/types/interfaces';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 9;

const NomineeList: React.FC = () => {
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [newComments, setNewComments] = useState<Record<number, string>>({});
    const [meta, setMeta] = useState<{
        count: number;
        pages: number;
        currentPage: number;
    }>({ count: 0, pages: 0, currentPage: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        currentPage: 1,
        status: '',
        institutionId: '',
        positionId: ''
    });

    useEffect(() => {
        fetchNominees();
    }, [ searchQuery, filters]);

    const fetchNominees = async () => {
        try {
            setIsLoading(true);
            let url = `/api/nominees?page=${meta.currentPage}&limit=${PAGE_SIZE}`;
            
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) url += `&${key}=${value}`;
            });

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch nominees');
            
            const data: PaginatedResponse<Nominee> = await response.json();
            setNominees(data.data);
            setMeta({
                count: data.count,
                pages: data.pages,
                currentPage: data.currentPage
            });

            // Fetch comments for each nominee
data.data.forEach((nominee: Nominee) => fetchComments(nominee.id));        } catch (error) {
            setError('Failed to load nominees');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async (nomineeId: number) => {
        try {
            const response = await fetch(`/api/comments?nomineeId=${nomineeId}`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            
            const data: PaginatedResponse<Comment> = await response.json();
            setComments(prev => ({
                ...prev,
                [nomineeId]: data.data
            }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (nomineeId: number) => {
        if (!newComments[nomineeId]?.trim()) return;

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomineeId,
                    content: newComments[nomineeId],
                    userId: 2 // Replace with actual user ID from auth
                }),
            });

            if (!response.ok) throw new Error('Failed to add comment');
            
            const newComment = await response.json();
            setComments(prev => ({
                ...prev,
                [nomineeId]: [...(prev[nomineeId] || []), newComment]
            }));
            setNewComments(prev => ({ ...prev, [nomineeId]: '' }));
        } catch (error) {
            setError('Failed to add comment');
            console.error('Error:', error);
        }
    };

    const calculateRating = (ratings: Rating[]) => {
        if (!ratings?.length) return 0;
        const weightedSum = ratings.reduce((acc, rating) => 
            acc + (rating.score * rating.ratingCategory.weight), 0);
        const totalWeight = ratings.reduce((acc, rating) => 
            acc + rating.ratingCategory.weight, 0);
        return (weightedSum / totalWeight).toFixed(2);
    };

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-red-50 p-4 rounded-md text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header with Search and Filters */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Corrupt Officials ({meta.count})
                    </h1>
                    <Link
                        href="/nominate"
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                    >
                        Report Official
                    </Link>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            type="search"
                            placeholder="Search officials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {/* Show filter modal */}}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Nominees Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {nominees.map((nominee) => (
                        <Card key={nominee.id} className="p-6 relative">
                            <Link href={`/nominees/${nominee.id}`}>
                                <div className="flex flex-col items-center">
                                    <Avatar className="w-24 h-24 mb-4">
                                        <AvatarImage 
                                            src={nominee.avatar || `/api/placeholder/${nominee.id}`}
                                            alt={nominee.name} 
                                        />
                                        <AvatarFallback>
                                            {nominee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl text-cyan-700 font-semibold mb-2">
                                        {nominee.name}
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {nominee.position.name} at {nominee.institution.name}
                                    </p>
                                    <Badge variant={nominee.status ? "success" : "warning"}>
                                        {nominee.status ? "VERIFIED" : "PENDING"}
                                    </Badge>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Corruption Score</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Based on {nominee.rating.length} ratings
                                            </div>
                                            <div className="text-2xl font-bold text-red-600">
                                                {calculateRating(nominee.rating)}/5
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Comments Section */}
                            <div className="mt-4 space-y-3">
                                <h3 className="font-medium">Recent Comments</h3>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {comments[nominee.id]?.map((comment) => (
                                        <div key={comment.id} className="bg-gray-50 p-3 rounded text-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{comment.user.name}</span>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p>{comment.content}</p>
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

                            <Link
                                href={`/nominees/${nominee.id}/rate`}
                                className="absolute top-4 right-4 bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition"
                            >
                                Rate
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: meta.pages }).map((_, index) => (
                        <Button
                            key={index}
                            variant={meta.currentPage === index + 1 ? 'default' : 'outline'}
                            onClick={() => setMeta(prev => ({ ...prev, currentPage: index + 1 }))}
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NomineeList;