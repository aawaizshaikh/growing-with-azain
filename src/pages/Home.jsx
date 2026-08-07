import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";

import StoryTrain from "../components/common/StoryTrain";
import StoryTransition from "../components/common/StoryTransition";


export default function Home() {

  return (

    <main className="
      bg-[#FAF8F2]
      min-h-screen
      p-4
      lg:p-6
    ">


      <div
        className="
          relative
          max-w-[1600px]
          mx-auto
          bg-white
          rounded-[40px]
          shadow-2xl
          overflow-hidden
        "
      >


        {/* Navigation */}

        <Navbar />



        {/* Hero */}

        <div className="pt-10 lg:pt-16">

          <Hero />

        </div>



        {/* Story Train */}

        <div
          className="
            relative
            -mt-16
            mb-2
            z-20
          "
        >

          <StoryTrain />

          <StoryTransition />

        </div>



        {/* Cards */}

        <FeatureCards />



        {/* Footer */}

        <Footer />


      </div>


    </main>

  );

}