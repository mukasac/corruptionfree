// src/app/nominees/page.tsx
"use client"; // This ensures the page is treated as a Client Component
import React, { useEffect, useState } from 'react';

// Define types for the nominee, rating, position, institution, and district
interface Rating {
    id: number;
    userId: number;
    nomineeId: number;
    ratingCategoryId: number;
    score: number;
    severity: number;
    evidence: string | null;
    createdAt: string;
    ratingCategory: RatingCategory
}

interface RatingCategory {
    id: number
    keyword: String
    name: String
    icon: String
    description: String
    weight: number
    examples: String[]
    // impactAreas: ImpactArea[]
    // departments: Department[]

    // NomineeRating: NomineeRating[]

    // InstitutionRating: InstitutionRating[]
    createdAt: String
}

interface Position {
    id: number;
    name: string;
    createdAt: string;
}

interface Institution {
    id: number;
    name: string;
    createdAt: string;
}

interface District {
    id: number;
    name: string;
    region: string;
    createdAt: string;
}

interface Nominee {
    id: number;
    name: string;
    positionId: number;
    institutionId: number;
    districtId: number;
    status: boolean;
    evidence: string | null;
    createdAt: string;
    rating: Rating[];
    position: Position;
    institution: Institution;
    district: District;
}

interface NomineeResponse {
    count: number;
    pages: number;
    currentPage: number;
    data: Nominee[];
}

// Functional component to fetch and display nominees
const NomineeList: React.FC = () => {
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
        });

    }, []);

    // Render the ratings for a nominee
    const renderNomineeRating = (ratings: Rating[]) => {
        if (ratings.length === 0) {
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Nominees ({meta.count})</h1>
            </div>

            <div className="space-y-6">
                {nominees.map((nominee) => (
                    <div
                        key={nominee.id}
                        className="bg-white rounded-lg shadow-md p-6"
                    >
                        <h2 className="text-xl text-cyan-700 font-semibold mb-2">{nominee.name}</h2>
                        <div className="text-gray-600 mb-2">
                            {nominee.position.name} at {nominee.institution.name}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            {nominee.rating.length > 0}
                            <div>{renderNomineeRating(nominee.rating)}</div>
                        </div>
                        <p className="mt-4 text-blue-700">Votes: {nominee.rating.length}</p>
                        <p className="mt-4 text-gray-700">{nominee.evidence}</p>
                        
                    </div>

                ))}
            </div>

            {meta.pages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                    {Array.from({ length: meta.pages }).map((_, i) => {
                        const pageNumber = i + 1
                        const isCurrentPage = pageNumber === (meta.currentPage ? (meta.currentPage) : 1)

                        return (
                            <a
                                key={i}
                                href={`/nominees?page=${pageNumber}`}
                                className={`px-4 py-2 rounded ${isCurrentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNumber}
                            </a>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default NomineeList;
