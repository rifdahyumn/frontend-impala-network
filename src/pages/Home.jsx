import YearlyComparison from "../components/Home/YearlyComparison";
import Analytics from "../components/Analytics/Analytics";
import StatsCards from "../components/Home/StatsCards";
import Header from "../components/Layout/Header";
import MemberGrowthDetails from "../components/Analytics/MemberGrowthDetails";

const Home = () => {
    return (
        <div className='flex min-h-screen bg-gray-100 overflow-x-hidden'>
            <div className='flex-1 p-6 overflow-x-hidden'>
                <Header />
                <StatsCards />
                <Analytics />
                <YearlyComparison />
                <MemberGrowthDetails />
            </div>     
        </div>
    )
}

export default Home;