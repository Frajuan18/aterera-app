import { Navbar } from './components/Navbar'
import HeroSection  from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import HowItWorks from './components/HowItWorks'
import PricingSection from './components/PricingSection'
import ProblemSolution from './components/ProblemSolution'
import FAQSection from './components/FAQSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-[#050505] min-h-screen w-full">
      <Navbar />
      <HeroSection />
      <ProblemSolution/>
      <FeaturesSection/>
      <HowItWorks/>
      <PricingSection/>
      <FAQSection/>
      <ContactSection/>
      <Footer/>
    </div>
  )
}

export default App