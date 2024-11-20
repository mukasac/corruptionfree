// app/submit/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Building } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        Submit a Corruption Rating
      </h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Link href="/nominate">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardHeader>
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle className="text-2xl">Rate an Official</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Submit evidence and rate corrupt officials based on various metrics including bribery, embezzlement, and nepotism.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>• Rate individual government officials</li>
                <li>• Provide detailed evidence</li>
                <li>• Score across multiple corruption categories</li>
                <li>• Link officials to their institutions</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rate-institution">
          <Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardHeader>
              <Building className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle className="text-2xl">Rate an Institution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Rate and expose systematic corruption within government institutions and organizations.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>• Rate government institutions</li>
                <li>• Document institutional corruption</li>
                <li>• Evaluate systemic issues</li>
                <li>• Track institutional performance</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}