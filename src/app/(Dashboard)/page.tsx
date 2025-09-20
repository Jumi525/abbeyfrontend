import {
  Users,
  MessageCircle,
  TrendingUp,
  Shield,
  Globe,
  Zap,
} from "lucide-react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Professional Networking",
      description:
        "Connect with industry professionals and expand your network globally.",
    },
    {
      icon: MessageCircle,
      title: "Smart Messaging",
      description:
        "Communicate efficiently with integrated messaging and collaboration tools.",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description:
        "Track your professional growth and discover new opportunities.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your data is secure with enterprise-grade privacy protection.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Connect with professionals from around the world in any industry.",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "Stay updated with real-time notifications and industry insights.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Product Manager at TechCorp",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
      quote:
        "SocialPro has transformed how I network professionally. The connections I've made here have been invaluable for my career growth.",
    },
    {
      name: "Michael Chen",
      title: "Software Engineer at StartupXYZ",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
      quote:
        "The platform's focus on professional relationships makes it easy to find mentors and collaborate on projects.",
    },
    {
      name: "Emily Rodriguez",
      title: "UX Designer at DesignCo",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
      quote:
        "I love how clean and professional the interface is. It feels like a platform built specifically for serious professionals.",
    },
  ];

  return (
    <section className="min-h-screen bg-white">
      <Hero />
      <Features features={features} />
      <Testimonials testimonials={testimonials} />
      <Cta />
      <Footer />
    </section>
  );
}
