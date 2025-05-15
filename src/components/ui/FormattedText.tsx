import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import React from 'react';

interface FormattedTextProps {
  value: PortableTextBlock[] | undefined;
  className?: string;
}

interface MarkComponentProps {
  children: React.ReactNode;
  value?: {
    active?: boolean;
  };
}

const components = {
  marks: {
    highlight: ({children}: MarkComponentProps) => {
      return (
        <span className="text-foreground font-medium">
          {children}
        </span>
      );
    },
    strong: ({children}: MarkComponentProps) => {
      return (
        <span className="text-foreground font-medium">
          {children}
        </span>
      );
    },
  }
};

export function FormattedText({ value, className = "" }: FormattedTextProps) {
  if (!value) return null;
  
  return (
    <div className={`text-muted-foreground ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}