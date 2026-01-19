const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground max-w-2xl">
              This interface is designed for{" "}
              <strong className="text-foreground">classroom and academic evaluation</strong>. 
              It demonstrates how AI can help governments{" "}
              <strong className="text-foreground">structure their thinking</strong>{" "}
              around the impact of new laws, while keeping every step{" "}
              <strong className="text-foreground">transparent and explainable</strong>.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex h-4 gap-0.5">
              <div className="w-4 bg-secondary rounded-l" />
              <div className="w-4 bg-white border-y border-border" />
              <div className="w-4 bg-success rounded-r" />
            </div>
            <span className="text-xs text-muted-foreground">
              No real government data used
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
