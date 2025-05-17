'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/sanity/lib/utils';
import { X, ChevronRight } from "lucide-react";

// Category type for props
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

// Props for the MobileMenuDrawer component
interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  isLoading: boolean;
}

export function MobileMenuDrawer({ isOpen, onClose, categories, isLoading }: MobileMenuDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 md:hidden transition-opacity duration-300", 
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Overlay with fade animation */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose} 
      />
      
      {/* Drawer with slide animation */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-full h-full bg-[#111111] flex flex-col overflow-y-auto transition-transform duration-300 ease-out",
          isOpen ? "transform translate-x-0" : "transform translate-x-full"
        )}
      >
        {/* Header with logo and close button */}
        <div className="flex items-center justify-between p-4 md:py-3 border-b border-white/10">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <Image 
              src="/CCSiteLogo.svg" 
              alt="CoreCreate Logo" 
              width={150} 
              height={40} 
              className="h-8 w-auto"
              priority
            />
          </Link>
          <button 
            className="text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation Links - with staggered entrance animation */}
        <div className="flex-1 px-4 py-6 space-y-6">
          <Link 
            href="/about" 
            className={cn(
              "flex items-center justify-between py-2 text-xl text-white hover:text-[#BAFF00] border-b border-white/10 w-full transition-colors",
              isOpen && "animate-fadeInUp animation-delay-100"
            )}
            onClick={onClose}
          >
            <span>About</span>
            <ChevronRight className="h-5 w-5 opacity-70" />
          </Link>
          
          {/* Projects Section */}
          <div className={cn(
            "space-y-4",
            isOpen && "animate-fadeInUp animation-delay-200"
          )}>
            <Link
              href="/projects"
              className="flex items-center justify-between py-2 text-xl text-white hover:text-[#BAFF00] border-b border-white/10 w-full transition-colors"
              onClick={onClose}
            >
              <span>Projects</span>
              <ChevronRight className="h-5 w-5 opacity-70" />
            </Link>
            
            {/* Categories list */}
            <div className="pl-4 space-y-4">
              {isLoading ? (
                <div className="py-2 text-sm text-white/60">Loading categories...</div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <Link
                      key={category.slug.current}
                      href={`/projects/${category.slug.current}`}
                      className={cn(
                        "flex items-center py-2 text-white/80 hover:text-[#BAFF00] transition-colors",
                        isOpen && `animate-fadeInUp animation-delay-${300 + (index * 50)}`
                      )}
                      onClick={onClose}
                    >
                      {/* Category thumbnail */}
                      <div className="w-10 h-10 overflow-hidden rounded-md mr-3 flex-shrink-0">
                        {category.featuredImage?.asset?.url ? (
                          <Image 
                            src={category.featuredImage.asset.url}
                            alt={category.title}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center rounded-md">
                            <span className="text-xs text-white/60">No image</span>
                          </div>
                        )}
                      </div>
                      <span className="text-base">{category.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom CTA Buttons - Changed to side-by-side */}
        <div className={cn(
          "px-4 py-6 border-t border-white/10",
          isOpen && "animate-fadeInUp animation-delay-600" 
        )}>
          <div className="flex items-center space-x-4">
            <Link 
              href="/contact" 
              className="flex-1 flex items-center justify-center px-6 py-3 border border-white text-white hover:bg-white/5 rounded-full transition-all text-center"
              onClick={onClose}
            >
              Work with us
            </Link>
            
            <Link 
              href="/signin"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-[#BAFF00] text-black hover:bg-[#9ede00] rounded-full transition-all font-medium text-center"
              onClick={onClose}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}