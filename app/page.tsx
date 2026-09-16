import { Countdown } from "@/components/invitation/Countdown";
import { DateSection } from "@/components/invitation/DateSection";
import { DressCodeSection } from "@/components/invitation/DressCodeSection";
import { FooterSection } from "@/components/invitation/FooterSection";
import { HeroSection } from "@/components/invitation/HeroSection";
import { IntroScreen } from "@/components/invitation/IntroScreen";
import { InvitationMessage } from "@/components/invitation/InvitationMessage";
import { RsvpSection } from "@/components/invitation/RsvpSection";
import { VenueSection } from "@/components/invitation/VenueSection";

export default function Page() {
  return (
    <div className="page-frame">
      <IntroScreen />
      <main className="shell">
        <HeroSection />
        <InvitationMessage />
        <DateSection />
        <Countdown />
        <VenueSection />
        <DressCodeSection />
        <RsvpSection />
        <FooterSection />
      </main>
    </div>
  );
}
