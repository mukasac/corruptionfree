"use client"; // This ensures the page is treated as a Client Component
import React, { useEffect, useState } from 'react';

// Define types for the institution, rating, position, institution, and district
import { Institution, InstitutionResponse, InstitutionRating, } from '@/types/interfaces';
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Functional component to fetch and display institutions
const InstitutionList: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // State to store fetched institutions data
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [meta, setMeta] = useState<{
        count: number;
        pages: number;
        currentPage: number;
    }>({ count: 0, pages: 0, currentPage: 0 });

    // Function to fetch institutions data from the API
    const fetchInstitutions = async (): Promise<InstitutionResponse> => {
        const response = await fetch(`${baseUrl}institutions/`); // Replace with your actual API endpoint
        const data = await response.json();
        return data;
    };

    // Effect hook to fetch data on component mount
    useEffect(() => {
        fetchInstitutions().then((data) => {
            setInstitutions(data.data);
            setMeta({ count: data.count, pages: data.pages, currentPage: data.currentPage, });
        }).finally(() => setIsLoading(false));

    }, []);

    // Render the ratings for a institution
    const renderInstitutionRating = (ratings: InstitutionRating[]) => {
        if (!ratings || ratings.length === 0) {
            return <p>No ratings available</p>;
        }
    
        const limitedRatings = ratings.slice(0, 2); // Limit to first two ratings
    
        return limitedRatings.map((rating) => (
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
                <h1 className="text-3xl text-gray-600 font-bold">Institutions ({meta.count})</h1>
            </div>}


            <div className="space-y-6">
                {institutions.map((institution) => (
                    <div key={institution.id} className="bg-white rounded-lg shadow-md p-6 relative">
                        {/* Institution Name with Link */}
                        <h2 className="text-xl text-cyan-700 font-semibold mb-2">
                            <a href={`/institutions/${institution.id}`} className="hover:underline">
                                {institution.name}
                            </a>
                        </h2>

                        {/* Position and Institution */}
                        <div className="text-gray-600 mb-2">
                            {institution.name}
                        </div>

                        {/* Institution Rating */}
                        <p className='text-gray-700'>Most Recent Corruption Ratings</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div>{renderInstitutionRating(institution.rating)}</div>
                        </div>

                        {/* Votes */}
                        <p className="mt-4 text-gray-900">Total Votes: {institution.rating.length}</p>

                        {/* Evidence */}
                        {/* <div className="mt-4  text-gray-700">
                            <p>Evidence:</p>
                            <p>{institution.rating[0].evidence || 'No evidence provided'}</p>
                        </div > */}
                        

                        {/* Rate Button */}
                        <a
                            href={`/institutions/${institution.id}/rate`}
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

export default InstitutionList;