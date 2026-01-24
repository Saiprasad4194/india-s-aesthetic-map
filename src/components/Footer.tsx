const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="flex h-4 gap-0.5">
              <div className="w-4 bg-secondary rounded-l" />
              <div className="w-4 bg-white border-y border-border" />
              <div className="w-4 bg-success rounded-r" />
            </div>
            <span className="text-xs text-muted-foreground">
              AI Parliament - Law Impact Analysis System
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
