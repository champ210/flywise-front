import React, { useRef, useState } from 'react';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

declare const jspdf: any;

const ProjectSpecification: React.FC = () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isPdfDownloading, setIsPdfDownloading] = useState(false);
    const [isCsvDownloading, setIsCsvDownloading] = useState(false);

    const handleDownloadPdf = () => {
        if (!contentRef.current) return;
        setIsPdfDownloading(true);

        try {
            const doc = new jspdf.jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            // The title is outside the contentRef, so we add it manually for a better header.
            doc.setFontSize(24).setFont('helvetica', 'bold').text('Project Plan: FlyWise.AI', 40, 60);

            doc.html(contentRef.current, {
                callback: function (doc: any) {
                    doc.save('FlyWise-AI-Project-Specification.pdf');
                    setIsPdfDownloading(false);
                },
                x: 40,
                y: 90, // Start below the manually added title
                width: 515, // A4 width (595pt) - margins (40pt * 2)
                windowWidth: 1000, // Use a wider window for rendering to avoid cramped tables
                autoPaging: 'text',
            });
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Sorry, there was an error generating the PDF.");
            setIsPdfDownloading(false);
        }
    };

    const handleDownloadCsv = () => {
        setIsCsvDownloading(true);

        const budgetData = [
            ['Item', 'Type', 'Estimated Cost (Year 1)', 'Notes'],
            ['Domain Name', 'One-Time', '$15 - $20', 'Purchase of a .com or .ma domain.'],
            ['Web Hosting', 'Recurring', '$0 (initially)', "Vercel/Netlify's free tiers are sufficient for launch."],
            ['Backend (Xano)', 'Recurring', '~$67/month ($804/year)', 'The "Launch" plan is required for a production app. Main fixed cost.'],
            ['AI API (Google Gemini)', 'Recurring', '$20+/month (scales)', 'Pay-as-you-go. Image generation is a key cost to monitor.'],
            ['Apple Developer Program', 'Recurring', '$99/year', 'Required to publish on the Apple App Store.'],
            ['Google Play Developer', 'One-Time', '$25', 'A one-time fee to publish on the Google Play Store.'],
            ['Email Service', 'Recurring', '$0 (initially)', 'Services like Resend or Brevo offer generous free tiers.'],
            ['Contingency Fund', 'Buffer', '$200 - $300', 'For unforeseen costs.'],
            ['Total Estimated (Year 1)', 'Total', '~$1,200 - $1,500', 'A lean, realistic budget for the first year of operation.'],
        ];

        const escapeCsvCell = (cell: string) => {
            const strCell = String(cell);
            if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        };

        const csvContent = budgetData.map(row => row.map(escapeCsvCell).join(',')).join('\n');
        
        // Simulate a short delay for better UX
        setTimeout(() => {
            try {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if ((navigator as any).msSaveBlob) { // IE 10+
                    (navigator as any).msSaveBlob(blob, 'FlyWise-AI-Budget.csv');
                } else {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'FlyWise-AI-Budget.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error("CSV generation failed:", error);
                alert("Sorry, there was an error generating the CSV file.");
            } finally {
                setIsCsvDownloading(false);
            }
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 print:hidden gap-4">
                <h1 className="text-3xl font-bold text-slate-800 text-center sm:text-left">Project Specification</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadCsv}
                        disabled={isCsvDownloading}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 disabled:bg-slate-200"
                    >
                        {isCsvDownloading ? <LoadingSpinner /> : <Icon className="h-5 w-5 mr-2" name="document" />}
                        {isCsvDownloading ? 'Exporting...' : 'Export Budget as CSV'}
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isPdfDownloading}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 disabled:bg-slate-200"
                    >
                        {isPdfDownloading ? <LoadingSpinner /> : <Icon className="h-5 w-5 mr-2" name="download" />}
                        {isPdfDownloading ? 'Generating...' : 'Download as PDF'}
                    </button>
                </div>
            </div>

            <div ref={contentRef} className="prose prose-slate max-w-none prose-h2:border-b prose-h2:pb-2 prose-table:text-sm">
                <h2>1. Executive Summary</h2>
                <p><strong>FlyWise.AI</strong> is a next-generation, AI-powered "super app" for travel, designed to serve as a comprehensive personal travel assistant. The project's mission is to simplify the entire travel lifecycle—from inspiration and planning to booking and sharing memories. By leveraging the Google Gemini API, FlyWise.AI will provide an intuitive, conversational interface that makes complex travel planning accessible to everyone. The platform will be developed as both a web application and a mobile app (iOS & Android) by a single full-stack developer, utilizing a modern, efficient technology stack designed for maximum code reuse and scalability.</p>

                <h2>2. Alignment with INDH Program Goals</h2>
                <p>FlyWise.AI directly supports the core pillars of the INDH by:</p>
                <ul>
                    <li><strong>Promoting Youth Entrepreneurship & Digital Skills:</strong> This project represents a high-tech, AI-driven initiative developed entirely by a single Moroccan developer, showcasing advanced skills in modern software engineering and artificial intelligence.</li>
                    <li><strong>Stimulating Local Economies:</strong> The "Super Services" and "Local Connections" features are designed to directly integrate local Moroccan businesses (restaurants, drivers) and individuals (guides, hosts) into the tourism ecosystem, providing them with a new digital channel to reach travelers.</li>
                    <li><strong>Enhancing the Tourism Sector:</strong> By providing a world-class digital tool, FlyWise.AI enhances Morocco's appeal as a tech-forward travel destination and provides both local and international tourists with a superior planning experience.</li>
                </ul>

                <h2>3. Technology Stack</h2>
                <h4>(Optimized for Solo Developer & Low Cost)</h4>
                <table>
                    <thead>
                        <tr><th>Area</th><th>Technology</th><th>Purpose</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Frontend (Web)</strong></td><td>React & TypeScript</td><td>The current foundation. It's modern, robust, and has a massive ecosystem.</td></tr>
                        <tr><td><strong>Frontend (Mobile)</strong></td><td>React Native (with Expo)</td><td>Allows for over 70% of business logic, API services, and type definitions to be shared between the web and mobile apps, drastically reducing development time.</td></tr>
                        <tr><td><strong>Backend (BaaS)</strong></td><td>Xano</td><td>A scalable, low-code backend that handles the database, user authentication, and business logic without the need to manage servers.</td></tr>
                        <tr><td><strong>AI Engine</strong></td><td>Google Gemini API</td><td>Provides the core intelligence for all features.</td></tr>
                        <tr><td><strong>Deployment (Web)</strong></td><td>Vercel / Netlify</td><td>Offer generous free tiers that are perfect for launching the project with automated CI/CD and CDN.</td></tr>
                        <tr><td><strong>Deployment (Mobile)</strong></td><td>Expo Application Services (EAS) & App Stores</td><td>For building and distributing the mobile applications.</td></tr>
                    </tbody>
                </table>
                
                <h2>4. Project Phases & Timeline Estimation</h2>
                <p>This timeline is based on a single, dedicated full-stack developer. It is ambitious but achievable by focusing on one platform (web) first, followed by mobile, and leveraging code reuse.</p>

                <h3>Phase 1: Minimum Viable Product (MVP) - The Core Experience</h3>
                <p><em>(Estimated Time: 2 - 3 Months)</em></p>
                <ul>
                    <li><strong>Goal:</strong> Launch a functional web application with the core search and user management features.</li>
                    <li><strong>Tasks:</strong> Finalize UI/UX, implement user authentication, build Chat Interface and Results Display, implement My Trips functionality.</li>
                    <li><strong>Backend:</strong> Set up Xano database tables and API endpoints for auth and trips.</li>
                    <li><strong>Deployment:</strong> Deploy the React web app to Vercel/Netlify.</li>
                </ul>

                <h3>Phase 2: The AI Planner & Mobile Foundation</h3>
                <p><em>(Estimated Time: +2 Months)</em></p>
                <ul>
                    <li><strong>Goal:</strong> Introduce the AI Itinerary Planner and begin mobile development.</li>
                    <li><strong>Tasks (Web):</strong> Develop the Itinerary Planner UI and integrate Gemini API.</li>
                    <li><strong>Tasks (Mobile):</strong> Set up a monorepo to share code. Port core UI components to React Native and implement authentication.</li>
                </ul>

                <h3>Phase 3: The Social & Super App Expansion</h3>
                <p><em>(Estimated Time: +3 Months)</em></p>
                <ul>
                    <li><strong>Goal:</strong> Build out community and local service features. Launch the mobile app MVP.</li>
                    <li><strong>Tasks (Web & Mobile):</strong> Develop UI for Social Feed, Super Services, and Local Connections. Launch the mobile app on stores.</li>
                </ul>
                
                <h3>Phase 4: Gamification & Full Feature Parity</h3>
                <p><em>(Estimated Time: +2 Months)</em></p>
                <ul>
                    <li><strong>Goal:</strong> Complete the full "super app" vision and add engagement loops.</li>
                    <li><strong>Tasks (Web & Mobile):</strong> Develop the Social Passport, Group Planning, and Flight Tracker features. Ensure all features are available on both platforms.</li>
                </ul>
                <p><strong>Total Estimated Timeline for Full Vision (Solo Dev):</strong> 9 - 12 Months</p>
                
                <h2>5. Expense & Budget Planning</h2>
                <p>This budget is designed for maximum cost-efficiency, leveraging free tiers wherever possible during development and launch.</p>
                <table>
                    <thead>
                        <tr><th>Item</th><th>Type</th><th>Estimated Cost (Year 1)</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Domain Name</strong></td><td>One-Time</td><td>$15 - $20</td><td>Purchase of a `.com` or `.ma` domain.</td></tr>
                        <tr><td><strong>Web Hosting</strong></td><td>Recurring</td><td>$0 (initially)</td><td>Vercel/Netlify's free tiers are sufficient for launch.</td></tr>
                        <tr><td><strong>Backend (Xano)</strong></td><td>Recurring</td><td>~$67/month ($804/year)</td><td>The "Launch" plan is required for a production app. Main fixed cost.</td></tr>
                        <tr><td><strong>AI API (Google Gemini)</strong></td><td>Recurring</td><td>$20+/month (scales)</td><td>Pay-as-you-go. Image generation is a key cost to monitor.</td></tr>
                        <tr><td><strong>Apple Developer Program</strong></td><td>Recurring</td><td>$99/year</td><td>Required to publish on the Apple App Store.</td></tr>
                        <tr><td><strong>Google Play Developer</strong></td><td>One-Time</td><td>$25</td><td>A one-time fee to publish on the Google Play Store.</td></tr>
                        <tr><td><strong>Email Service</strong></td><td>Recurring</td><td>$0 (initially)</td><td>Services like Resend or Brevo offer generous free tiers.</td></tr>
                        <tr><td><strong>Contingency Fund</strong></td><td>Buffer</td><td>$200 - $300</td><td>For unforeseen costs.</td></tr>
                        <tr><td><strong>Total Estimated (Year 1)</strong></td><td><strong>Total</strong></td><td><strong>~$1,200 - $1,500</strong></td><td>A lean, realistic budget for the first year of operation.</td></tr>
                    </tbody>
                </table>
                
                <h2>6. Risks & Mitigation</h2>
                <ul>
                    <li><strong>Risk:</strong> Solo Developer Bottleneck.<br/><strong>Mitigation:</strong> A phased rollout (MVP first) is crucial. Sticking to the React/React Native ecosystem minimizes context switching and maximizes efficiency.</li>
                    <li><strong>Risk:</strong> API Usage Costs (Gemini/Xano) scaling unexpectedly.<br/><strong>Mitigation:</strong> Implement client-side caching to reduce redundant API calls. Set up budget alerts in Google Cloud and monitor Xano logs.</li>
                    <li><strong>Risk:</strong> Rejection from App Stores.<br/><strong>Mitigation:</strong> Thoroughly test against store guidelines. Allocate 1-2 weeks in the timeline specifically for submission and review.</li>
                </ul>
            </div>
        </div>
    );
};

export default ProjectSpecification;
