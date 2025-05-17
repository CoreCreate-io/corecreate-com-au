'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/sanity/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  ChevronRight, 
  Menu, 
  Grid 
} from "lucide-react";
import { client } from '@/sanity/lib/client';
import { Container } from '@/components/layout/container';
import { MobileMenuDrawer } from './MobileMenuDrawer'; // Import the new component

// Interface for category data structure
interface Category {
  title: string;
  slug: {
    current: string;
  };
  featuredImage?: {
    asset: {
      _ref: string;
      url: string;
    }
  };
  description?: string;
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch categories from Sanity
  useEffect(() => {
    async function fetchCategories() {
      try {
        // Query for creative field categories
        const query = `*[_type == "category" && categoryType == "creativeField"] | order(order asc) {
          title,
          slug,
          description,
          "featuredImage": {
            "asset": {
              "_ref": featuredImage.asset._ref,
              "url": featuredImage.asset->url
            }
          }
        }`;
        
        const fetchedCategories = await client.fetch(query);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategories();
  }, []);
  
  // Change header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 py-4 transition-all duration-300">
        {/* Always use the same structure, just change visual styles */}
        <div className={cn(
          "mx-auto max-w-[calc(100%-2rem)] lg:max-w-[1380px] rounded-xl transition-all duration-300 py-0 md:py-3",
          isScrolled 
            ? 'bg-black/60 backdrop-blur-sm shadow-lg' // Changed to black with 60% opacity
            : 'bg-transparent'
        )}>
          <Container className="flex items-center justify-between h-16">
            {/* Logo - Use direct SVG file reference */}
            <Link href="/" className="flex items-center">
              {/* Mobile Logo */}
              <Image 
                src="/CCSiteLogo.svg" 
                alt="CoreCreate Logo" 
                width={150} 
                height={40} 
                className="h-8 w-auto md:hidden"
                priority
              />
              
              {/* Desktop Logo */}
              <Image 
                src="/CCSiteLogo.svg" 
                alt="CoreCreate Logo" 
                width={200} 
                height={50} 
                className="hidden md:block h-10 w-auto" 
                priority
              />
            </Link>
            
            {/* Navigation using Shadcn Navigation Menu */}
            <div className="hidden md:flex items-center">
              {/* Navigation Menu */}
              <NavigationMenu className="mr-8">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/about" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(
                        "text-white hover:text-primary transition-colors px-4 py-2",
                        pathname === '/about' ? 'font-medium' : ''
                      )}>
                        About
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="NavigationMenuTrigger text-white hover:text-[#BAFF00] bg-transparent hover:bg-[#111111] focus:bg-[#111111] data-[state=open]:bg-[#111111] data-[state=open]:text-[#BAFF00]"
                    >
                      Projects
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      {/* Updated stacked menu with thumbnails - no hover cards */}
                      <div className="flex flex-col p-4 w-[350px]">
                        <Link href="/projects" className="flex items-center p-3 hover:bg-muted rounded-md mb-2">
                          <div className="w-12 h-12 bg-primary/20 rounded-md flex items-center justify-center mr-4">
                            <Grid size={20} />
                          </div>
                          <div>
                            <div className="font-medium">All Projects</div>
                            <div className="text-muted-foreground text-xs">Browse our complete portfolio</div>
                          </div>
                        </Link>
                        
                        {isLoading ? (
                          <div className="p-4 text-center">
                            <p>Loading categories...</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {categories.map((category) => (
                              <Link 
                                key={category.slug.current} 
                                href={`/projects/${category.slug.current}`} 
                                className="flex items-center p-3 hover:bg-muted rounded-md"
                              >
                                {/* Thumbnail */}
                                <div className="w-12 h-12 overflow-hidden rounded-md mr-4 flex-shrink-0">
                                  {category.featuredImage?.asset?.url ? (
                                    <Image 
                                      src={category.featuredImage.asset.url}
                                      alt={category.title}
                                      width={48}
                                      height={48}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Title */}
                                <span className="flex-grow">{category.title}</span>
                                
                                {/* Arrow */}
                                <ChevronRight className="ml-2 h-4 w-4 opacity-70" />
                              </Link>
                            ))}
                          </div>
                        )}
                        
                        {/* View All Work button */}
                        <Link 
                          href="/projects"
                          className="mt-4 flex items-center justify-center py-3 bg-[#BAFF00] text-black hover:bg-[#9ede00] rounded-md font-medium transition-colors"
                        >
                          View All Work
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              {/* CTA Buttons - Pill format */}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/contact" 
                  className="hidden sm:inline-flex items-center justify-center px-6 py-2 border border-white text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  Work with us
                </Link>
                
                <Link 
                  href="/signin"
                  className="inline-flex items-center justify-center px-6 py-2 bg-[#BAFF00] text-black hover:bg-[#9ede00] rounded-full transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
            
            {/* Mobile Menu Button - Replace with Lucide Menu icon */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </Container>
        </div>
      </header>
      
      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        isLoading={isLoading}
      />
    </>
  );
}

export default Header;