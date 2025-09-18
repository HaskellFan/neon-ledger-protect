import { Calendar, Clock, DollarSign, Shield } from "lucide-react";

export const Footer = () => {
  const paydayMarkers = [
    { date: "Jan 15", status: "completed", amount: "Processing" },
    { date: "Jan 31", status: "completed", amount: "Distributed" },
    { date: "Feb 15", status: "pending", amount: "Encrypted" },
    { date: "Feb 28", status: "upcoming", amount: "Scheduled" },
    { date: "Mar 15", status: "upcoming", amount: "Scheduled" },
    { date: "Mar 31", status: "upcoming", amount: "Scheduled" },
  ];

  return (
    <footer className="bg-surface border-t border-card-border mt-12">
      <div className="container mx-auto px-6 py-8">
        {/* Rotating Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-6 text-center neon-cyan">
            Payroll Timeline
          </h3>
          
          <div className="relative">
            {/* Central rotating element */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/30 animate-rotate-timeline">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-neon-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-neon-green rounded-full absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="w-1 h-1 bg-neon-blue rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-accent animate-neon-pulse" />
                </div>
              </div>
            </div>

            {/* Timeline markers */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {paydayMarkers.map((marker, index) => (
                <div
                  key={marker.date}
                  className={`payroll-card p-4 text-center animate-fade-in-neon`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className={`w-4 h-4 mr-2 ${
                      marker.status === 'completed' ? 'text-success' :
                      marker.status === 'pending' ? 'text-warning' :
                      'text-muted-foreground'
                    }`} />
                    <span className="text-sm font-medium">{marker.date}</span>
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    marker.status === 'completed' ? 'bg-success/20 text-success' :
                    marker.status === 'pending' ? 'bg-warning/20 text-warning' :
                    'bg-muted/20 text-muted-foreground'
                  }`}>
                    {marker.amount}
                  </div>
                  
                  <div className={`mt-2 h-1 w-full rounded-full ${
                    marker.status === 'completed' ? 'bg-success' :
                    marker.status === 'pending' ? 'bg-warning animate-neon-pulse' :
                    'bg-muted'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-card-border pt-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span>Encrypted Payroll System</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>FHE Protected</span>
            </div>
          </div>
          <p className="mt-2 text-xs">
            All payroll data is encrypted using Fully Homomorphic Encryption until distribution
          </p>
        </div>
      </div>
    </footer>
  );
};