
export interface CaseStudy {
    id: string;
    region: 'India' | 'China' | 'USA' | 'EU' | 'Global';
    budgetTier: 'Low' | 'Medium' | 'High';
    title: string;
    summary: string;
    impactMetric: string;
    referenceLink?: string;
    tags: string[];
}

export const GLOBAL_CASE_STUDIES: CaseStudy[] = [
    // Low Budget / Developing Nations
    {
        id: 'IND-01',
        region: 'India',
        budgetTier: 'Low',
        title: 'Community Health Worker (ASHA) Network',
        summary: 'Deployment of trained female community health activists to bridge the gap between the community and the public health system.',
        impactMetric: 'Reduced infant mortality by 15% in pilot districts',
        referenceLink: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6691438/',
        tags: ['human-centric', 'rural', 'maternal-health']
    },

    // Medium Budget / Emerging
    {
        id: 'CHN-01',
        region: 'China',
        budgetTier: 'Medium',
        title: 'AI-Enhanced Rural Telemedicine',
        summary: 'Deployment of AI-assisted diagnostic tools in village clinics to support local healthcare workers and connect to urban specialists.',
        impactMetric: 'Diagnostic accuracy improved by 40% in remote areas',
        referenceLink: 'https://www.sciencedirect.com/science/article/abs/pii/S0033350619301118',
        tags: ['ai', 'telehealth', 'rural']
    },

    // High Budget / Developed
    {
        id: 'EU-01',
        region: 'EU',
        budgetTier: 'High',
        title: 'Fraunhofer Mobile Health Labs (Germany)',
        summary: 'Mobile diagnostic units bringing hospital-grade lab analysis and digital connectivity to underserved rural populations.',
        impactMetric: 'Reduced patient travel need by 70%',
        referenceLink: 'https://www.fraunhofer.de/en/press/research-news/2023/november-2023/improving-healthcare-in-rural-areas.html',
        tags: ['mobile-health', 'diagnostics', 'rural', 'data']
    }
];

export interface StrategyRecommendation {
    strategy: string;
    relevantCaseStudies: CaseStudy[];
    estimatedImpact: string;
}

export function getStrategicInsights(
    medicalDesertCount: number,
    budget: 'Low' | 'Medium' | 'High'
): StrategyRecommendation[] {
    const recommendations: StrategyRecommendation[] = [];

    // Filter case studies by budget tier only (since we only have Ghana as app context)
    const relevantStudies = GLOBAL_CASE_STUDIES.filter(cs => cs.budgetTier === budget);

    if (budget === 'Low') {
        recommendations.push({
            strategy: 'Community-Based Health Networks',
            relevantCaseStudies: relevantStudies,
            estimatedImpact: 'Immediate coverage of basic vitals monitoring & maternal health'
        });
    } else if (budget === 'Medium') {
        recommendations.push({
            strategy: 'Tech-Enabled Logistics & Telemedicine',
            relevantCaseStudies: relevantStudies,
            estimatedImpact: 'Reduction of critical supply stockouts by ~90% & improved diagnostic accuracy'
        });
    } else if (budget === 'High') {
        recommendations.push({
            strategy: 'Advanced Mobile Specialized Care Units',
            relevantCaseStudies: relevantStudies,
            estimatedImpact: 'Hospital-grade diagnostics reachable within 30 mins'
        });
    }

    return recommendations;
}
