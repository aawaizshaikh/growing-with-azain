import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";

import StoryTrain from "../components/common/StoryTrain";
import DiaryIntro from "../components/DiaryIntro";



export default function Home() {

  return (

    <>

      {!sessionStorage.getItem("azainDiaryIntroShown") && (
  <DiaryIntro
    onComplete={() => {
      sessionStorage.setItem(
        "azainDiaryIntroShown",
        "true"
      );
    }}
  />
)}


      {/* =========================================================
          EXISTING HOMEPAGE
          ========================================================= */}

      <main className="
        bg-[#FAF8F2]
        min-h-screen
        p-4
        lg:p-6
      ">


        <div
          className="
            relative
            max-w-[2000px]
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

          </div>



          {/* Cards */}

          <FeatureCards />



          {/* Footer */}

          <Footer />


        </div>


      </main>

    </>

  );

}