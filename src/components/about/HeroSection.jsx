import HeroDecorations from "./HeroDecorations";
import HeroIntro from "./HeroIntro";
import HeroPhoto from "./HeroPhoto";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 lg:pt-20 pb-24">

      {/* Background Decorations */}

      <HeroDecorations />

      {/* Hero Content */}

      <div className="relative z-20 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}

        <HeroIntro />

        {/* Right */}

        <HeroPhoto />

      </div>

    </section>
  );
}