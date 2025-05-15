import { PortableText } from '@portabletext/react';

interface FormattedTextProps {
  value: any;
  className?: string;
}

const components = {
  marks: {
    highlight: ({children}: any) => {
      return (
        <span className="text-foreground font-medium">
          {children}
        </span>
      );
    },
    strong: ({children}: any) => {
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