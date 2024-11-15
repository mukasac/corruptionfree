"use client"; // This ensures the page is treated as a Client Component
import React, { useEffect, useState } from 'react';

// Define types for the nominee, rating, position, institution, and district
import { Nominee, NomineeResponse, Rating, } from '@/types/interfaces';

// Functional component to fetch and display nominees
const NomineeList: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // State to store fetched nominees data
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [meta, setMeta] = useState<{
        count: number;
        pages: number;
        currentPage: number;
    }>({ count: 0, pages: 0, currentPage: 0 });

    // Function to fetch nominees data from the API
    const fetchNominees = async (): Promise<NomineeResponse> => {
        const response = await fetch('http://localhost:3000/api/nominees/'); // Replace with your actual API endpoint
        const data = await response.json();
        return data;
    };

    // Effect hook to fetch data on component mount
    useEffect(() => {
        fetchNominees().then((data) => {
            setNominees(data.data);
            setMeta({ count: data.count, pages: data.pages, currentPage: data.currentPage, });
        }).finally(() => setIsLoading(false));

    }, []);

    // Render the ratings for a nominee
    const renderNomineeRating = (ratings: Rating[]) => {
        if (!ratings || ratings.length === 0) {
            return <p>No ratings available</p>;
        }

        return ratings.map((rating) => (
            <div key={rating.id}>
                <hr />
                <div>Category: {rating.ratingCategory.name}</div>
                <p>Weight: {rating.ratingCategory.weight} %</p>
                <p>Score: {rating.score}/5</p>
                <div>Description: {rating.ratingCategory.description}</div>
                <p>Evidence: {rating.evidence || 'No evidence provided'}</p>

            </div>
        ));
    };

    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
                <div>Loading...</div>
            ) : <div className="mb-6">
                <h1 className="text-3xl text-gray-600 font-bold">Nominees ({meta.count})</h1>
            </div>}


            <div className="space-y-6">
                {nominees.map((nominee) => (
                    <div key={nominee.id} className="bg-white rounded-lg shadow-md p-6 relative">
                        {/* Nominee Name with Link */}
                        <h2 className="text-xl text-cyan-700 font-semibold mb-2">
                            <a href={`/nominees/${nominee.id}`} className="hover:underline">
                                {nominee.name}
                            </a>
                        </h2>

                        {/* Position and Institution */}
                        <div className="text-gray-600 mb-2">
                            {nominee.position.name} at {nominee.institution.name}
                        </div>

                        {/* Nominee Rating */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div>{renderNomineeRating(nominee.rating)}</div>
                        </div>

                        {/* Votes */}
                        <p className="mt-4 text-blue-700">Votes: {nominee.rating.length}</p>

                        {/* Evidence */}
                        <p className="mt-4 text-gray-700">{nominee.evidence}</p>

                        {/* Rate Button */}
                        <a
                            href={`/nominees/${nominee.id}/rate`}
                            className="absolute bottom-4 right-4 bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition"
                        >
                            Rate
                        </a>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default NomineeList;
