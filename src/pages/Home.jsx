import YearlyComparison from "../components/Home/QuarterlyComparison";
import Analytics from "../components/Analytics/Analytics";
import StatsCards from "../components/Home/StatsCards";
import Header from "../components/Layout/Header";
import MemberGrowthDetails from "../components/Analytics/MemberGrowthDetails";

const Home = () => {
    return (
        <div className='flex pt-20 min-h-screen bg-gray-100 overflow-x-hidden'>
            <div className='flex-1 p-6 overflow-x-hidden'>
                {/* <StatsCards /> */}
                <Analytics />
                <YearlyComparison />
                <MemberGrowthDetails />
            </div>     
        </div>
    )
}

export default Home;