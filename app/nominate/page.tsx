"use client";
import { useState, useEffect } from "react";
import { RatingCategory, District, Position, Institution } from "@/types/interfaces";
import { useRouter } from "next/navigation";

export default function CreateNomineePage() {
    const router = useRouter();
    const [categories, setCategories] = useState<RatingCategory[]>([]);
    const [ratings, setRatings] = useState<{ ratingCategoryId: number; score: number; severity: number; evidence: string; }[]>([]);
    const [nomineeName, setNomineeName] = useState<string>("");
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [institutionId, setInstitutionId] = useState<number | null>(null);
    const [positionId, setPositionId] = useState<number | null>(null);
    const [districtId, setDistrictId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            const categoriesRes = await fetch("/api/ratingcategories/");
            const categoriesData = await categoriesRes.json();
            setCategories(categoriesData.data);

            const institutionsRes = await fetch("/api/institutions/");
            const institutionsData = await institutionsRes.json();
            setInstitutions(await institutionsData.data);

            const positionsRes = await fetch("/api/positions/");
            const positionsData = await positionsRes.json();
            setPositions(await positionsData.data);

            const districtsRes = await fetch("/api/districts/");
            const districtsData = await districtsRes.json();
            setDistricts(await districtsData.data);
        }

        fetchData();
    }, []);

    const handleRate = (categoryId: number, score: number, severity: number, evidence: string) => {
        setRatings((prev) => {
            const existing = prev.find((r) => r.ratingCategoryId === categoryId);
            if (existing) {
                return prev.map((r) => (r.ratingCategoryId === categoryId ? { ...r, score, severity, evidence } : r));
            }
            return [...prev, { ratingCategoryId: categoryId, score, severity, evidence }];
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nomineeData: {
                name: nomineeName,
                institutionId: institutionId,
                positionId: positionId,
                districtId: districtId,
            },
            ratings: ratings.map((rating) => ({
                userId: 1, // Example user ID; replace with actual value
                ...rating,
                severity: Math.floor(Math.random() * 5) + 1, // Dummy severity value
                evidence: 'Example evidence for rating', // Replace with actual evidence
            })),
        };

        const response = await fetch("/api/nominees/rate/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            router.push("/nominees");
        } else {
            console.error("Error submitting nominee:", await response.json());
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Nominee</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <label>
                        Name:
                        <input type="text" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} required />
                    </label>
                    <label>
                        Institution:
                        <select value={institutionId || ""} onChange={(e) => setInstitutionId(Number(e.target.value))} required>
                            <option value="">Select Institution</option>
                            {institutions.map((institution) => (
                                <option key={institution.id} value={institution.id}>{institution.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Position:
                        <select value={positionId || ""} onChange={(e) => setPositionId(Number(e.target.value))} required>
                            <option value="">Select Position</option>
                            {positions.map((position) => (
                                <option key={position.id} value={position.id}>{position.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        District:
                        <select value={districtId || ""} onChange={(e) => setDistrictId(Number(e.target.value))} required>
                            <option value="">Select District</option>
                            {districts.map((district) => (
                                <option key={district.id} value={district.id}>{district.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

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
                            {[1, 2, 3, 4, 5].map((score) => (
                                <button key={score} type="button" onClick={() => handleRate(category.id, score, 2, "Some evidence")} className={`px-3 py-1 text-gray-600 rounded ${ratings.find((r) => r.ratingCategoryId === category.id && r.score === score)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200'
                                }`}>
                                    {score}
                                </button>
                            ))}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>

                <button type="submit"
                    className="w-full bg-blue-600 text-white py-4 px-8 rounded-md font-medium hover:bg-blue-700 transition-colors"

                >Submit Nominee</button>
            </form>
        </div>
    );
}
