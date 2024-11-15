"use client";
import { useState, useEffect } from 'react';
import { RatingCategory } from "@/types/interfaces";
import { useRouter } from 'next/navigation';
export default function RateNomineePage({ params }: { params: { id: number } }) {
    const router = useRouter();
    // Use RatingCategory type for categories
    const [categories, setCategories] = useState<RatingCategory[]>([]);
    // Use specific type for ratings
    const [ratings, setRatings] = useState<{ ratingCategoryId: number; score: number }[]>([]);
    const [nomineeName, setNomineeName] = useState<string>('');
    const { id: nomineeId } =  params;

    useEffect(() => {
        if (!nomineeId) return; // Wait until nomineeId is available

        // Fetch rating categories from API
        async function fetchCategories() {
            const response = await fetch('/api/ratingcategories/');
            const data = await response.json();
            setCategories(data.data); // Assuming the response structure is { data: RatingCategory[] }
        }

        async function fetchNomineeDetails() {
            const response = await fetch(`/api/nominees/${nomineeId}`);
            const data = await response.json();
            setNomineeName(data.name); // Assuming the response structure includes a 'name' field
        }

        fetchCategories();
        fetchNomineeDetails();
    }, [nomineeId]);

    const handleRate = (categoryId: number, score: number) => {
        setRatings((prev) => {
            const existing = prev.find((r) => r.ratingCategoryId === categoryId);
            if (existing) {
                return prev.map((r) =>
                    r.ratingCategoryId === categoryId ? { ...r, score } : r
                );
            }
            return [...prev, { ratingCategoryId: categoryId, score }];
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ratings: ratings.map((rating) => ({
                userId: 1, // Example user ID; replace with actual value
                ...rating,
                severity: Math.floor(Math.random() * 5) + 1, // Dummy severity value
                evidence: 'Example evidence for rating', // Replace with actual evidence
            })),
        };

        const response = await fetch(`/api/nominees/${nomineeId}/rate/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            
            router.push(`/nominees/${nomineeId}/`);
        } else {
            console.error('Error submitting ratings:', await response.json());
        }
    };

    if (!nomineeId) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl text-gray-900 font-bold mb-8">Rate Nominee #{nomineeName}</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <h2 className="text-xl text-gray-700 font-semibold">Rate Corruption Metrics</h2>
                    <p className="text-gray-600">
                        Rate each metric from 1 (Minor) to 5 (Extreme) based on available evidence.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-lg p-4 shadow-md">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{category.icon}</span>
                                    <h3 className="text-lg text-gray-700 font-medium">{category.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                                {category.examples && category.examples.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Examples:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {category.examples.map((example, index) => (
                                        <li key={index}>{example}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                                <div className="flex items-center justify-between mt-4">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleRate(category.id, value)}
                                            className={`px-3 py-1 text-gray-600 rounded ${ratings.find((r) => r.ratingCategoryId === category.id && r.score === value)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200'
                                                }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 px-8 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                    Submit Ratings
                </button>
            </form>
        </div>
    );
}
